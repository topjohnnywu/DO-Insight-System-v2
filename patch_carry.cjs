const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

code = code.replace(
    /target\.position\.x = fl\.position\.x;\s*target\.position\.z = fl\.position\.z - 4\.5;/g,
    `target.position.x = fl.position.x + Math.sin(fl.rotation.y) * 4.5;
            target.position.z = fl.position.z + Math.cos(fl.rotation.y) * 4.5;`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
