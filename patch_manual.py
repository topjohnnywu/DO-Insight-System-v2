import re

with open('manual_truck_planning.html', 'r') as f:
    content = f.read()

# Replace title
content = re.sub(r'<title>.*?</title>', '<title>Truck Planning - DO Insight System</title>', content)

# Activate correct sidebar item
content = content.replace('class="sidebar-nav-item active"', 'class="sidebar-nav-item"')
content = content.replace('<span>Truck Planning</span>\n                        </a>\n                    </li>', '<span>Truck Planning</span>\n                        </a>\n                    </li>'.replace('class="sidebar-nav-item"', 'class="sidebar-nav-item active"'))

# I'll just use a regex or string replacement to completely clear out the <main class="main-content"> ... </main> and replace it.
main_start = content.find('<main class="main-content">')
main_end = content.find('</main>', main_start) + 7

new_main = """<main class="main-content">
            <div class="content-wrapper">
                <div class="page-header">
                    <div>
                        <h1 class="page-title">Truck Planning</h1>
                        <p class="page-subtitle">Manually assign DOs to specific trucks based on Consignee</p>
                    </div>
                    <div class="header-actions">
                        <button onclick="addTruck()" style="background-color: #3b82f6; color: #ffffff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Add New Truck
                        </button>
                    </div>
                </div>

                <div style="display: flex; gap: 24px; align-items: flex-start; height: calc(100vh - 180px);">
                    
                    <!-- Left Panel: Unassigned DOs -->
                    <div class="glass-card" style="flex: 1; display: flex; flex-direction: column; height: 100%; max-width: 50%;">
                        <div style="padding: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center;">
                            <h2 style="margin: 0; font-size: 1.1rem; font-weight: 600; color: #f8fafc;">Unassigned DOs</h2>
                            <div style="display: flex; gap: 10px;">
                                <input type="text" id="unassignedSearch" placeholder="Search DO or Consignee..." style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); color: #f8fafc; padding: 6px 12px; border-radius: 6px; font-size: 0.9rem; outline: none;" onkeyup="renderUnassignedDOs()">
                            </div>
                        </div>
                        
                        <!-- Assignment Controls -->
                        <div style="padding: 12px 20px; background: rgba(59, 130, 246, 0.1); border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; gap: 12px; align-items: center;">
                            <span style="color: #94a3b8; font-size: 0.9rem;">Assign Selected To:</span>
                            <select id="targetTruckSelect" style="background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(255, 255, 255, 0.2); color: white; padding: 6px 12px; border-radius: 6px; font-size: 0.9rem; outline: none; flex-grow: 1;">
                                <!-- Options populated by JS -->
                            </select>
                            <button onclick="assignSelectedDOs()" style="background-color: #10b981; color: #ffffff; border: none; padding: 6px 16px; border-radius: 6px; font-weight: 600; cursor: pointer;">
                                Assign
                            </button>
                        </div>

                        <div style="flex: 1; overflow: auto;">
                            <table class="data-table" style="width: 100%;">
                                <thead>
                                    <tr>
                                        <th style="width: 40px; text-align: center;"><input type="checkbox" id="selectAllUnassigned" onclick="toggleAllUnassigned()"></th>
                                        <th>DO Number</th>
                                        <th>Consignee</th>
                                        <th style="text-align: right;">Vol (m³)</th>
                                    </tr>
                                </thead>
                                <tbody id="unassignedTableBody">
                                    <!-- Rows populated by JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Right Panel: Truck Boards -->
                    <div style="flex: 1; display: flex; flex-direction: column; gap: 20px; height: 100%; overflow-y: auto;" id="truckBoardsContainer">
                        <!-- Truck Boards populated by JS -->
                    </div>

                </div>
            </div>
        </main>"""

content = content[:main_start] + new_main + content[main_end:]

# Update script link
content = content.replace('<script src="js/truck_planning.js"></script>', '<script src="js/manual_truck_planning.js"></script>')

# To ensure the active class works perfectly:
content = content.replace('href="manual_truck_planning.html" class="sidebar-nav-item"', 'href="manual_truck_planning.html" class="sidebar-nav-item active"')

with open('manual_truck_planning.html', 'w') as f:
    f.write(content)

print("Created manual_truck_planning.html")
