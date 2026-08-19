import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# 1. Add truckMeta global
content = content.replace(
    'let truckCounter = 1;',
    'let truckCounter = 1;\nlet truckMeta = {};'
)

# 2. Update initData
initData_search = '''            trucks = savedState.trucks || {};
            truckCounter = savedState.truckCounter || 1;'''
initData_replace = '''            trucks = savedState.trucks || {};
            truckCounter = savedState.truckCounter || 1;
            truckMeta = savedState.truckMeta || {};'''
content = content.replace(initData_search, initData_replace)

initData_fallback_search = '''        } else {
            trucks = {
                "truck_1": []
            };
            truckCounter = 2;
        }'''
initData_fallback_replace = '''        } else {
            trucks = {
                "truck_1": []
            };
            truckMeta = {
                "truck_1": { size: "40HC", hub: "", dest: "" }
            };
            truckCounter = 2;
        }'''
content = content.replace(initData_fallback_search, initData_fallback_replace)

# 3. Update addTruck
addTruck_search = '''    const truckId = `truck_${truckCounter}`;
    trucks[truckId] = [];
    truckCounter++;'''
addTruck_replace = '''    const truckId = `truck_${truckCounter}`;
    trucks[truckId] = [];
    truckMeta[truckId] = { size: "40HC", hub: "", dest: "" };
    truckCounter++;'''
content = content.replace(addTruck_search, addTruck_replace)

# 4. Update saveState
saveState_search = '''function saveState() {
    const state = {
        trucks: trucks,
        truckCounter: truckCounter
    };'''
saveState_replace = '''function saveState() {
    const state = {
        trucks: trucks,
        truckCounter: truckCounter,
        truckMeta: truckMeta
    };'''
content = content.replace(saveState_search, saveState_replace)

# 5. Update renderTruckBoards
# First, insert updateTruckMeta globally
global_func = '''
window.updateTruckMeta = function(tId, field, value) {
    if (!truckMeta[tId]) truckMeta[tId] = { size: "40HC", hub: "", dest: "" };
    truckMeta[tId][field] = value;
    saveState();
};
'''
if 'window.updateTruckMeta' not in content:
    content = content.replace('function renderTruckBoards() {', global_func + '\nfunction renderTruckBoards() {')

render_search = '''                if (assignedList.length === 0) {
            rowsHtml = `<tr><td colspan="4" style="text-align:center; padding: 15px; color: #64748b; font-size: 0.9rem;">No DOs assigned yet</td></tr>`;
        }
        
        const typeStr = index === 0 ? " (Cross Dock)" : " (Direct)";
        
        html += `
            <div class="glass-card" style="display: flex; flex-direction: column; max-height: 400px;">
                <div style="padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--surface-hover);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <h3 style="margin: 0; font-size: 1.05rem; font-weight: 600; color: var(--fg);">Truck ${index + 1}${typeStr}</h3>
                        <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.8rem;">Vol: ${totalVol.toFixed(2)} m³</span>
                    </div>
                    <button onclick="removeTruck('${tId}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>'''

render_replace = '''                if (assignedList.length === 0) {
            rowsHtml = `<tr><td colspan="4" style="text-align:center; padding: 15px; color: #64748b; font-size: 0.9rem;">No DOs assigned yet</td></tr>`;
        }
        
        const typeStr = index === 0 ? " (Cross Dock)" : " (Direct)";
        const meta = truckMeta[tId] || { size: "40HC", hub: "", dest: "" };
        
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
                </div>'''
content = content.replace(render_search, render_replace)

# 6. Update exportTruckPlan
export_search = '''        // Row: (1)   TRUCK Name
        wsData.push([
            { v: `(${truckIdx})`, s: styleTruckIdx }, // Col A
            { v: `TRUCK ${truckIdx} (${truckType})`, s: styleTruckName } // Col B
        ]);'''
export_replace = '''        // Row: (1)   TRUCK Name
        const meta = typeof truckMeta !== 'undefined' && truckMeta[tId] ? truckMeta[tId] : { size: "", hub: "", dest: "" };
        const metaStrParts = [];
        if (meta.size) metaStrParts.push(`[${meta.size}]`);
        if (meta.hub) metaStrParts.push(`HUB: ${meta.hub.toUpperCase()}`);
        if (meta.dest) metaStrParts.push(`TO: ${meta.dest.toUpperCase()}`);
        const metaStr = metaStrParts.length > 0 ? `  -  ${metaStrParts.join(" | ")}` : "";
        
        wsData.push([
            { v: `(${truckIdx})`, s: styleTruckIdx }, // Col A
            { v: `TRUCK ${truckIdx} (${truckType})${metaStr}`, s: styleTruckName } // Col B
        ]);'''
content = content.replace(export_search, export_replace)


# 7. Update resetPlan
resetPlan_search = '''    // Clear trucks
    trucks = {
        "truck_1": []
    };
    truckCounter = 1;'''

resetPlan_replace = '''    // Clear trucks
    trucks = {
        "truck_1": []
    };
    if (typeof truckMeta !== 'undefined') {
        truckMeta = {
            "truck_1": { size: "40HC", hub: "", dest: "" }
        };
    }
    truckCounter = 1;'''
content = content.replace(resetPlan_search, resetPlan_replace)

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)

