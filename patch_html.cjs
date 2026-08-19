const fs = require('fs');
let code = fs.readFileSync('do_summary_generator.html', 'utf8');

const regex = /<button type="button" onclick="summaryGenerator\.resetPresetRemarks\(\)".*?>[\s\S]*?Reset to Defaults[\s\S]*?<\/button>/;

const replacement = `<div style="display: flex; gap: 12px; align-items: center;">
                            <button type="button" onclick="summaryGenerator.exportPresetRemarks()" style="font-size: 11px; color: #10b981; background: none; border: none; cursor: pointer; font-weight: 600; text-decoration: underline;">
                                Export JSON
                            </button>
                            <button type="button" onclick="summaryGenerator.importPresetRemarks()" style="font-size: 11px; color: #3b82f6; background: none; border: none; cursor: pointer; font-weight: 600; text-decoration: underline;">
                                Import JSON
                            </button>
                            <input type="file" id="presetImportFile" accept=".json" style="display: none;" onchange="summaryGenerator.handlePresetImport(event)">
                            <button type="button" onclick="summaryGenerator.resetPresetRemarks()" style="font-size: 11px; color: #ef4444; background: none; border: none; cursor: pointer; font-weight: 600; text-decoration: underline;">
                                Reset to Defaults
                            </button>
                        </div>`;

code = code.replace(regex, replacement);
fs.writeFileSync('do_summary_generator.html', code);
