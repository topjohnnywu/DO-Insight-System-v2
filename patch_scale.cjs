const fs = require('fs');
let code = fs.readFileSync('js/volume_capacity_planner.js', 'utf8');

code = code.replace(
    /return flGroup;\n        \};\n\n        \/\/ Place the Forklift/,
    `flGroup.scale.set(1.1, 1.1, 1.1); // 10% larger
            return flGroup;
        };

        // Place the Forklift`
);

fs.writeFileSync('js/volume_capacity_planner.js', code);

let looseCode = fs.readFileSync('js/loose_load_planner.js', 'utf8');
looseCode = looseCode.replace(
    /return flGroup;\n        \};\n\n        \/\/ Place the Forklift/,
    `flGroup.scale.set(1.1, 1.1, 1.1); // 10% larger
            return flGroup;
        };

        // Place the Forklift`
);
fs.writeFileSync('js/loose_load_planner.js', looseCode);

