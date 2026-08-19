const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

code = code.replace(
    /this\.forkliftRef\.rotation\.z = 0;\n        \}/,
    `this.forkliftRef.rotation.z = 0;
            if (this.forkliftRef.userData.forksGroup) {
                this.forkliftRef.userData.forksGroup.position.y = 0; // reset to default
            }
        }`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
