const fs = require('fs');
let code = fs.readFileSync('do_summary_generator.html', 'utf8');

const filteredSearchHTML = `<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; justify-content: flex-end;">
                        <input type="text" id="filteredPresetSearch" oninput="summaryGenerator.filterPresets(this.value, 'filteredPresetChipsContainer')" placeholder="🔍 Search presets..." style="font-size: 11px; padding: 4px 8px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-solid, var(--bg-base)); color: var(--fg); width: 140px;">
                        <div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;" id="filteredPresetChipsContainer">`;

code = code.replace(/<div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; flex: 1; justify-content: flex-end;">\s*<div style="display: flex; gap: 4px; flex-wrap: wrap; align-items: center;" id="filteredPresetChipsContainer">/, filteredSearchHTML);

fs.writeFileSync('do_summary_generator.html', code);
