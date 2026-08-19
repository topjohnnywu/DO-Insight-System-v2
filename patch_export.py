import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# Find the start of exportTruckPlan
start_idx = content.find('function exportTruckPlan()')
if start_idx != -1:
    content = content[:start_idx]

new_function = """function exportTruckPlan() {
    if (!window.XLSX) {
        showCustomAlert("Excel export library is not loaded.");
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
        showCustomAlert("No DOs have been assigned to any trucks yet.");
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
    const styleConsignee = { font: { bold: true, color: { rgb: "0070C0" } } }; // Blue for Consignee (DIRECT)
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
        
        // Group DOs by Consignee to make the layout clean
        const consigneeGroups = {};
        assignedList.forEach(d => {
            if (!consigneeGroups[d.name]) consigneeGroups[d.name] = [];
            consigneeGroups[d.name].push(d);
        });
        
        for (const cName in consigneeGroups) {
            const dos = consigneeGroups[cName];
            const firstTag = dos[0].tag === 'cross_dock' ? 'CROSS DOCK' : 'DIRECT';
            
            // Consignee Row (e.g., JENLINK (DIRECT))
            wsData.push([
                { v: `${cName.toUpperCase()} (${firstTag})`, s: styleConsignee }
            ]);
            
            // Print each DO under this consignee
            dos.forEach(d => {
                const hubStr = (d.hub && d.hub !== "N/A") ? `(${d.hub})` : `(N/A)`;
                
                wsData.push([
                    { v: hubStr, s: styleHub }
                ]);
                wsData.push([
                    { v: String(d.inv), t: 's', s: styleDoNum } // 's' explicitly stores it as text, causing the Excel green triangle warning for numbers!
                ]);
                wsData.push([
                    { v: `${parseFloat(d.vol.toFixed(2))} m3`, s: styleVol }
                ]);
            });
            
            wsData.push([]); // Space between consignees
        }
        
        wsData.push([]); // Space between trucks
        truckIdx++;
    });
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    
    // Merge cells for ETD (B1:C1)
    ws['!merges'] = [
        { s: { r: 0, c: 1 }, e: { r: 0, c: 2 } }
    ];
    
    // Set column widths to match image proportions
    ws['!cols'] = [
        { wch: 30 }, // Col A (Contains Consignee, Hub, DO, Vol)
        { wch: 45 }, // Col B (Contains ETD, Truck Name)
        { wch: 15 }  // Col C (Empty, used for ETD merge)
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, "Truck Plan");
    const exportDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `DO_Truck_Plan_${exportDate}.xlsx`);
}
"""
content += new_function

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
