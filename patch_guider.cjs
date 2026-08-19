const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

const guiderFunc = `
        const createGuiderMesh = () => {
            const guiderGroup = new THREE.Group();
            
            const hiVisMat = new THREE.MeshStandardMaterial({ color: 0xccff00, roughness: 0.9 });
            const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdcb3, roughness: 0.6 });
            const hardHatMat = new THREE.MeshStandardMaterial({ color: 0xff6600, roughness: 0.4 });
            const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
            const batonMat = new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 0.8 });

            const torsoGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.7, 12);
            const torso = new THREE.Mesh(torsoGeo, hiVisMat);
            torso.position.y = 1.05;
            guiderGroup.add(torso);

            const stripeGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.08, 12);
            const stripeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.5 });
            const stripe1 = new THREE.Mesh(stripeGeo, stripeMat);
            stripe1.position.y = 1.25;
            guiderGroup.add(stripe1);
            const stripe2 = new THREE.Mesh(stripeGeo, stripeMat);
            stripe2.position.y = 0.85;
            guiderGroup.add(stripe2);

            const headGeo = new THREE.SphereGeometry(0.2, 16, 16);
            const head = new THREE.Mesh(headGeo, skinMat);
            head.position.y = 1.5;
            guiderGroup.add(head);

            const hatGeo = new THREE.SphereGeometry(0.21, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
            const hat = new THREE.Mesh(hatGeo, hardHatMat);
            hat.position.y = 1.5;
            guiderGroup.add(hat);
            const brimGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.02, 16);
            const brim = new THREE.Mesh(brimGeo, hardHatMat);
            brim.position.y = 1.5;
            guiderGroup.add(brim);

            const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.7, 8);
            const legL = new THREE.Mesh(legGeo, pantsMat);
            legL.position.set(-0.13, 0.35, 0);
            guiderGroup.add(legL);
            const legR = new THREE.Mesh(legGeo, pantsMat);
            legR.position.set(0.13, 0.35, 0);
            guiderGroup.add(legR);

            const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 8);
            const batonGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);

            const armPivotL = new THREE.Group();
            armPivotL.position.set(-0.35, 1.3, 0);
            const armL = new THREE.Mesh(armGeo, hiVisMat);
            armL.position.set(0, -0.25, 0);
            armPivotL.add(armL);
            const batonL = new THREE.Mesh(batonGeo, batonMat);
            batonL.position.set(0, -0.5, 0.15);
            batonL.rotation.x = Math.PI / 2;
            armPivotL.add(batonL);
            guiderGroup.add(armPivotL);

            const armPivotR = new THREE.Group();
            armPivotR.position.set(0.35, 1.3, 0);
            const armR = new THREE.Mesh(armGeo, hiVisMat);
            armR.position.set(0, -0.25, 0);
            armPivotR.add(armR);
            const batonR = new THREE.Mesh(batonGeo, batonMat);
            batonR.position.set(0, -0.5, 0.15);
            batonR.rotation.x = Math.PI / 2;
            armPivotR.add(batonR);
            guiderGroup.add(armPivotR);

            guiderGroup.userData.armL = armPivotL;
            guiderGroup.userData.armR = armPivotR;

            guiderGroup.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            return guiderGroup;
        };

        // Place the Forklift`;

code = code.replace(/\/\/ Place the Forklift/, guiderFunc);

const guiderPlacement = `        const guider = createGuiderMesh();
        guider.position.set(-4, dockHeight, (truckL / 2) + 8);
        bayGroup.add(guider);
        this.guiderRef = guider;
        
        this.forkliftHome = `;

code = code.replace(/this\.forkliftHome = /, guiderPlacement);

const guiderAnim = `        if (sim.rejectShake) {
            const since = performance.now() - sim.rejectShake;
            if (since < 700) {
                fl.rotation.z = Math.sin(since / 45) * 0.06 * (1 - since / 700);
            } else {
                fl.rotation.z = 0;
                sim.rejectShake = 0;
            }
        }
        
        if (this.guiderRef) {
            const time = performance.now();
            const armL = this.guiderRef.userData.armL;
            const armR = this.guiderRef.userData.armR;
            
            if (sim.phase === 'approach') {
                const swing = Math.sin(time / 150) * 0.5 - 0.5; // swing from -1 to 0 (arms forward)
                armL.rotation.x = swing;
                armR.rotation.x = swing;
                armL.rotation.z = 0;
                armR.rotation.z = 0;
            } else if (sim.phase === 'lower') {
                // Cross arms (stop/hold)
                armL.rotation.x = -Math.PI * 0.7;
                armL.rotation.z = -Math.PI * 0.25;
                armR.rotation.x = -Math.PI * 0.7;
                armR.rotation.z = Math.PI * 0.25;
            } else if (sim.phase === 'retreat') {
                // Point forward
                armL.rotation.x = -Math.PI * 0.2;
                armL.rotation.z = 0;
                armR.rotation.x = -Math.PI * 0.2;
                armR.rotation.z = 0;
            } else if (sim.phase === 'pause') {
                armL.rotation.x = 0;
                armL.rotation.z = 0;
                armR.rotation.x = 0;
                armR.rotation.z = 0;
            }
            
            // Guider faces the forklift
            if (fl) {
                const dx = fl.position.x - this.guiderRef.position.x;
                const dz = fl.position.z - this.guiderRef.position.z;
                this.guiderRef.rotation.y = Math.atan2(dx, dz);
            }
        }`;

code = code.replace(/if \(sim\.rejectShake\) \{[\s\S]*?sim\.rejectShake = 0;\n            \}\n        \}/, guiderAnim);

fs.writeFileSync('js/volume_capacity_planner.js', code);
