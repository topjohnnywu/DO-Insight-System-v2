const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

// Replace carriage and forks logic to put them in a group
code = code.replace(
    /\/\/ Carriage Plate[\s\S]*?flGroup\.add\(forkHoz\);\n            }\);/m,
    `// Carriage Plate and Forks Group
            const forksGroup = new THREE.Group();
            flGroup.userData.forksGroup = forksGroup;
            
            const carriage = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 0.15), flSteelMat);
            carriage.position.set(0, 1.6, 2.45);
            forksGroup.add(carriage);
            
            // E. Steel Fork Tines (L-Shape)
            const forkH = 1.4;
            const forkL = 3.2;
            const forkW = 0.25;
            
            [-0.7, 0.7].forEach(fx => {
                const forkV = new THREE.Mesh(new THREE.BoxGeometry(forkW, forkH, 0.1), flForksMat);
                forkV.position.set(fx, 1.4, 2.5);
                forksGroup.add(forkV);
                
                const forkHoz = new THREE.Mesh(new THREE.BoxGeometry(forkW, 0.08, forkL), flForksMat);
                forkHoz.position.set(fx, 0.7, 2.5 + forkL / 2);
                forksGroup.add(forkHoz);
            });
            flGroup.add(forksGroup);`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);
