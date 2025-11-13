// Kitchen Organiser - basic client-side logic
(function(){
  const STORAGE_KEY = 'kitchenItems_v1';
  let items = [];

  // elements
  const addForm = document.getElementById('addForm');
  const itemName = document.getElementById('itemName');
  const itemQty = document.getElementById('itemQty');
  const itemCategory = document.getElementById('itemCategory');
  const itemsList = document.getElementById('itemsList');
  const search = document.getElementById('search');
  const filterCategory = document.getElementById('filterCategory');
  const exportBtn = document.getElementById('exportBtn');
  const importFile = document.getElementById('importFile');
  const itemexpiry = document.getElementById('itemExpiry');

  function save(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  function load(){
    try{
      items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }catch(e){ items = []; }
  }

  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

  function addItem(e){
    e && e.preventDefault();
    const name = itemName.value.trim();
    if(!name) return;
    const obj = { id: uid(), name, qty: itemQty.value.trim(), category: itemCategory.value, created: new Date().toISOString(), used:false };
    items.unshift(obj);
    save();
    render();
    addForm.reset();
    itemName.focus();
  }

  function removeItem(id){
    items = items.filter(i=>i.id !== id);
    save(); render();
  }
  function toggleUsed(id){
    const it = items.find(i=>i.id===id); if(!it) return; it.used = !it.used; save(); render();
  }

  function render(){
    const q = (search.value||'').trim().toLowerCase();
    const cat = filterCategory.value;
    itemsList.innerHTML = '';
    const filtered = items.filter(i=>{
      if(cat !== 'All' && i.category !== cat) return false;
      if(!q) return true;
      return i.name.toLowerCase().includes(q) || (i.qty||'').toLowerCase().includes(q) || i.category.toLowerCase().includes(q);
    });

    if(filtered.length===0){
      itemsList.innerHTML = '<li class="empty">No items — add something above.</li>';
      return;
    }

    for(const it of filtered){
      const li = document.createElement('li'); li.className='item-card';
      li.innerHTML = `
        <div class="item-row">
          <div>
            <div class="item-title">${escapeHtml(it.name)}</div>
            <div class="item-meta">${it.qty?escapeHtml(it.qty)+' • ':''}${escapeHtml(it.category)}</div>
          </div>
          <div class="card-actions">
            <button class="btn small" data-action="toggle" data-id="${it.id}">${it.used? 'Undo' : 'Used'}</button>
            <button class="btn danger small" data-action="del" data-id="${it.id}">Delete</button>
          </div>
        </div>
      `;
      itemsList.appendChild(li);
    }
  }

  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }

  // events
  addForm.addEventListener('submit', addItem);
  itemsList.addEventListener('click', e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.getAttribute('data-id'); const action = btn.getAttribute('data-action');
    if(action==='del') removeItem(id);
    if(action==='toggle') toggleUsed(id);
  });

  search.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); render(); }});
  filterCategory.addEventListener('change', render);

  exportBtn.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(items, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kitchen-items.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });

  importFile.addEventListener('change', async (e)=>{
    const f = e.target.files && e.target.files[0]; if(!f) return;
    try{
      const txt = await f.text(); const data = JSON.parse(txt);
      if(Array.isArray(data)){
        // merge with existing but keep unique ids
        const byId = new Map(items.map(i=>[i.id,i]));
        for(const it of data){ if(it.id && !byId.has(it.id)) items.push(it); }
        save(); render();
      }else alert('JSON must be an array of items');
    }catch(err){ alert('Failed to import: '+err.message); }
    importFile.value = '';
  });

  // init
  load(); render();
  // expose for debug
  window.KitchenOrganiser = { addItem, items };
})();
