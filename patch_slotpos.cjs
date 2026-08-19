const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

code = code.replace(
    /const slotPos = { x: targetPos\.x, z: targetPos\.z };/,
    `// The forklift must stop short of the pallet's final slot because the forks stick out 4.5 units
        const slotPos = { x: targetPos.x, z: targetPos.z + 4.5 };`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
