const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

const regex = /\n    tickLoadingSim\(\) \{[\s\S]*?\n    \}\n\n    updateSimHud\(sim\) \{/m;
const match = code.match(regex);
if (!match) {
    console.error("Match not found");
    process.exit(1);
}

const replacement = `
    tickLoadingSim() {
        const sim = this.loadingSim;
        if (!sim) return;
        const fl = this.forkliftRef;
        if (!fl) { this.stopLoadingSim(true); return; }

        const elapsed = performance.now() - sim.phaseStart;

        if (sim.idx >= sim.order.length) {
            const rejected = sim.rejectedCount || 0;
            this.stopLoadingSim(true);
            const hud = this.loadingSimHud;
            if (hud) {
                hud.style.display = 'block';
                hud.textContent = \`✅ Loading complete — \${sim.totalWeight - rejected} loaded\${rejected ? \`, \${rejected} rejected\` : ''}. Departing...\`;
                setTimeout(() => { hud.style.display = 'none'; }, 4000);
            }
            if (!this.isDriveMode) this.toggleDriveMode();
            return;
        }

        const target = sim.order[sim.idx];
        const flHome = this.forkliftHome;
        const targetPos = target.userData._targetPos;

        const dockZ = (this._simTruckL / 2) + 7;
        const stagingPos = { x: flHome.x, z: flHome.z };
        const doorPos = { x: targetPos.x, z: dockZ };
        const slotPos = { x: targetPos.x, z: targetPos.z };
        
        const isOverflow = !!target.userData._dockStage;
        const legEnd = isOverflow ? { x: doorPos.x, z: doorPos.z } : slotPos;
        
        const lerpV3 = (from, to, t) => ({ x: from.x + (to.x - from.x) * t, y: from.y !== undefined ? from.y + (to.y - from.y) * t : 0, z: from.z + (to.z - from.z) * t });
        const lerpAngle = (a, b, t) => {
            const da = (b - a) % (Math.PI * 2);
            const shortDa = (2 * da) % (Math.PI * 2) - da;
            return a + shortDa * t;
        };

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

            // Carry the pallet visibly
            target.visible = true;
            target.position.x = fl.position.x;
            target.position.z = fl.position.z - 4.5; // sit on forks (forklift front is -Z locally)
            target.position.y = fl.position.y + targetPos.y + 1; // carry slightly high

            const headingLeg1 = Math.atan2(doorPos.x - fl.position.x, doorPos.z - fl.position.z);
            const headingLeg2 = Math.PI;

            if (t < legT) {
                fl.rotation.y = headingLeg1;
            } else {
                // smooth turn
                const turnT = Math.min(1, (t - legT) / 0.1);
                fl.rotation.y = lerpAngle(headingLeg1, headingLeg2, turnT);
            }
            
            // match pallet rotation
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
            // smooth drop
            const startY = fl.position.y + targetPos.y + 1;
            const endY = targetPos.y;
            target.position.y = startY + (endY - startY) * t;

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
        sim._pitch = (sim._pitch || 0) + (pitch - (sim._pitch || 0)) * 0.04;
        const tmg = this.truckMasterGroup;
        if (tmg && !this.isDriveMode) {
            tmg.position.y = sim.sagY;
            tmg.rotation.z = sim.tiltZ;
            tmg.rotation.x = sim._pitch;
        }
    }

    updateSimHud(sim) {`;

code = code.replace(regex, replacement);
fs.writeFileSync('js/volume_capacity_planner.js', code);
