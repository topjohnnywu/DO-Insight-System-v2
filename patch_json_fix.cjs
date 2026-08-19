const fs = require('fs');
let code = fs.readFileSync('js/do_summary_generator.js', 'utf8');

code = code.replace(
    'const importedData = JSON.parse(e.target.result);',
    'const rawText = (e.target.result || "").replace(/^\\uFEFF/, "").trim();\n                if (!rawText) {\n                    this.showToast("The selected file is empty.", "error");\n                    return;\n                }\n                const importedData = JSON.parse(rawText);'
);

fs.writeFileSync('js/do_summary_generator.js', code);
