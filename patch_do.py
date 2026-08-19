import re

with open('js/do_load_planner.js', 'r') as f:
    content = f.read()

# Edit 1: filteredRows.push
old_push = '''                vol: parseFloat(doRow.vol) || 0
            });'''

new_push = '''                vol: item.vol !== undefined && item.vol !== null ? parseFloat(item.vol) : (parseFloat(doRow.vol) || 0),
                isItemVol: item.vol !== undefined && item.vol !== null
            });'''

content = content.replace(old_push, new_push)

# Edit 2: groupedByDo 
old_group = '''        if (!groupedByDo[row.invRaw]) {
            groupedByDo[row.invRaw] = {
                batch: row.batch,
                truck: row.truck,
                hub: row.hub,
                route: row.route,
                consignee: row.consignee,
                doNo: row.doNo,
                invRaw: row.invRaw,
                totalQty: 0,
                totalVol: 0,
                items: [],
                rawItems: []
            };
        }
        groupedByDo[row.invRaw].totalQty += row.qty;
        groupedByDo[row.invRaw].totalVol += row.vol;
        groupedByDo[row.invRaw].items.push(`${row.qty}x [${row.productCode}]`);
        
        groupedByDo[row.invRaw].rawItems.push({
            code: row.productCode,
            desc: row.modelName,
            qty: row.qty,
            type: row.type
        });'''

new_group = '''        if (!groupedByDo[row.invRaw]) {
            groupedByDo[row.invRaw] = {
                batch: row.batch,
                truck: row.truck,
                hub: row.hub,
                route: row.route,
                consignee: row.consignee,
                doNo: row.doNo,
                invRaw: row.invRaw,
                totalQty: 0,
                totalVol: row.isItemVol ? 0 : row.vol, // Set once if legacy
                items: [],
                rawItems: []
            };
        }
        groupedByDo[row.invRaw].totalQty += row.qty;
        if (row.isItemVol) {
            groupedByDo[row.invRaw].totalVol += row.vol;
        }
        groupedByDo[row.invRaw].items.push(`${row.qty}x [${row.productCode}]`);
        
        groupedByDo[row.invRaw].rawItems.push({
            code: row.productCode,
            desc: row.modelName,
            qty: row.qty,
            type: row.type,
            vol: row.vol,
            isItemVol: row.isItemVol
        });'''

content = content.replace(old_group, new_group)

# Edit 3: GroupedMap in handleCalculate()
old_map = '''                    const lineQty = (item.qty && !isNaN(item.qty)) ? parseInt(item.qty, 10) : 1;
                    
                    if (!GroupedMap[key]) {
                        GroupedMap[key] = { inv: doRow.inv, code: item.code, desc: item.desc, route: route, qty: 0 };
                    }
                    GroupedMap[key].qty += lineQty;'''

new_map = '''                    const lineQty = (item.qty && !isNaN(item.qty)) ? parseInt(item.qty, 10) : 1;
                    
                    if (!GroupedMap[key]) {
                        GroupedMap[key] = { 
                            inv: doRow.inv, code: item.code, desc: item.desc, 
                            route: route, qty: 0, 
                            vol: item.vol !== undefined && item.vol !== null ? parseFloat(item.vol) : 0 // Fallback to 0 so MasterData is used
                        };
                    }
                    GroupedMap[key].qty += lineQty;'''

content = content.replace(old_map, new_map)

with open('js/do_load_planner.js', 'w') as f:
    f.write(content)

print("Patched do_load_planner.js")
