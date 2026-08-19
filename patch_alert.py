import re

with open('js/manual_truck_planning.js', 'r') as f:
    content = f.read()

# Replace alerts
content = content.replace('alert("Please select a target truck.");', 'showCustomAlert("Please select a target truck.");')
content = content.replace('alert("Please select at least one DO to assign.");', 'showCustomAlert("Please select at least one DO to assign.");')
content = content.replace('alert(`You selected ${consignee} for ${truckName}, but forgot to select DO #${missedDO.inv}. All DOs for same adress must be assigned to the same truck!`);', 'showCustomAlert(`You selected ${consignee} for ${truckName}, but forgot to select DO #${missedDO.inv}. All DOs for same address must be assigned to the same truck!`);')

custom_alert_code = """
function showCustomAlert(message) {
    let alertContainer = document.getElementById('custom-alert-container');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'custom-alert-container';
        alertContainer.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; max-width: 400px;';
        document.body.appendChild(alertContainer);
    }
    
    const alertBox = document.createElement('div');
    alertBox.style.cssText = 'background: #ef4444; color: white; padding: 12px 20px; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); font-weight: 500; font-size: 0.95rem; display: flex; align-items: flex-start; gap: 12px; transform: translateX(120%); opacity: 0; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255,255,255,0.2);';
    
    alertBox.innerHTML = `
        <div style="flex-shrink: 0; margin-top: 2px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <span style="line-height: 1.4; flex-grow: 1;">${message}</span>
        <button style="background: none; border: none; color: white; cursor: pointer; padding: 2px; margin-left: 8px; opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" onclick="this.parentElement.remove()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
    `;
    
    alertContainer.appendChild(alertBox);
    
    // Animate in
    requestAnimationFrame(() => {
        alertBox.style.transform = 'translateX(0)';
        alertBox.style.opacity = '1';
    });
    
    // Auto remove after 6 seconds
    setTimeout(() => {
        alertBox.style.transform = 'translateX(120%)';
        alertBox.style.opacity = '0';
        setTimeout(() => alertBox.remove(), 300);
    }, 6000);
}
"""

content += "\n" + custom_alert_code

with open('js/manual_truck_planning.js', 'w') as f:
    f.write(content)
