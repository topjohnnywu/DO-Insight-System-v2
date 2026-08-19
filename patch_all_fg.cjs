const fs = require('fs');

['js/do_load_planner.js', 'js/volume_capacity_planner.js', 'do_load_planner.html'].forEach(file => {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(/var\(--fg-default\)/g, 'var(--fg)');
        fs.writeFileSync(file, code);
    }
});
