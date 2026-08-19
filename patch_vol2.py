import re

with open('js/parsers.js', 'r') as f:
    content = f.read()

content = content.replace(
    '''                        trucks: itemTrucks,
                        hubs: itemHubs
                    });
                    if (ColFVal && !ProductMasterLookupMap[InvoiceKey].listK.includes(ColFVal)) {''',
    '''                        trucks: itemTrucks,
                        hubs: itemHubs,
                        vol: itemVol
                    });
                    if (ColFVal && !ProductMasterLookupMap[InvoiceKey].listK.includes(ColFVal)) {'''
)

with open('js/parsers.js', 'w') as f:
    f.write(content)

print("Patched parsers.js vol property")
