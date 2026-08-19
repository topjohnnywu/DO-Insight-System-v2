import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# 1. Update removeTruck
content = content.replace(
    'function removeTruck(truckId) {',
    'async function removeTruck(truckId) {'
)
content = content.replace(
    'if (!confirm("This truck has assigned DOs. Are you sure you want to remove it? DOs will be returned to the unassigned pool.")) {',
    'const confirmed = await window.showConfirmDialog({\n            title: "Remove Truck",\n            message: "This truck has assigned DOs. Are you sure you want to remove it? DOs will be returned to the unassigned pool.",\n            confirmText: "Remove Truck",\n            isDanger: true\n        });\n        if (!confirmed) {'
)

# 2. Update removeLastTruck
content = content.replace(
    'function removeLastTruck() {',
    'async function removeLastTruck() {'
)
content = content.replace(
    'if (!confirm("The last truck has assigned DOs. Are you sure you want to remove it? DOs will be returned to the unassigned pool.")) {',
    'const confirmed = await window.showConfirmDialog({\n            title: "Remove Last Truck",\n            message: "The last truck has assigned DOs. Are you sure you want to remove it? DOs will be returned to the unassigned pool.",\n            confirmText: "Remove Truck",\n            isDanger: true\n        });\n        if (!confirmed) {'
)

# 3. Update resetPlan
content = content.replace(
    'function resetPlan() {',
    'async function resetPlan() {'
)
content = content.replace(
    'if (!confirm("Are you sure you want to completely reset the truck plan? All DOs will be returned to the unassigned pool and all trucks will be deleted.")) {',
    'const confirmed = await window.showConfirmDialog({\n        title: "Reset Plan",\n        message: "Are you sure you want to completely reset the truck plan? All DOs will be returned to the unassigned pool and all trucks will be deleted.",\n        confirmText: "Reset All",\n        isDanger: true\n    });\n    if (!confirmed) {'
)

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
