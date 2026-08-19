import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

new_function = """
function removeLastTruck() {
    const truckKeys = Object.keys(trucks);
    if (truckKeys.length <= 1) {
        showCustomAlert("You cannot remove Truck 1 as it is required for Cross Dock.");
        return;
    }
    
    const lastTruckId = truckKeys[truckKeys.length - 1];
    
    // Safely use existing remove function logic with a native confirm for now, 
    // or just call removeTruck if we want to reuse the confirm prompt.
    // However, removeTruck has a confirm that blocks. Let's make this one smooth if empty.
    
    if (trucks[lastTruckId].length > 0) {
        if (!confirm("The last truck has assigned DOs. Are you sure you want to remove it? DOs will be returned to the unassigned pool.")) {
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
"""
content += new_function

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
