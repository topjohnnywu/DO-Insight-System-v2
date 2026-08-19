const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

// 1. Save beaconMat to userData so we can animate it
code = code.replace(
    /const beacon = new THREE\.Mesh\(new THREE\.CylinderGeometry\(0\.2, 0\.2, 0\.35, 12\), beaconMat\);\s*beacon\.position\.set\(0, 1\.2 \+ postH \+ 0\.2, -0\.8\);\s*flGroup\.add\(beacon\);/g,
    `const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.35, 12), beaconMat);
            beacon.position.set(0, 1.2 + postH + 0.2, -0.8);
            flGroup.add(beacon);
            flGroup.userData.beaconMat = beaconMat;`
);

// 2. Add animation logic in the simulation loop
// Search for "const fl = this.forkliftRef;" inside the animation loop
const animationRegex = /const fl = this\.forkliftRef;\s*if \(fl\) \{/g;
const animationReplacement = `const fl = this.forkliftRef;
        if (fl) {
            if (fl.userData.beaconMat) {
                // Strobe effect: blink intensely twice per second
                const t = performance.now() / 1000;
                const blinkPattern = (t % 0.5) < 0.1 ? 2.5 : 0.2; 
                fl.userData.beaconMat.emissiveIntensity = blinkPattern;
            }`;

code = code.replace(animationRegex, animationReplacement);

fs.writeFileSync('js/volume_capacity_planner.js', code);
