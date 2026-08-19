const fs = require('fs');
let code = fs.readFileSync('do_summary_generator.html', 'utf8');

// Add "collapsed" class to sticky-remarks-card
code = code.replace(
    '<div class="sticky-remarks-card" id="quickRemarksPanel">',
    '<div class="sticky-remarks-card collapsed" id="quickRemarksPanel">'
);

// Change button text to "▼ Expand"
code = code.replace(
    '<button type="button" class="panel-toggle-btn" id="remarksToggleBtn">▲ Collapse</button>',
    '<button type="button" class="panel-toggle-btn" id="remarksToggleBtn">▼ Expand</button>'
);

fs.writeFileSync('do_summary_generator.html', code);
