const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

// I need to add scale to the guider when it's placed.
const regex = /const guider = createGuiderMesh\(\);\n        guider\.position\.set\(-4, dockHeight, \(truckL \/ 2\) \+ 8\);/;
const replacement = `const guider = createGuiderMesh();
        guider.scale.set(3.5, 3.5, 3.5); // Make the guider much larger to match the environment
        guider.position.set(-4, dockHeight, (truckL / 2) + 8);`;

code = code.replace(regex, replacement);
fs.writeFileSync('js/volume_capacity_planner.js', code);
