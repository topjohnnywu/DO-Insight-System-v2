import re

with open('js/do_summary_generator.js', 'r') as f:
    content = f.read()

old_logic = """const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + 1);"""
new_logic = """const targetDate = new Date();
                if (targetDate.getDay() === 5) {
                    targetDate.setDate(targetDate.getDate() + 3);
                } else if (targetDate.getDay() === 6) {
                    targetDate.setDate(targetDate.getDate() + 2);
                } else {
                    targetDate.setDate(targetDate.getDate() + 1);
                }"""
content = content.replace(old_logic, new_logic)

old_logic_2 = """const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + 1);"""
new_logic_2 = """const targetDate = new Date();
            if (targetDate.getDay() === 5) {
                targetDate.setDate(targetDate.getDate() + 3);
            } else if (targetDate.getDay() === 6) {
                targetDate.setDate(targetDate.getDate() + 2);
            } else {
                targetDate.setDate(targetDate.getDate() + 1);
            }"""
content = content.replace(old_logic_2, new_logic_2)

old_logic_3 = """const targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + 1);"""
new_logic_3 = """const targetDate = new Date();
                    if (targetDate.getDay() === 5) {
                        targetDate.setDate(targetDate.getDate() + 3);
                    } else if (targetDate.getDay() === 6) {
                        targetDate.setDate(targetDate.getDate() + 2);
                    } else {
                        targetDate.setDate(targetDate.getDate() + 1);
                    }"""
content = content.replace(old_logic_3, new_logic_3)

# One more search and replace, just doing regex to be safe
content = re.sub(
    r'const targetDate = new Date\(\);\s*targetDate\.setDate\(targetDate\.getDate\(\) \+ 1\);',
    r'''const targetDate = new Date();
            if (targetDate.getDay() === 5) {
                targetDate.setDate(targetDate.getDate() + 3);
            } else if (targetDate.getDay() === 6) {
                targetDate.setDate(targetDate.getDate() + 2);
            } else {
                targetDate.setDate(targetDate.getDate() + 1);
            }''',
    content
)


with open('js/do_summary_generator.js', 'w') as f:
    f.write(content)

print("Date logic patched.")
