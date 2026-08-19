const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

// Replace the block of code that adds the fake pallet with an empty string
code = code.replace(
    /\/\/ F\. Cargo Pallet Carried on Forks[\s\S]*?flGroup\.add\(cargoBox\);/m,
    `// F. Cargo Pallet Carried on Forks (Removed for realism)`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
