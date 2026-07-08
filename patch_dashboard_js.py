import os

js_path = 'js/dashboard.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to wrap lines 34 to 180 into a function renderDashboardData()
# Line 34 starts with: // --- FETCH DYNAMIC DATA DARI LOCALSTORAGE ---
# Line 180 is:   });
# And then we call it and add event listener.

if "function renderDashboardData" not in content:
    # Split content at the start of fetch
    parts = content.split('  // --- FETCH DYNAMIC DATA DARI LOCALSTORAGE ---')
    if len(parts) == 2:
        top_part = parts[0]
        bottom_part = parts[1]
        
        # Split bottom_part at the logout button event listener
        bottom_parts = bottom_part.split("  document.getElementById('logoutBtn').addEventListener('click', () => {")
        if len(bottom_parts) == 2:
            middle = bottom_parts[0] # this is the rendering logic
            bottom = "  document.getElementById('logoutBtn').addEventListener('click', () => {" + bottom_parts[1]
            
            # Find the new Chart(ctx, { part
            middle = middle.replace("  new Chart(ctx, {", "  if (window.revenueChart) { window.revenueChart.destroy(); }\n  window.revenueChart = new Chart(ctx, {")
            
            new_middle = """
  function renderDashboardData() {
    // --- FETCH DYNAMIC DATA DARI LOCALSTORAGE ---""" + middle + """
  }

  // Panggil pertama kali
  renderDashboardData();

  // Dengarkan perubahan dari tab lain atau dari firebase-sync
  window.addEventListener('storage', (e) => {
    if (e.key === 'sales_orders') {
      renderDashboardData();
    }
  });

"""
            new_content = top_part + new_middle + bottom
            
            with open(js_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print("Successfully patched js/dashboard.js")
        else:
            print("Failed to split at logout event listener")
    else:
        print("Failed to split at FETCH DYNAMIC DATA")
else:
    print("Already patched")
