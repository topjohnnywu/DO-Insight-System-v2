import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# Add resetPlan
reset_code = """
function resetPlan() {
    if (!confirm("Are you sure you want to completely reset the truck plan? All DOs will be returned to the unassigned pool and all trucks will be deleted.")) {
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
    truckCounter = 1;
    
    // Reset search & filters
    document.getElementById("unassignedSearch").value = "";
    document.getElementById("selectAllUnassigned").checked = false;
    
    renderUnassignedDOs();
    renderTruckBoards();
    updateTruckDropdown();
    saveState();
}
"""
content += reset_code

# Replace hardcoded colors in JS
# renderUnassignedDOs:
# `style="background: rgba(15, 23, 42, 0.4);"` -> `style="background: var(--surface-hover);"`
content = content.replace(
    'style="background: rgba(15, 23, 42, 0.4);"',
    'style="background: var(--surface-hover);"'
)

# renderTruckBoards:
# `style="background: rgba(15, 23, 42, 0.4);"` -> `style="background: var(--surface-hover);"`
content = content.replace(
    'style="padding: 12px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.4);"',
    'style="padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--surface-hover);"'
)
content = content.replace(
    'color: #f8fafc;"',
    'color: var(--fg);"'
)
content = content.replace(
    'color: #94a3b8;"',
    'color: var(--fg-muted);"'
)
content = content.replace(
    'color: #64748b;"',
    'color: var(--fg-muted);"'
)

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
