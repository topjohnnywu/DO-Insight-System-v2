let unassignedDOs = [];
let trucks = {};
let truckCounter = 1;
let truckMeta = {};

document.addEventListener("DOMContentLoaded", () => {
    initData();
});

function initData() {
    const rawDataStr = localStorage.getItem("LastUploadedDoSummary");
    if (!rawDataStr) {
        document.getElementById("unassignedTableBody").innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 30px;">No DO Summary uploaded. Please go to Summary Analytics and upload your DO Summary first.</td></tr>`;
        return;
    }

    try {
        const rawData = JSON.parse(rawDataStr);
        
        // Group by DO Number (inv) to get unique DOs
        const doMap = {};
        rawData.forEach(row => {
            if (!row.inv) return;
            const invStr = String(row.inv);
            if (!doMap[invStr]) {
                doMap[invStr] = {
                    inv: invStr,
                    name: row.name || "Unknown Consignee",
                    vol: parseFloat(row.vol) || 0,
                    remark: row.remark || ""
                };
            }
        });
        
        const allDOs = Object.values(doMap);
        
        // Load saved state if any, else start fresh
        const savedStateStr = localStorage.getItem("ManualTruckAssignments");
        if (savedStateStr) {
            const savedState = JSON.parse(savedStateStr);
            trucks = savedState.trucks || {};
            truckCounter = savedState.truckCounter || 1;
            truckMeta = savedState.truckMeta || {};
            
            // Filter unassigned: allDOs that are NOT in any truck
            const assignedInvs = new Set();
            Object.values(trucks).forEach(truckList => {
                truckList.forEach(doObj => assignedInvs.add(doObj.inv));
            });
            
            unassignedDOs = allDOs.filter(d => !assignedInvs.has(d.inv));
            
            // In case a truck has DOs that are no longer in the uploaded summary, we should technically clean them up,
            // but for now let's just keep them or filter them. Let's filter to ensure validity.
            const allInvSet = new Set(allDOs.map(d => d.inv));
            for (let tId in trucks) {
                trucks[tId] = trucks[tId].filter(d => allInvSet.has(d.inv));
            }
        } else {
            unassignedDOs = [...allDOs];
            addTruck(); // Start with Truck 1
        }
        
        renderUnassignedDOs();
        renderTruckBoards();
        updateTruckDropdown();
        
    } catch (e) {
        console.error("Error parsing DO Summary:", e);
    }
}

function saveState() {
    const state = {
        trucks: trucks,
        truckCounter: truckCounter,
        truckMeta: truckMeta
    };
    localStorage.setItem("ManualTruckAssignments", JSON.stringify(state));
}

function renderUnassignedDOs() {
    const tbody = document.getElementById("unassignedTableBody");
    const searchInput = document.getElementById("unassignedSearch");
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    
    let html = "";
    
    unassignedDOs.forEach(doObj => {
        const searchable = `${doObj.inv} ${doObj.name}`.toLowerCase();
        if (searchTerm && !searchable.includes(searchTerm)) return;
        
        html += `
            <tr>
                <td style="text-align: center;"><input type="checkbox" class="do-checkbox" value="${doObj.inv}"></td>
                <td><span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: bottom;">${doObj.remark ? doObj.inv + " " + doObj.remark : doObj.inv}</span></td>
                <td>${doObj.name}</td>
                <td style="text-align: right; font-family: monospace;">${doObj.vol.toFixed(2)}</td>
            </tr>
        `;
    });
    
    if (unassignedDOs.length === 0) {
        html = `<tr><td colspan="4" style="text-align:center; padding: 20px; color: var(--fg-muted);">All DOs assigned!</td></tr>`;
    }
    
    tbody.innerHTML = html;
}

function toggleAllUnassigned() {
    const masterCb = document.getElementById("selectAllUnassigned");
    const checkboxes = document.querySelectorAll(".do-checkbox");
    checkboxes.forEach(cb => cb.checked = masterCb.checked);
}

function addTruck() {
    const truckId = `truck_${truckCounter}`;
    trucks[truckId] = [];
    truckMeta[truckId] = { size: "40HC", hub: "", dest: "" };
    truckCounter++;
    renderTruckBoards();
    updateTruckDropdown();
    saveState();
}

async function removeTruck(truckId) {
    if (trucks[truckId].length > 0) {
        const confirmed = await window.showConfirmDialog({
            title: "Remove Truck",
            message: "This truck has assigned DOs. Are you sure you want to remove it? DOs will be returned to the unassigned pool.",
            confirmText: "Remove Truck",
            isDanger: true
        });
        if (!confirmed) {
            return;
        }
        unassignedDOs.push(...trucks[truckId]);
    }
    delete trucks[truckId];
    renderUnassignedDOs();
    renderTruckBoards();
    updateTruckDropdown();
    saveState();
}

function updateTruckDropdown() {
    const select = document.getElementById("targetTruckSelect");
    if (!select) return;
    
    let html = "";
    Object.keys(trucks).forEach((tId, index) => {
        const typeStr = index === 0 ? " (Cross Dock)" : " (Direct)";
        html += `<option value="${tId}">Truck ${index + 1}${typeStr}</option>`;
    });
    select.innerHTML = html;
}


window.updateTruckMeta = function(tId, field, value) {
    if (!truckMeta[tId]) truckMeta[tId] = { size: "40HC", hub: "", dest: "" };
    truckMeta[tId][field] = value;
    saveState();
};

function renderTruckBoards() {
    const container = document.getElementById("truckBoardsContainer");
    let html = "";
    
    Object.keys(trucks).forEach((tId, index) => {
        const assignedList = trucks[tId];
        const totalVol = assignedList.reduce((sum, d) => sum + d.vol, 0);
        
        let rowsHtml = "";
        assignedList.forEach(doObj => {
            const tagBadge = doObj.tag === 'cross_dock' 
                ? `<span class="badge" style="background: rgba(167, 139, 250, 0.2); color: #c084fc; font-size: 0.7rem; margin-left: 6px;">Cross Dock</span>`
                : (doObj.tag === 'direct' ? `<span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #38bdf8; font-size: 0.7rem; margin-left: 6px;">Direct</span>` : '');
                
            const hubBadge = (doObj.hub && doObj.hub !== "N/A")
                ? `<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.7rem; margin-left: 6px;">Hub: ${doObj.hub}</span>`
                : '';
                
            rowsHtml += `
                <tr style="background: var(--surface-hover);">
                    <td><span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: bottom;">${doObj.remark ? doObj.inv + " " + doObj.remark : doObj.inv}</span></td>
                    <td style="font-size: 0.85rem;">${doObj.name}${tagBadge}${hubBadge}</td>
                    <td style="text-align: right; font-family: monospace;">${doObj.vol.toFixed(2)}</td>
                    <td style="text-align: center;">
                        <button onclick="unassignDO('${tId}', '${doObj.inv}')" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        if (assignedList.length === 0) {
            rowsHtml = `<tr><td colspan="4" style="text-align:center; padding: 15px; color: #64748b; font-size: 0.9rem;">No DOs assigned yet</td></tr>`;
        }
        
        const typeStr = index === 0 ? " (Cross Dock)" : " (Direct)";
        
        const meta = typeof truckMeta !== 'undefined' && truckMeta[tId] ? truckMeta[tId] : { size: "40HC", hub: "", dest: "" };
        html += `
            <div class="glass-card" style="display: flex; flex-direction: column; max-height: 400px;">
                <div style="padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; background: var(--surface-hover);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <h3 style="margin: 0; font-size: 1.05rem; font-weight: 600; color: var(--fg);">Truck ${index + 1}${typeStr}</h3>
                            <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.8rem;">Vol: ${totalVol.toFixed(2)} m³</span>
                        </div>
                        <button onclick="removeTruck('${tId}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                    <div style="display: flex; gap: 8px; font-size: 0.85rem;">
                        <select onchange="window.updateTruckMeta('${tId}', 'size', this.value)" style="padding: 6px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--fg); font-weight: 500;">
                            <option value="40HC" ${meta.size === '40HC' ? 'selected' : ''}>40HC</option>
                            <option value="20GP" ${meta.size === '20GP' ? 'selected' : ''}>20GP</option>
                            <option value="24FT" ${meta.size === '24FT' ? 'selected' : ''}>24FT</option>
                            <option value="14FT" ${meta.size === '14FT' ? 'selected' : ''}>14FT</option>
                        </select>
                        <input type="text" placeholder="Hub (e.g. HB01)" value="${meta.hub || ''}" onchange="window.updateTruckMeta('${tId}', 'hub', this.value)" style="padding: 6px 10px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--fg); width: 110px;">
                        <input type="text" placeholder="Destination" value="${meta.dest || ''}" onchange="window.updateTruckMeta('${tId}', 'dest', this.value)" style="padding: 6px 10px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--fg); flex: 1;">
                    </div>
                </div>
                <div style="padding: 0; overflow-y: auto; flex: 1;">
                    <table class="data-table" style="width: 100%; margin: 0; border: none;">
                        <tbody style="border: none;">
                            ${rowsHtml}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function assignSelectedDOs() {
    const select = document.getElementById("targetTruckSelect");
    const tagSelect = document.getElementById("doTagSelect");
    const hubInput = document.getElementById("hubNumberInput");
    
    const targetTruckId = select.value;
    const selectedTag = tagSelect ? tagSelect.value : "direct";
    const enteredHub = hubInput ? hubInput.value.trim() : "";
    
    if (!targetTruckId) {
        showToast("Please select a target truck.", "error");
        return;
    }
    
    const checkboxes = document.querySelectorAll(".do-checkbox:checked");
    if (checkboxes.length === 0) {
        showToast("Please select at least one DO to assign.", "error");
        return;
    }
    
    const truckIndex = Object.keys(trucks).indexOf(targetTruckId);
    
    // Tagging Validation
    if (selectedTag === "direct" && truckIndex === 0) {
        showToast("Direct deliveries cannot be assigned to Truck 1. Truck 1 is reserved for Cross Dock.", "error");
        return;
    }
    if (selectedTag === "cross_dock" && truckIndex !== 0) {
        showToast("Cross Dock DOs must be assigned to Truck 1 (Cross Dock).", "error");
        return;
    }
    
    const selectedInvs = Array.from(checkboxes).map(cb => String(cb.value));
    const selectedDOs = unassignedDOs.filter(d => selectedInvs.includes(String(d.inv)));
    const remainingUnassigned = unassignedDOs.filter(d => !selectedInvs.includes(String(d.inv)));
    
    // Apply tag and hub, then move
    selectedDOs.forEach(d => {
        d.tag = selectedTag;
        d.hub = enteredHub || "N/A";
    });
    
    trucks[targetTruckId].push(...selectedDOs);
    unassignedDOs = remainingUnassigned;
    
    document.getElementById("selectAllUnassigned").checked = false;
    if (hubInput) hubInput.value = ""; // Reset hub input after assignment
    
    renderUnassignedDOs();
    renderTruckBoards();
    saveState();
}

function unassignDO(truckId, doInv) {
    const truckList = trucks[truckId];
    const index = truckList.findIndex(d => String(d.inv) === String(doInv));
    if (index !== -1) {
        const doObj = truckList.splice(index, 1)[0];
        unassignedDOs.push(doObj);
        
        renderUnassignedDOs();
        renderTruckBoards();
        saveState();
    }
}




async function exportTruckPlan() {
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
        const meta = typeof truckMeta !== 'undefined' && truckMeta[tId] ? truckMeta[tId] : { size: "", hub: "", dest: "" };
        const metaStrParts = [];
        if (meta.size) metaStrParts.push(`[${meta.size}]`);
        if (meta.hub) metaStrParts.push(`HUB: ${meta.hub.toUpperCase()}`);
        if (meta.dest) metaStrParts.push(`TO: ${meta.dest.toUpperCase()}`);
        const metaStr = metaStrParts.length > 0 ? `  -  ${metaStrParts.join(" | ")}` : "";
        
        wsData.push([
            { v: `(${truckIdx})`, s: styleTruckIdx }, // Col A
            { v: `TRUCK ${truckIdx} (${truckType})${metaStr}`, s: styleTruckName } // Col B
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

async function removeLastTruck() {
    const truckKeys = Object.keys(trucks);
    if (truckKeys.length <= 1) {
        showToast("You cannot remove Truck 1 as it is required for Cross Dock.", "error");
        return;
    }
    
    const lastTruckId = truckKeys[truckKeys.length - 1];
    
    if (trucks[lastTruckId].length > 0) {
        const confirmed = await window.showConfirmDialog({
            title: "Remove Last Truck",
            message: "The last truck has assigned DOs. Are you sure you want to remove it? DOs will be returned to the unassigned pool.",
            confirmText: "Remove Truck",
            isDanger: true
        });
        if (!confirmed) {
            return;
        }
        unassignedDOs.push(...trucks[lastTruckId]);
    }
    
    delete trucks[lastTruckId];
    renderUnassignedDOs();
    renderTruckBoards();
    updateTruckDropdown();
    saveState();
}

async function resetPlan() {
    const confirmed = await window.showConfirmDialog({
        title: "Reset Plan",
        message: "Are you sure you want to completely reset the truck plan? All DOs will be returned to the unassigned pool and all trucks will be deleted.",
        confirmText: "Reset All",
        isDanger: true
    });
    if (!confirmed) {
        return;
    }
    
    // Return all DOs
    for (let tId in trucks) {
        unassignedDOs.push(...trucks[tId]);
    }
    
    // Clear trucks
    trucks = {
        "truck_1": []
    };
    if (typeof truckMeta !== 'undefined') {
        truckMeta = {
            "truck_1": { size: "40HC", hub: "", dest: "" }
        };
    }
    truckCounter = 1;
    
    // Reset search & filters
    const searchInput = document.getElementById("unassignedSearch");
    if (searchInput) searchInput.value = "";
    
    const selectAllCb = document.getElementById("selectAllUnassigned");
    if (selectAllCb) selectAllCb.checked = false;
    
    renderUnassignedDOs();
    renderTruckBoards();
    updateTruckDropdown();
    saveState();
}

window.closeFinalPlan = function() {
    const modal = document.getElementById('finalPlanModal');
    if (modal) modal.style.display = 'none';
};

window.showFinalPlan = function() {
    const modal = document.getElementById('finalPlanModal');
    const content = document.getElementById('finalPlanContent');
    if (!modal || !content) return;
    
    let html = '<div style="font-family: monospace; font-size: 1.1rem; line-height: 1.6; color: var(--fg); background: var(--surface); padding: 20px; border-radius: 8px; border: 1px solid var(--border); white-space: pre-wrap;">';
    
    const truckKeys = Object.keys(trucks);
    if (truckKeys.length === 0) {
        html += 'No trucks planned yet.';
    } else {
        truckKeys.forEach((tId, index) => {
            const assignedList = trucks[tId];
            const meta = typeof truckMeta !== 'undefined' && truckMeta[tId] ? truckMeta[tId] : { size: "40HC", hub: "", dest: "" };
            const isCrossDock = index === 0;
            const typeStr = isCrossDock ? '<span style="color: #ef4444; font-weight: bold;">Top Urgent</span>' : '<span style="color: #22c55e; font-weight: bold;">Direct</span>';
            
            // Extract numbers from size (e.g. "40HC" -> "40") if possible, else use size directly
            const sizeNumMatch = meta.size ? meta.size.match(/\d+/) : null;
            const sizeStr = sizeNumMatch ? sizeNumMatch[0] : (meta.size || "40");
            
            const destStr = meta.dest ? `("${meta.dest}")` : '("Destination")';
            const hubText = meta.hub ? `(${meta.hub})` : '(HUB NUMBER)';
            const hubStr = `<span style="color: navy; font-weight: bold; font-style: italic;">${hubText}</span>`;
            
            let doContent = '';
            if (isCrossDock) {
                doContent = '   ALL 5 ROUTES';
            } else {
                const doArray = assignedList.map(d => `'${d.inv}'`);
                doContent = `DO: ${doArray.join(', ')}`;
            }

            html += `(${index + 1}) 1 x ${sizeStr} ${destStr} (${typeStr})\n`;
            html += `${hubStr}\n`;
            html += `${doContent}\n\n`;
        });
    }
    
    html += '</div>';
    
    content.innerHTML = html;
    modal.style.display = 'flex';
};

window.printFinalPlan = function() {
    const content = document.getElementById('finalPlanContent').innerHTML;
    
    // Create a hidden iframe to hold the print content
    let printIframe = document.getElementById('print-iframe');
    if (!printIframe) {
        printIframe = document.createElement('iframe');
        printIframe.id = 'print-iframe';
        printIframe.style.position = 'absolute';
        printIframe.style.width = '0px';
        printIframe.style.height = '0px';
        printIframe.style.border = 'none';
        document.body.appendChild(printIframe);
    }
    
    const doc = printIframe.contentWindow.document;
    doc.open();
    doc.write('<html><head><title>Print Truck Plan</title>');
    doc.write('<style>');
    doc.write('body { font-family: monospace; font-size: 14px; line-height: 1.6; padding: 20px; white-space: pre-wrap; color: black; }');
    doc.write('@media print { body { padding: 0; } }');
    doc.write('</style>');
    doc.write('</head><body>');
    doc.write(content);
    doc.write('</body></html>');
    doc.close();
    
    // Focus the iframe and trigger print
    setTimeout(() => {
        printIframe.contentWindow.focus();
        printIframe.contentWindow.print();
    }, 250);
};
