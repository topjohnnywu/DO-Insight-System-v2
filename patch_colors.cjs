const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

code = code.replace(/color: #f4f4f5;/g, 'color: var(--fg-default);');

fs.writeFileSync('js/volume_capacity_planner.js', code);
