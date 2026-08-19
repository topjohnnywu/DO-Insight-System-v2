import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# 1. Update initData to capture remark
content = content.replace(
    'vol: parseFloat(row.vol) || 0\n                };',
    'vol: parseFloat(row.vol) || 0,\n                    remark: row.remark || ""\n                };'
)

# 2. Replace exportTruckPlan entirely
start_idx = content.find('async function exportTruckPlan() {')
if start_idx == -1:
    start_idx = content.find('function exportTruckPlan() {')
    
if start_idx != -1:
    content = content[:start_idx]

new_export_func = """async function exportTruckPlan() {
    if (!window.XLSX) {
        showToast("Excel export library is not loaded.", "error");
        return;
    }
    
    let hasAssignedDOs = false;
    for (let tId in trucks) {
        if (trucks[tId].length > 0) {
            hasAssignedDOs = true;
            break;
        }
    }
    
    if (!hasAssignedDOs) {
        showToast("No DOs have been assigned to any trucks yet.", "error");
        return;
    }
    
    const wb = XLSX.utils.book_new();
    const wsData = [];
    
    // --- Styles ---
    const styleEtd = {
        font: { bold: true, sz: 14 },
        fill: { fgColor: { rgb: "FFFFFF00" } }, // Yellow background
        border: {
            top: { style: "thick", color: { rgb: "000000" } },
            bottom: { style: "thick", color: { rgb: "000000" } },
            left: { style: "thick", color: { rgb: "000000" } },
            right: { style: "thick", color: { rgb: "000000" } }
        },
        alignment: { horizontal: "center", vertical: "center" }
    };
    
    const styleTruckIdx = { font: { bold: true, sz: 12 } };
    const styleTruckName = { font: { bold: true, sz: 12 } };
    const styleConsignee = { font: { bold: true, color: { rgb: "0070C0" } } }; // Blue for Consignee
    const styleHub = { font: { bold: true, italic: true, color: { rgb: "0000FF" } } }; // Blue Italic for Hub
    const styleDoNum = { font: { sz: 11 } };
    const styleVol = { font: { sz: 11 } };
    
    // 1. Add ETD Row
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const dateStr = `${dd}/${mm}/${yyyy}`;
    
    wsData.push([
        null, // Col A
        { v: `ETD:${dateStr}`, s: styleEtd }, // Col B
        null, // Col C
    ]);
    wsData.push([]); // Blank Row 2
    
    let truckIdx = 1;
    Object.keys(trucks).forEach((tId, index) => {
        const assignedList = trucks[tId];
        if (assignedList.length === 0) return;
        
        const truckType = index === 0 ? "CROSS DOCK" : "DIRECT";
        
        // Row: (1)   TRUCK Name
        wsData.push([
            { v: `(${truckIdx})`, s: styleTruckIdx }, // Col A
            { v: `TRUCK ${truckIdx} (${truckType})`, s: styleTruckName } // Col B
        ]);
        
        if (truckType === "CROSS DOCK") {
            const totalTruckVol = assignedList.reduce((sum, d) => sum + (parseFloat(d.vol) || 0), 0);
            wsData.push([
                { v: "ALL 5 ROUTES", s: styleConsignee }
            ]);
            wsData.push([
                { v: `${parseFloat(totalTruckVol.toFixed(2))} m3`, s: styleVol }
            ]);
            wsData.push([]); // Space after truck
            truckIdx++;
            return; // Skip detailed consignee grouping for cross dock
        }
        
        // For DIRECT trucks: Group DOs by Consignee
        const consigneeGroups = {};
        assignedList.forEach(d => {
            if (!consigneeGroups[d.name]) consigneeGroups[d.name] = [];
            consigneeGroups[d.name].push(d);
        });
        
        for (const cName in consigneeGroups) {
            const dos = consigneeGroups[cName];
            const firstTag = "DIRECT";
            
            // Consignee Row (e.g., GOH JOO HIN PTE LTD (DIRECT)) - ALL IN COLUMN A
            wsData.push([
                { v: `${cName.toUpperCase()} (${firstTag})`, s: styleConsignee } // Col A
            ]);
            
            dos.forEach(d => {
                const hubStr = (d.hub && d.hub !== "N/A") ? `(HUB${d.hub.replace(/^HUB/i, '')})` : `(N/A)`;
                wsData.push([
                    { v: hubStr, s: styleHub }
                ]);
                
                // Combine DO number and remark
                const doText = d.remark ? `${d.inv} ${d.remark}` : String(d.inv);
                
                wsData.push([
                    { v: doText, t: 's', s: styleDoNum }
                ]);
                wsData.push([
                    { v: `${parseFloat(d.vol.toFixed(2))} m3`, s: styleVol }
                ]);
            });
        }
        truckIdx++;
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Merge cells for ETD (B1:C1)
    ws['!merges'] = [
        { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }
    ];
    
    // Set column widths
    ws['!cols'] = [
        { wch: 60 }, // Col A (Contains Consignee, Hub, DO + Remark, Vol)
        { wch: 45 }, // Col B (Contains ETD, Truck Name)
        { wch: 15 }  // Col C
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Truck Plan");
    const exportDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `DO_Truck_Plan_${exportDate}.xlsx`);
}
"""
content += new_export_func

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
