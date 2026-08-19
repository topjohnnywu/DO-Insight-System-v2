import re

with open('manual_truck_planning.html', 'r') as f:
    content = f.read()

content = content.replace(
    'border-bottom: 1px solid rgba(255, 255, 255, 0.1);',
    'border-bottom: 1px solid var(--border);'
)

content = content.replace(
    'color: #f8fafc;',
    'color: var(--fg);'
)

content = content.replace(
    'color: #94a3b8;',
    'color: var(--fg-muted);'
)

with open('manual_truck_planning.html', 'w') as f:
    f.write(content)
