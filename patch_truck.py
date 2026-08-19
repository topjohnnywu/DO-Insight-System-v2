import re

with open('js/truck_planning.js', 'r') as f:
    content = f.read()

# Edit 1: filteredRows.push
old_push = '''            filteredRows.push({
                batch: batchVal,
                truck: itemTruckStr,
                hub: itemHubStr,
                route: doRow.route || "-",
                consignee: doRow.name || "-",
                doNo: fullDoText,
                invRaw: doRow.inv,
                type: doType,
                productCode: code,
                modelName: desc,
                qty: qty,
                vol: parseFloat(doRow.vol) || 0
            });'''

new_push = '''            const itemVol = item.vol !== undefined && item.vol !== null ? parseFloat(item.vol) : null;
            const rowVol = itemVol !== null ? itemVol : (parseFloat(doRow.vol) || 0);

            filteredRows.push({
                batch: batchVal,
                truck: itemTruckStr,
                hub: itemHubStr,
                route: doRow.route || "-",
                consignee: doRow.name || "-",
                doNo: fullDoText,
                invRaw: doRow.inv,
                type: doType,
                productCode: code,
                modelName: desc,
                qty: qty,
                vol: rowVol,
                isItemVol: itemVol !== null
            });'''

content = content.replace(old_push, new_push)

# Edit 2: globalTotalM3 in renderTruckPlanningDashboard
old_kpi = '''    // Total m3 summed over UNIQUE DOs (vol is per-DO, repeats across item rows)
    const volByDo = {};
    filteredRows.forEach(r => { volByDo[r.invRaw] = r.vol; });
    const totalM3 = Object.values(volByDo).reduce((sum, v) => sum + v, 0);'''

new_kpi = '''    // Total m3 summed over UNIQUE DOs or item-specific volumes
    let totalM3 = 0;
    const volByDo = {};
    filteredRows.forEach(r => { 
        if (r.isItemVol) {
            totalM3 += r.vol;
        } else {
            volByDo[r.invRaw] = r.vol; 
        }
    });
    totalM3 += Object.values(volByDo).reduce((sum, v) => sum + v, 0);'''

content = content.replace(old_kpi, new_kpi)

# Edit 3: exportTruckPlanningToExcel globalTotalM3
old_exp_global = '''    const globalVolByDo = {};
    filteredRows.forEach(r => { globalVolByDo[r.invRaw] = r.vol; });
    const globalTotalM3 = Object.values(globalVolByDo).reduce((sum, v) => sum + v, 0);'''

new_exp_global = '''    let globalTotalM3 = 0;
    const globalVolByDo = {};
    filteredRows.forEach(r => { 
        if (r.isItemVol) {
            globalTotalM3 += r.vol;
        } else {
            globalVolByDo[r.invRaw] = r.vol; 
        }
    });
    globalTotalM3 += Object.values(globalVolByDo).reduce((sum, v) => sum + v, 0);'''

content = content.replace(old_exp_global, new_exp_global)

# Edit 4: exportTruckPlanningToExcel hubM3 (appears twice, regex replace)
old_hub_m3 = '''        const hubVolByDo = {};
        rows.forEach(r => { hubVolByDo[r.invRaw] = r.vol; });
        const hubM3 = Object.values(hubVolByDo).reduce((sum, v) => sum + v, 0);'''

new_hub_m3 = '''        let hubM3 = 0;
        const hubVolByDo = {};
        rows.forEach(r => { 
            if (r.isItemVol) {
                hubM3 += r.vol;
            } else {
                hubVolByDo[r.invRaw] = r.vol; 
            }
        });
        hubM3 += Object.values(hubVolByDo).reduce((sum, v) => sum + v, 0);'''

content = content.replace(old_hub_m3, new_hub_m3)

with open('js/truck_planning.js', 'w') as f:
    f.write(content)

print("Patched truck_planning.js")
