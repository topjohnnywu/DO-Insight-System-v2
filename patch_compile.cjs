const fs = require('fs');
let code = fs.readFileSync('js/do_summary_generator.js', 'utf8');

// 1. compileFinalSummary
code = code.replace(/async compileFinalSummary\(\) \{[\s\S]*?this\.syncToActivityTrend\(allRecords\);\n    \}/, `async compileFinalSummary() {
        const sourceBatches = this.batches.filter(b => b.batchName !== "FINAL SUMMARY");

        if (sourceBatches.length === 0) {
            this.showToast("No batches available to compile. Please upload a source file first!", "warning");
            return;
        }

        this.hasCompiledFinalSummary = true;

        const allRecords = [];
        sourceBatches.forEach(b => {
            b.records.filter(r => r.selected !== false).forEach(r => {
                allRecords.push({ ...r, batchOrigin: b.batchName, waveNumber: b.waveNumber });
            });
        });

        // Add or update FINAL SUMMARY batch
        const finalBatchIndex = this.batches.findIndex(b => b.batchName === "FINAL SUMMARY");
        const finalBatchObj = {
            batchName: "FINAL SUMMARY",
            waveNumber: "ALL",
            records: allRecords
        };

        if (finalBatchIndex >= 0) {
            this.batches[finalBatchIndex] = finalBatchObj;
            this.currentBatchIndex = finalBatchIndex;
        } else {
            this.batches.push(finalBatchObj);
            this.currentBatchIndex = this.batches.length - 1;
        }

        this.showToast(\`Compiled Final Summary containing \${allRecords.length} total DOs across \${sourceBatches.length} batch(es)!\`, "success");
        this.saveToStorage();
        this.renderUI();
        await this.exportToExcel();
        this.syncToActivityTrend(allRecords);
    }`);

// 2. exportToExcel batch mapping
code = code.replace(/this\.batches\.forEach\(\(b, idx\) => \{/, `this.batches.forEach((b, idx) => {
            if (b.batchName === "FINAL SUMMARY") return;`);

code = code.replace(/if \(this\.hasCompiledFinalSummary\) \{\n            const allFinalRecords = \[\];\n            const waveDict = \{\};\n            let challengerDOCount = 0;\n\n            this\.batches\.forEach\(b => \{[\s\S]*?\}\);\n            \}\);\n\n            const finalData = \[\];/, `const finalBatch = this.batches.find(b => b.batchName === "FINAL SUMMARY");
        if (finalBatch) {
            const allFinalRecords = finalBatch.records;
            const waveDict = {};
            let challengerDOCount = 0;

            const sourceBatches = this.batches.filter(b => b.batchName !== "FINAL SUMMARY");
            sourceBatches.forEach(b => {
                const batchCleanName = b.batchName.replace("Batch ", "");
                const waveCleanNum = b.waveNumber || "-";
                if (waveDict[waveCleanNum]) {
                    waveDict[waveCleanNum] += \`,\${batchCleanName}\`;
                } else {
                    waveDict[waveCleanNum] = batchCleanName;
                }
            });

            allFinalRecords.forEach(r => {
                if (r.consignee && r.consignee.toUpperCase().includes("CHALLENGER")) {
                    challengerDOCount++;
                }
            });

            const finalData = [];`);


// 3. renderEmailTargets
code = code.replace(/    renderEmailTargets\(\) \{[\s\S]*?    onEmailTargetChange\(value\)/, `    renderEmailTargets() {
        const select = document.getElementById("emailTargetSelect");
        if (!select) return;

        let options = "";
        this.batches.forEach((b, idx) => {
            options += \`<option value="batch-\${idx}">\${b.batchName}</option>\`;
        });

        if (options === "") {
            options = \`<option value="">No batch</option>\`;
            select.innerHTML = options;
            return;
        }

        select.innerHTML = options;

        // Force dropdown to sync with the currently active batch tab
        const targetBatchVal = \`batch-\${this.currentBatchIndex}\`;
        if (Array.from(select.options).some(o => o.value === targetBatchVal)) {
            select.value = targetBatchVal;
        }
    }

    onEmailTargetChange(value)`);

// 4. generateEmail
code = code.replace(/    async generateEmail\(\) \{[\s\S]*?const emailText/, `    async generateEmail() {
        const select = document.getElementById("emailTargetSelect");
        const target = select ? select.value : "";
        if (!target) {
            this.showToast("No batch available to generate email. Please import a source file first.", "warning");
            return;
        }

        let batchLabel = "";
        let doCount = 0;
        let skuTotal = 0;
        let doQty = 0;

        const idx = parseInt(target.replace("batch-", ""), 10);
        const batch = this.batches[idx];
        if (!batch) {
            this.showToast("Selected batch could not be found.", "error");
            return;
        }
        batchLabel = batch.batchName;
        batch.records.filter(r => r.selected !== false).forEach(r => {
            doCount++;
            skuTotal += r.sku;
            doQty += r.qty;
        });

        const emailText`);

fs.writeFileSync('js/do_summary_generator.js', code);
