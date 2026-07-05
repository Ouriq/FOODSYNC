import os

js_path = 'c:/Users/thori/Latihan/foodsyncerp/js/market-v2.js'

with open(js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

target = """const showView = (viewToShow) => {
      if (marketDashboardView) marketDashboardView.style.display = 'none';
      if (marketAddFormView) marketAddFormView.style.display = 'none';
      if (marketSuccessView) marketSuccessView.style.display = 'none';
      if (viewToShow) viewToShow.style.display = 'block';
    };"""

replacement = """const showView = (viewToShow) => {
      if (marketDashboardView) marketDashboardView.style.display = 'none';
      if (marketAddFormView) marketAddFormView.style.display = 'none';
      if (marketSuccessView) marketSuccessView.style.display = 'none';
      if (viewToShow) {
          viewToShow.style.display = 'block';
          const mainContent = document.querySelector('.main-content');
          if (mainContent) {
              mainContent.scrollTop = 0;
          } else {
              window.scrollTo(0, 0);
          }
      }
    };"""

if target in js_content:
    js_content = js_content.replace(target, replacement)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("market-v2.js patched with scroll reset.")
else:
    # If slight mismatch, just replace the display block assignment
    target2 = "if (viewToShow) viewToShow.style.display = 'block';"
    replacement2 = "if (viewToShow) { viewToShow.style.display = 'block'; const mc = document.querySelector('.main-content'); if(mc) mc.scrollTop = 0; else window.scrollTo(0,0); }"
    js_content = js_content.replace(target2, replacement2)
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print("market-v2.js patched with scroll reset (fallback).")
