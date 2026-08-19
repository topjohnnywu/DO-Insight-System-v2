import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# Update renderUnassignedDOs
content = content.replace(
    '<td><span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa;">${doObj.inv}</span></td>',
    '<td><span class="badge" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: bottom;">${doObj.remark ? doObj.inv + " " + doObj.remark : doObj.inv}</span></td>'
)

# Update renderTruckBoards
content = content.replace(
    '<td><span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">${doObj.inv}</span></td>',
    '<td><span class="badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: inline-block; vertical-align: bottom;">${doObj.remark ? doObj.inv + " " + doObj.remark : doObj.inv}</span></td>'
)

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
