import re

with open('manual_truck_planning.html', 'r') as f:
    content = f.read()

modal_html = """
    <!-- Final Plan Modal -->
    <div id="finalPlanModal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center; backdrop-filter: blur(4px);">
        <div class="glass-panel" style="width: 90%; max-width: 1200px; max-height: 90vh; display: flex; flex-direction: column; background: var(--bg); border: 1px solid var(--border); border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
            <div style="padding: 20px 30px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0; font-size: 1.5rem; font-weight: 700;">Final Truck Plan</h2>
                <div style="display: flex; gap: 12px;">
                    <button onclick="window.print()" class="action-btn" style="background: var(--surface-hover); border: 1px solid var(--border); color: var(--fg); padding: 8px 16px; border-radius: 6px; cursor: pointer;">
                        Print
                    </button>
                    <button onclick="closeFinalPlan()" class="action-btn" style="background: none; border: none; color: var(--fg-muted); cursor: pointer;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div id="finalPlanContent" style="padding: 30px; overflow-y: auto; flex: 1; background: var(--bg);">
                <!-- Final plan will be rendered here -->
            </div>
        </div>
    </div>
"""

content = content.replace('</body>', modal_html + '\n</body>')

with open('manual_truck_planning.html', 'w') as f:
    f.write(content)

print("Modal fixed")
