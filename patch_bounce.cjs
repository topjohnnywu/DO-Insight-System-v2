const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

const regex = /sim\.sagY \+\= \(sim\.sagTargetY \- sim\.sagY\) \* 0\.04;/;
const replacement = `let activeSagWobble = 0;
        let activePitchWobble = 0;
        if (fl.position.z < this._simTruckL / 2 + 1.5) {
            if (sim.phase === 'approach' || sim.phase === 'retreat') {
                activeSagWobble = Math.sin(performance.now() / 60) * 0.025; // 30% larger active wobble
                activePitchWobble = Math.sin(performance.now() / 80) * 0.008;
            }
        }
        sim.sagY += ((sim.sagTargetY + activeSagWobble) - sim.sagY) * 0.08; // slightly faster spring for the wobble`;

code = code.replace(regex, replacement);
fs.writeFileSync('js/volume_capacity_planner.js', code);
