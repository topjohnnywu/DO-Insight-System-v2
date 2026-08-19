import glob

new_item = """                    <li>
                        <a href="manual_truck_planning.html" class="sidebar-nav-item">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="1" y="3" width="15" height="13"/>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                                <line x1="8" y1="11" x2="8" y2="11.01" stroke-width="4" stroke-linecap="round"/>
                            </svg>
                            <span>Truck Planning</span>
                        </a>
                    </li>"""

html_files = glob.glob("*.html")
for f in html_files:
    with open(f, 'r') as file:
        content = file.read()
    
    # We will insert the new item after the Daily Summary List item
    target_string = '''                            <span>Daily Summary List</span>
                        </a>
                    </li>'''
    
    if target_string in content and "manual_truck_planning.html" not in content:
        content = content.replace(target_string, target_string + '\n' + new_item)
        with open(f, 'w') as file:
            file.write(content)
        print(f"Updated {f}")

