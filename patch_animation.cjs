const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

const regex = /\n        if \(sim\.phase === 'approach'\) \{[\s\S]*?sim\._pitch = \(sim\._pitch \|\| 0\) \+ \(pitch - \(sim\._pitch \|\| 0\)\) \* 0\.04;/m;
const match = code.match(regex);
if (!match) {
    console.error("Match not found");
    process.exit(1);
}

const replacement = `
        if (sim.phase === 'approach') {
            // dynamic times
            if (!sim.currentDriveIn) {
                const d1 = Math.hypot(doorPos.x - stagingPos.x, doorPos.z - stagingPos.z);
                const d2 = Math.hypot(legEnd.x - doorPos.x, legEnd.z - doorPos.z);
                const speed = 0.025;
                sim.currentDriveIn = (d1 + d2) / speed;
                sim.currentRetreat = sim.currentDriveIn * 0.8; 
                sim.currentDriveLegT = d1 / (d1 + d2);
            }

            const t = Math.min(1, elapsed / sim.currentDriveIn);
            const legT = sim.currentDriveLegT;
            
            let pos;
            if (t < legT) {
                pos = lerpV3(stagingPos, doorPos, t / legT);
            } else {
                pos = lerpV3(doorPos, legEnd, (t - legT) / (1 - legT));
            }
            fl.position.x = pos.x;
            fl.position.z = pos.z;

            // Heading
            const headingLeg1 = Math.atan2(doorPos.x - fl.position.x, doorPos.z - fl.position.z);
            const headingLeg2 = Math.PI;

            if (t < legT) {
                fl.rotation.y = headingLeg1;
            } else {
                const turnT = Math.min(1, (t - legT) / 0.1);
                fl.rotation.y = lerpAngle(headingLeg1, headingLeg2, turnT);
            }

            // --- LIFT ANIMATION LOGIC ---
            // carry height on dock (0.2 units above floor)
            const lowCarryY = 0.2; 
            // clearance height over stack (target + 0.2)
            const highCarryY = targetPos.y + 0.2; 
            
            let tinesY = lowCarryY;
            if (t >= legT) {
                // Lift while driving leg 2
                const liftT = (t - legT) / (1 - legT);
                tinesY = lowCarryY + (highCarryY - lowCarryY) * liftT;
            }
            
            // Move the actual forklift forks mesh
            if (fl.userData.forksGroup) {
                fl.userData.forksGroup.position.y = tinesY - 0.7; // 0.7 is the default modeling height
            }

            // Carry the pallet visibly ON the forks
            target.visible = true;
            target.position.x = fl.position.x + Math.sin(fl.rotation.y) * 4.5;
            target.position.z = fl.position.z + Math.cos(fl.rotation.y) * 4.5;
            target.position.y = tinesY; 
            target.rotation.y = target.userData._targetRot.y;

            if (t >= 1) {
                if (isOverflow) {
                    target.position.set(
                        target.userData._dockStage.x,
                        target.userData._dockStage.y,
                        target.userData._dockStage.z
                    );
                    target.visible = true;
                    sim.placedCount++;
                    sim.rejectedCount = (sim.rejectedCount || 0) + 1;
                    sim.rejectShake = performance.now();
                    this.updateSimHud(sim);
                    sim.phase = 'retreat';
                    sim.phaseStart = performance.now();
                    return;
                }
                
                sim.phase = 'lower';
                sim.phaseStart = performance.now();
            }
        } else if (sim.phase === 'lower') {
            const t = Math.min(1, elapsed / sim.lower);
            
            // Drop from clearance height to final target height
            const tinesY = (targetPos.y + 0.2) - (0.2 * t);
            
            if (fl.userData.forksGroup) {
                fl.userData.forksGroup.position.y = tinesY - 0.7;
            }
            target.position.y = tinesY;

            if (t >= 1) {
                target.position.copy(targetPos);
                
                sim.placedCount++;
                sim.placedX += target.position.x;
                sim.placedZ += target.position.z;
                const frac = sim.placedCount / sim.totalWeight;
                sim.sagTargetY = -0.35 * frac;
                const meanX = sim.placedX / sim.placedCount;
                const meanZ = sim.placedZ / sim.placedCount;
                sim.tiltTargetZ = THREE.MathUtils.clamp(meanX * -0.045, -0.05, 0.05);
                sim._pitchTarget = THREE.MathUtils.clamp(meanZ * 0.012, -0.02, 0.02);
                this.updateSimHud(sim);
                
                sim.phase = 'retreat';
                sim.phaseStart = performance.now();
            }
        } else if (sim.phase === 'retreat') {
            const t = Math.min(1, elapsed / sim.currentRetreat);
            const pos = lerpV3(slotPos, doorPos, t);
            fl.position.x = pos.x;
            fl.position.z = pos.z;
            fl.rotation.y = Math.PI + Math.PI * 0.25 * t;
            if (t >= 1) {
                sim.phase = 'pause';
                sim.phaseStart = performance.now();
            }
        } else if (sim.phase === 'pause') {
            const pos = lerpV3(doorPos, stagingPos, Math.min(1, elapsed / sim.pause));
            fl.position.x = pos.x;
            fl.position.z = pos.z;
            
            // Lower forks back to driving position while returning
            if (fl.userData.forksGroup) {
                const returnT = Math.min(1, elapsed / sim.pause);
                const tinesY = targetPos.y + (0.2 - targetPos.y) * returnT;
                fl.userData.forksGroup.position.y = tinesY - 0.7;
            }

            if (elapsed >= sim.pause) {
                sim.idx++;
                sim.currentDriveIn = null;
                sim.phase = 'approach';
                sim.phaseStart = performance.now();
            }
        }

        if (sim.rejectShake) {
            const since = performance.now() - sim.rejectShake;
            if (since < 700) {
                fl.rotation.z = Math.sin(since / 45) * 0.06 * (1 - since / 700);
            } else {
                fl.rotation.z = 0;
                sim.rejectShake = 0;
            }
        }

        sim.sagY += (sim.sagTargetY - sim.sagY) * 0.04;
        sim.tiltZ += (sim.tiltTargetZ - sim.tiltZ) * 0.04;
        const pitch = (sim._pitchTarget || 0);
        sim._pitch = (sim._pitch || 0) + (pitch - (sim._pitch || 0)) * 0.04;`;

code = code.replace(regex, replacement);
fs.writeFileSync('js/volume_capacity_planner.js', code);
