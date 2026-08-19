const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

// 1. Add PointLight
const beaconCreation = /flGroup\.userData\.beaconMat = beaconMat;/;
const lightCreation = `flGroup.userData.beaconMat = beaconMat;
            const beaconLight = new THREE.PointLight(0xf97316, 0, 15);
            beaconLight.position.set(0, 1.2 + postH + 0.5, -0.8);
            beaconLight.castShadow = true;
            beaconLight.shadow.bias = -0.001;
            flGroup.add(beaconLight);
            flGroup.userData.beaconLight = beaconLight;`;
code = code.replace(beaconCreation, lightCreation);

// 2. Add animation logic
const animationBlockRegex = /let intensity = 0\.2; \/\/ base glow\s*if \(\(cycle > 0\.0 && cycle < 0\.08\) \|\| \(cycle > 0\.15 && cycle < 0\.23\)\) \{\s*intensity = 5\.0; \/\/ intense flash\s*\}\s*fl\.userData\.beaconMat\.emissiveIntensity = intensity;/;
const animationBlockReplacement = `let intensity = 0.2; // base glow
            let lightIntensity = 0.0;
            if ((cycle > 0.0 && cycle < 0.08) || (cycle > 0.15 && cycle < 0.23)) {
                intensity = 5.0; // intense flash
                lightIntensity = 3.0; // PointLight intensity
            }
            fl.userData.beaconMat.emissiveIntensity = intensity;
            if (fl.userData.beaconLight) {
                fl.userData.beaconLight.intensity = lightIntensity;
            }`;
code = code.replace(animationBlockRegex, animationBlockReplacement);

fs.writeFileSync('js/volume_capacity_planner.js', code);
