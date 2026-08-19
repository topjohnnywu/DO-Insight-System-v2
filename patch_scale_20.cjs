const fs = require('fs');

function updateScale(file) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(
        /flGroup\.scale\.set\(1\.1, 1\.1, 1\.1\); \/\/ 10% larger/g,
        `flGroup.scale.set(1.2, 1.2, 1.2); // 20% larger`
    );
    fs.writeFileSync(file, code);
}

updateScale('js/volume_capacity_planner.js');
updateScale('js/loose_load_planner.js');
