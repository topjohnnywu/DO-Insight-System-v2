const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

// 1. Exaggerate bump
code = code.replace(
    /sim\.sagY \-= 0\.065; \/\/ Temporary bump \(spring physics\) \(30% larger\)/g,
    `sim.sagY -= 0.15; // Exaggerated temporary bump (impossible to miss)`
);

// 2. Exaggerate wobble and actually apply pitch wobble
code = code.replace(
    /let activeSagWobble = 0;\s*let activePitchWobble = 0;\s*if \(fl\.position\.z < this\._simTruckL \/ 2 \+ 1\.5\) \{\s*if \(sim\.phase === 'approach' \|\| sim\.phase === 'retreat'\) \{\s*activeSagWobble = Math\.sin\(performance\.now\(\) \/ 60\) \* 0\.025;\s*activePitchWobble = Math\.sin\(performance\.now\(\) \/ 80\) \* 0\.008;\s*\}\s*\}\s*sim\.sagY \+\= \(\(sim\.sagTargetY \+ activeSagWobble\) \- sim\.sagY\) \* 0\.08;\s*sim\.tiltZ \+\= \(sim\.tiltTargetZ \- sim\.tiltZ\) \* 0\.04;\s*const pitch = \(sim\._pitchTarget \|\| 0\);\s*sim\._pitch = \(sim\._pitch \|\| 0\) \+ \(pitch \- \(sim\._pitch \|\| 0\)\) \* 0\.04;/g,
    `let activeSagWobble = 0;
        let activePitchWobble = 0;
        let activeTiltWobble = 0;
        if (fl.position.z < this._simTruckL / 2 + 1.5) {
            if (sim.phase === 'approach' || sim.phase === 'retreat') {
                activeSagWobble = Math.sin(performance.now() / 80) * 0.08; // Heavy bounce
                activePitchWobble = Math.sin(performance.now() / 100) * 0.02; // Heavy forward/back pitch
                activeTiltWobble = Math.sin(performance.now() / 90) * 0.015; // Heavy side-to-side roll
            }
        }
        sim.sagY += ((sim.sagTargetY + activeSagWobble) - sim.sagY) * 0.1; // snappy spring
        sim.tiltZ += ((sim.tiltTargetZ + activeTiltWobble) - sim.tiltZ) * 0.1;
        const pitch = (sim._pitchTarget || 0) + activePitchWobble;
        sim._pitch = (sim._pitch || 0) + (pitch - (sim._pitch || 0)) * 0.1;`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
