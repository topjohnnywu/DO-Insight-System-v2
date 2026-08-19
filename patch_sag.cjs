const fs = require('fs');

let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

code = code.replace(
    /sim\.sagTargetY = -0\.35 \* frac;\n\s*const meanX = sim\.placedX \/ sim\.placedCount;\n\s*const meanZ = sim\.placedZ \/ sim\.placedCount;\n\s*sim\.tiltTargetZ = THREE\.MathUtils\.clamp\(meanX \* -0\.045, -0\.05, 0\.05\);\n\s*sim\._pitchTarget = THREE\.MathUtils\.clamp\(meanZ \* 0\.012, -0\.02, 0\.02\);/,
    `sim.sagTargetY = 0; // Removed permanent sag
                sim.sagY -= 0.05; // Temporary bump (spring physics)
                
                const meanX = sim.placedX / sim.placedCount;
                const meanZ = sim.placedZ / sim.placedCount;
                sim.tiltTargetZ = 0; // THREE.MathUtils.clamp(meanX * -0.045, -0.05, 0.05); // Removed permanent tilt
                sim._pitchTarget = 0; // THREE.MathUtils.clamp(meanZ * 0.012, -0.02, 0.02); // Removed permanent pitch`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
