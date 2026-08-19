import re

with open('manual_truck_planning.html', 'r') as f:
    content = f.read()

content = content.replace('onclick="window.print()"', 'onclick="printFinalPlan()"')

with open('manual_truck_planning.html', 'w') as f:
    f.write(content)
