const fs = require('fs');
let code = fs.readFileSync('do_summary_generator.html', 'utf8');

// For Quick Remarks Panel
const quickSearchHTML = `<div style="margin-bottom: 10px;">
                                <input type="text" id="quickPresetSearch" oninput="summaryGenerator.filterPresets(this.value, 'quickPresetChipsContainer')" placeholder="🔍 Search presets..." style="width: 100%; font-size: 12px; padding: 6px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-solid, var(--bg-base)); color: var(--fg); box-sizing: border-box;">
                            </div>
                            <div class="quick-preset-chips" id="quickPresetChipsContainer">`;

code = code.replace(/<div class="quick-preset-chips" id="quickPresetChipsContainer">/, quickSearchHTML);

fs.writeFileSync('do_summary_generator.html', code);
