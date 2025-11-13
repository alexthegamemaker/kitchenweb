# Kitchen Organiser

A small client-side app to track pantry items, categories and basic CRUD operations.

Files:
- `index.html` — main page
- `styles.css` — styles
- `script.js` — client logic (localStorage, import/export)

How to use:
1. Open `index.html` in your browser (double-click or use a local web server).
2. Add items with name, optional qty and category.
3. Use search or category filter to find items.

Notes:
- Data is saved to browser `localStorage` under the key `kitchenItems_v1`.
- Works offline once files are loaded.

Next steps (ideas):
- Add expiry dates and sorting
- Add categories management
- Add confirmation for deletions
- Add progressive web app support (service worker)