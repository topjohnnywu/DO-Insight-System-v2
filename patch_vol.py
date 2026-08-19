import re

# 1. Update parsers.js
with open('js/parsers.js', 'r') as f:
    content = f.read()

content = content.replace(
    'const itemHubs = HubVal ? HubVal.split(/[,/&]+/).map(h => h.trim()).filter(Boolean) : [];\n                    ProductMasterLookupMap[InvoiceKey].items.push({',
    '''const itemHubs = HubVal ? HubVal.split(/[,/&]+/).map(h => h.trim()).filter(Boolean) : [];
                    let itemVol = null;
                    if (ColOVal) {
                        const parsedVol = parseFloat(ColOVal);
                        if (!isNaN(parsedVol)) itemVol = parsedVol;
                    }
                    ProductMasterLookupMap[InvoiceKey].items.push({'''
)

with open('js/parsers.js', 'w') as f:
    f.write(content)

print("Patched parsers.js")
