const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

const regex2 = /const fl = this\.forkliftRef;\s*if \(!fl\) \{ this\.stopLoadingSim\(true\); return; \}/;
const rep2 = `const fl = this.forkliftRef;
        if (!fl) { this.stopLoadingSim(true); return; }
        
        if (fl.userData.beaconMat) {
            // Strobe effect: quick double flash pattern
            const t = performance.now() / 1000;
            // A common strobe pattern: two rapid flashes then a short pause
            // Cycle length: 1 second
            const cycle = t % 1.0;
            let intensity = 0.2; // base glow
            if ((cycle > 0.0 && cycle < 0.08) || (cycle > 0.15 && cycle < 0.23)) {
                intensity = 5.0; // intense flash
            }
            fl.userData.beaconMat.emissiveIntensity = intensity;
        }`;
code = code.replace(regex2, rep2);

fs.writeFileSync('js/volume_capacity_planner.js', code);
