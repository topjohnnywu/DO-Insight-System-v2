const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

code = code.replace(/color: var\(--fg-default\);/g, 'color: var(--fg);');

fs.writeFileSync('js/volume_capacity_planner.js', code);
