(function(){
    // Depende de la constante global PRODUCTS (de products.js)
    const input = document.getElementById('product-search');
    const suggBox = document.getElementById('search-suggestions');
    const notfound = document.getElementById('search-notfound');
    const snfClose = document.getElementById('snf-close');
    const snfOverlay = document.getElementById('snf-overlay');

    if (!input || !suggBox || typeof PRODUCTS === 'undefined') return;

    const suggestions = buildSuggestions();
    let activeIndex = -1;

    input.addEventListener('input', onInput);
    input.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', (e)=>{
        if (!e.target.closest('.search-wrap')) hideSuggestions();
    });

    if (snfClose) snfClose.addEventListener('click', closeNotFound);
    if (snfOverlay) snfOverlay.addEventListener('click', closeNotFound);

    function buildSuggestions(){
        const set = new Set();
        const out = [];
        // categories
        PRODUCTS.forEach(p=> set.add(p.category));
        Array.from(set).forEach(cat => out.push({type:'category', label: cat}));
        // product names
        PRODUCTS.forEach(p=> out.push({type:'product', label: p.name}));
        return out;
    }

    function onInput(e){
        const q = (e.target.value || '').trim();
        if (!q){ hideSuggestions(); renderOriginal(); return; }
        const ql = q.toLowerCase();
        const matches = suggestions.filter(s=> s.label.toLowerCase().includes(ql)).slice(0,8);
        renderSuggestions(matches);
    }

    function onKeyDown(e){
        const items = suggBox.querySelectorAll('.item');
        if (!items.length) return;
        if (e.key === 'ArrowDown'){
            e.preventDefault(); activeIndex = Math.min(activeIndex+1, items.length-1);
            updateActive(items);
        } else if (e.key === 'ArrowUp'){
            e.preventDefault(); activeIndex = Math.max(activeIndex-1, 0); updateActive(items);
        } else if (e.key === 'Enter'){
            e.preventDefault(); if (activeIndex >=0 && items[activeIndex]){
                items[activeIndex].click();
            } else {
                doSearch(input.value.trim());
            }
        }
    }

    function updateActive(items){
        items.forEach((it, idx)=> it.setAttribute('aria-selected', idx===activeIndex));
        if (items[activeIndex]) items[activeIndex].scrollIntoView({block:'nearest'});
    }

    function renderSuggestions(list){
        suggBox.innerHTML = '';
        if (!list.length) { hideSuggestions(); return; }
        list.forEach(s=>{
            const div = document.createElement('div');
            div.className = 'item';
            div.tabIndex = 0;
            div.setAttribute('role','option');
            div.innerHTML = `<div class="label">${escapeHtml(s.label)}</div><div class="meta">${s.type==='category'? 'Categoría':'Producto'}</div>`;
            div.addEventListener('click', ()=>{
                input.value = s.label;
                hideSuggestions();
                // si es categoría, buscar por categoría exacta
                if (s.type === 'category') doSearch(s.label, 'category'); else doSearch(s.label, 'product');
            });
            suggBox.appendChild(div);
        });
        activeIndex = -1;
        suggBox.classList.add('active');
    }

    function hideSuggestions(){
        suggBox.classList.remove('active');
        suggBox.innerHTML = '';
        activeIndex = -1;
    }

    function doSearch(query, hint){
        const q = (query||'').trim().toLowerCase();
        if (!q) { renderOriginal(); return; }
        let results = [];
        if (hint === 'category') {
            results = PRODUCTS.filter(p => p.category.toLowerCase() === q);
        } else if (hint === 'product'){
            results = PRODUCTS.filter(p => p.name.toLowerCase() === q || p.name.toLowerCase().includes(q));
        } else {
            results = PRODUCTS.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
        }
        if (results.length === 0) {
            showNotFound();
            return;
        }
        renderSearchResults(results);
    }

    function renderSearchResults(results){
        const mainContainer = document.getElementById('product-list');
        if (!mainContainer) return;
        const grouped = results.reduce((acc, product) => {
            if (!acc[product.category]) acc[product.category] = [];
            acc[product.category].push(product);
            return acc;
        }, {});
        let html = '';
        for (const category in grouped) {
            const safeId = category.replace(/\s+/g, '-').toLowerCase();
            const carouselId = `search-${safeId}`;
            html += `
                <section class="category-section animate-fade-in">
                    <div class="category-header">
                        <h2>${escapeHtml(category)}</h2>
                    </div>
                    <div class="product-carousel" id="${carouselId}">
                        ${grouped[category].map(p => `
                            <div class="product-card" onclick="openProductModal(${p.id})">
                                <div class="img-container">
                                    <img src="${p.img}" alt="${escapeHtml(p.name)}" loading="lazy">
                                </div>
                                <div class="info">
                                    <h3>${escapeHtml(p.name)}</h3>
                                    <p class="price">$${p.price.toFixed(2)}</p>
                                </div>
                                <button class="btn-add" onclick="event.stopPropagation(); addToCart(${p.id})">Agregar</button>
                            </div>
                        `).join('')}
                    </div>
                </section>
            `;
        }
        mainContainer.innerHTML = html || '<p class="empty-msg">No se encontraron productos.</p>';
        window.scrollTo({ top: document.getElementById('productos')?.offsetTop || 0, behavior: 'smooth' });
    }

    function renderOriginal(){
        // reutiliza la función global si existe
        if (typeof renderProducts === 'function') {
            renderProducts();
            return;
        }
        // fallback: show todos
        const mainContainer = document.getElementById('product-list');
        if (!mainContainer) return;
        mainContainer.innerHTML = PRODUCTS.map(p=> `<div>${escapeHtml(p.name)}</div>`).join('');
    }

    function showNotFound(){
        if (!notfound) { alert('Producto no disponible en nuestra tienda'); return; }
        notfound.setAttribute('aria-hidden','false');
        document.body.style.overflow = 'hidden';
    }
    function closeNotFound(){
        if (!notfound) return;
        notfound.setAttribute('aria-hidden','true');
        document.body.style.overflow = '';
    }

    // small helper to avoid XSS in injected HTML
    function escapeHtml(str){
        return String(str).replace(/[&<>"'`]/g, (s) => ({
            '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;','`':'&#96;'
        })[s]);
    }
})();
