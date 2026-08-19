import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# I need to replace the header section of the truck board.
# Let's find the exact string.
import sys

search_str = """                <div style="padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--surface-hover);">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <h3 style="margin: 0; font-size: 1.05rem; font-weight: 600; color: var(--fg);">Truck ${index + 1}${typeStr}</h3>
                        <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.8rem;">Vol: ${totalVol.toFixed(2)} m³</span>
                    </div>
                    <button onclick="removeTruck('${tId}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>"""

# Ensure we have the meta extraction before this:
meta_ext = """        const meta = typeof truckMeta !== 'undefined' && truckMeta[tId] ? truckMeta[tId] : { size: "40HC", hub: "", dest: "" };
        html += `"""

if search_str in content:
    replace_str = """                <div style="padding: 12px 20px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; background: var(--surface-hover);">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <h3 style="margin: 0; font-size: 1.05rem; font-weight: 600; color: var(--fg);">Truck ${index + 1}${typeStr}</h3>
                            <span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.8rem;">Vol: ${totalVol.toFixed(2)} m³</span>
                        </div>
                        <button onclick="removeTruck('${tId}')" style="background: none; border: none; color: #94a3b8; cursor: pointer; display: flex; align-items: center;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                    </div>
                    <div style="display: flex; gap: 8px; font-size: 0.85rem;">
                        <select onchange="window.updateTruckMeta('${tId}', 'size', this.value)" style="padding: 6px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--fg); font-weight: 500;">
                            <option value="40HC" ${meta.size === '40HC' ? 'selected' : ''}>40HC</option>
                            <option value="20GP" ${meta.size === '20GP' ? 'selected' : ''}>20GP</option>
                            <option value="24FT" ${meta.size === '24FT' ? 'selected' : ''}>24FT</option>
                            <option value="14FT" ${meta.size === '14FT' ? 'selected' : ''}>14FT</option>
                        </select>
                        <input type="text" placeholder="Hub (e.g. HB01)" value="${meta.hub || ''}" onchange="window.updateTruckMeta('${tId}', 'hub', this.value)" style="padding: 6px 10px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--fg); width: 110px;">
                        <input type="text" placeholder="Destination" value="${meta.dest || ''}" onchange="window.updateTruckMeta('${tId}', 'dest', this.value)" style="padding: 6px 10px; border-radius: 6px; background: var(--surface); border: 1px solid var(--border); color: var(--fg); flex: 1;">
                    </div>
                </div>"""
    
    # We also need to inject `meta` definition before html +=
    # find where `html += \`` is
    content = content.replace('        html += `\n            <div class="glass-card"', meta_ext + '\n            <div class="glass-card"')
    
    content = content.replace(search_str, replace_str)
    
    with open('js/manual_truck_planning.js', 'w') as f:
        f.write(content)
    print("Success")
else:
    print("Could not find string")

