const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

// The previous bump was -0.05. A 30% increase would make it -0.065.
code = code.replace(
    /sim\.sagY \-= 0\.05; \/\/ Temporary bump \(spring physics\)/,
    `sim.sagY -= 0.065; // Temporary bump (spring physics) (30% larger)`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
