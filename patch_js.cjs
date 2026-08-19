const fs = require('fs');
let code = fs.readFileSync('js/do_summary_generator.js', 'utf8');

const newFunctions = `
    exportPresetRemarks() {
        const dataStr = JSON.stringify(this.presetRemarks, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "do_summary_preset_remarks.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast("Preset remarks exported successfully.", "success");
    }

    importPresetRemarks() {
        const fileInput = document.getElementById("presetImportFile");
        if (fileInput) fileInput.click();
    }

    handlePresetImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (Array.isArray(importedData)) {
                    // Basic validation
                    const validData = importedData.filter(item => item && typeof item.label === 'string' && typeof item.color === 'string');
                    if (validData.length > 0) {
                        this.presetRemarks = validData;
                        this.saveToStorage();
                        this.renderPresetChips();
                        this.renderPresetManagerList();
                        this.showToast(\`Imported \${validData.length} preset remarks!\`, "success");
                    } else {
                        this.showToast("No valid preset remarks found in file.", "error");
                    }
                } else {
                    this.showToast("Invalid JSON format. Expected an array.", "error");
                }
            } catch (err) {
                console.error("JSON parse error:", err);
                this.showToast("Failed to parse JSON file.", "error");
            } finally {
                event.target.value = ""; // Reset input
            }
        };
        reader.readAsText(file);
    }

    async resetPresetRemarks() {`;

code = code.replace(/async resetPresetRemarks\(\) \{/, newFunctions);
fs.writeFileSync('js/do_summary_generator.js', code);
