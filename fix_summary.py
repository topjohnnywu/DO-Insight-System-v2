import re

# 1. Fix HTML Modals
with open('do_summary_generator.html', 'r') as f:
    content = f.read()

# Remove onclick="if(event.target === this) summaryGenerator.cancelImportModal()"
content = content.replace('onclick="if(event.target === this) summaryGenerator.cancelImportModal()"', '')
content = content.replace('onclick="if(event.target === this) summaryGenerator.closePresetManagerModal()"', '')

with open('do_summary_generator.html', 'w') as f:
    f.write(content)

print("HTML Modals fixed.")
