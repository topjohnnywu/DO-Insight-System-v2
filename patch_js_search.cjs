const fs = require('fs');
let code = fs.readFileSync('js/do_summary_generator.js', 'utf8');

// 1. Add filterPresets function
const filterFunc = `    filterPresets(query, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const q = query.toLowerCase().trim();
        const buttons = container.querySelectorAll('button.preset-chip');
        buttons.forEach(btn => {
            if (btn.innerText.toLowerCase().includes(q)) {
                btn.style.display = '';
            } else {
                btn.style.display = 'none';
            }
        });
    }

    renderPresetChips() {`;

code = code.replace(/    renderPresetChips\(\) \{/, filterFunc);

// 2. Sort presets alphabetically inside renderPresetChips
code = code.replace(
    'this.presetRemarks.forEach(p => {',
    'this.presetRemarks.sort((a, b) => a.label.localeCompare(b.label));\n        this.presetRemarks.forEach(p => {'
);

// 3. Sort presets alphabetically inside renderPresetManagerList (to ensure indices match)
code = code.replace(
    'this.presetRemarks.forEach((p, idx) => {',
    'this.presetRemarks.sort((a, b) => a.label.localeCompare(b.label));\n        this.presetRemarks.forEach((p, idx) => {'
);

fs.writeFileSync('js/do_summary_generator.js', code);
