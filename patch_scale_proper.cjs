const fs = require('fs');

function updateScale(file) {
    let code = fs.readFileSync(file, 'utf8');
    // Replace the return flGroup; line to also include scaling
    if (code.includes('flGroup.scale.set')) {
        code = code.replace(/flGroup\.scale\.set\(.*?\);/g, 'flGroup.scale.set(1.2, 1.2, 1.2);');
    } else {
        code = code.replace(
            /return flGroup;/g,
            `flGroup.scale.set(1.2, 1.2, 1.2);\n            return flGroup;`
        );
    }
    fs.writeFileSync(file, code);
}

updateScale('js/volume_capacity_planner.js');
// let's do the same for loose load planner if it exists
if (fs.existsSync('js/loose_load_planner.js')) {
    updateScale('js/loose_load_planner.js');
}
