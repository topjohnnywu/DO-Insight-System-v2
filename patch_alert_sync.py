import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# Replace all calls
content = re.sub(r'showCustomAlert\((.*?)\);', r'showToast(\1, "error");', content)

# Remove the showCustomAlert function
start_str = "function showCustomAlert(message) {"
end_str = "}, 6000);\n}"
start_idx = content.find(start_str)
end_idx = content.find(end_str, start_idx)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + content[end_idx + len(end_str):]

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
