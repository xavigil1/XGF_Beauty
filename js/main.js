// 1. Estado Global
let currentFilter = 'all';
let currentSlide = 0;
let slideInterval;

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
    initFilters();
    initHeroSlider();
    
    // UI Events: Apertura y Cierre del carrito
    document.getElementById('cart-toggle')?.addEventListener('click', () => toggleCart(true));
    document.getElementById('cart-close')?.addEventListener('click', () => toggleCart(false));
    document.getElementById('overlay')?.addEventListener('click', () => toggleCart(false));
    
    // Evento para el Botón Flotante Redondo
    const fab = document.getElementById('cart-fab');
    if (fab) {
        fab.addEventListener('click', () => toggleCart(true));
    }

    // Lógica de Scroll: Controla cuándo aparece el botón redondo
    window.addEventListener('scroll', () => {
        const fabElement = document.getElementById('cart-fab');
        if (fabElement) {
            // Aparece tras bajar 200px (más sensible en pantallas pequeñas)
            if (window.scrollY > 200) {
                fabElement.classList.add('visible');
            } else {
                fabElement.classList.remove('visible');
            }
        }
    });
    
    const whatsappBtn = document.getElementById('whatsapp-btn');
    if (whatsappBtn) whatsappBtn.addEventListener('click', sendWhatsApp);
});

// 2. Lógica del Hero Slider
function initHeroSlider() {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const totalSlides = slides.length;
    if (totalSlides === 0) return;

    function showSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index]?.classList.add('active');
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        showSlide(currentSlide);
    }

    slideInterval = setInterval(nextSlide, 5000);

    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            currentSlide = idx;
            showSlide(currentSlide);
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
        });
    });
}

// 3. Lógica de Filtros de Categoría
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-category');
            currentFilter = (currentFilter === category) ? 'all' : category;
            
            // UX: Centrado automático en barras de scroll móvil
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            
            updateFilterUI();
            renderProducts();
        });
    });
}

function updateFilterUI() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === currentFilter);
    });
}

// 4. Renderizado de Productos
function renderProducts() {
    const mainContainer = document.getElementById('product-list');
    if (!mainContainer) return;

    const filteredProducts = currentFilter === 'all' 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === currentFilter);

    const grouped = filteredProducts.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
    }, {});

    let html = '';
    for (const category in grouped) {
        const safeId = category.replace(/\s+/g, '-').toLowerCase();
        const carouselId = `carousel-${safeId}`;

        html += `
            <section class="category-section animate-fade-in">
                <div class="category-header">
                    <h2>${category}</h2>
                    <div class="carousel-controls">
                        <button class="ctrl-btn prev" onclick="moveCarousel('${carouselId}', -1)">&#10094;</button>
                        <button class="ctrl-btn next" onclick="moveCarousel('${carouselId}', 1)">&#10095;</button>
                    </div>
                </div>
                <div class="product-carousel" id="${carouselId}">
                    ${grouped[category].map(p => `
                        <div class="product-card" onclick="openProductModal(${p.id})">
                            <div class="img-container">
                                <img src="${p.img}" alt="${p.name}" loading="lazy">
                            </div>
                            <div class="info">
                                <h3>${p.name}</h3>
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
}

// 5. Movimiento de Flechas de Carrusel
function moveCarousel(id, direction) {
    const carousel = document.getElementById(id);
    if (!carousel) return;
    const firstCard = carousel.querySelector('.product-card');
    if (!firstCard) return;
    
    const style = window.getComputedStyle(carousel);
    const gap = parseInt(style.columnGap) || 20;
    const scrollAmount = (firstCard.offsetWidth + gap) * 1.5;

    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
}

// 6. UI del Carrito (Sincronización de Contadores)
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const countLabel = document.getElementById('cart-count'); 
    const fabCountLabel = document.getElementById('cart-count-fab'); 
    const totalLabel = document.getElementById('cart-total');

    // Calculamos el total de unidades en el carrito
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

    // Actualizamos ambos contadores (Header y Botón Flotante)
    if (countLabel) countLabel.innerText = totalItems;
    if (fabCountLabel) fabCountLabel.innerText = totalItems;
    
    if (totalLabel) totalLabel.innerText = calculateTotal().toFixed(2);

    if (cartContainer) {
        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div style="text-align:center; padding:3rem; opacity:0.6;">
                    <p>Tu carrito está vacío</p>
                </div>
            `;
            return;
        }
        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `).join('');
    }
}

// 7. Toggle del Carrito y Bloqueo de Scroll
function toggleCart(isOpen) {
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('overlay');
    
    if (isOpen) {
        drawer?.classList.add('active');
        overlay?.classList.add('active');
        document.body.style.overflow = 'hidden'; // Evita scroll de fondo al estar abierto
    } else {
        drawer?.classList.remove('active');
        overlay?.classList.remove('active');
        document.body.style.overflow = ''; // Habilita scroll nuevamente
    }
}

// PRODUCT MODAL
let pmIndex = 0;
let pmQty = 1;

function openProductModal(id) {
    const idx = PRODUCTS.findIndex(p => p.id === id);
    if (idx === -1) return;
    pmIndex = idx;
    pmQty = 1;
    renderProductModal();
    const modal = document.getElementById('product-modal');
    if (modal) { modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
}

function closeProductModal() {
    const modal = document.getElementById('product-modal');
    if (modal) { modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
}

function renderProductModal() {
    const product = PRODUCTS[pmIndex];
    if (!product) return;
    document.getElementById('pm-img').src = product.img || './images/placeholder.png';
    document.getElementById('pm-img').alt = product.name;
    document.getElementById('pm-name').innerText = product.name;
    document.getElementById('pm-desc').innerText = product.description || 'Descripción: Producto seleccionado cuidadosamente por su calidad y efectividad.';
    document.getElementById('pm-price').innerText = product.price.toFixed(2);
    document.getElementById('pm-qty').innerText = pmQty;
    // Ingredientes y fuente (si existen)
    const ingrEl = document.getElementById('pm-ingredients');
    const srcEl = document.getElementById('pm-source');
    if (ingrEl) {
        ingrEl.innerText = product.ingredients ? `Ingredientes: ${product.ingredients}` : '';
        ingrEl.style.display = product.ingredients ? 'block' : 'none';
    }
    if (srcEl) {
        if (product.source) {
            // si source es URL, hacemos link; ocultamos enlaces de búsqueda (bing) para evitar mostrar "Fuente: www.bing.com"
            try {
                const url = new URL(product.source);
                const host = url.hostname.toLowerCase();
                const isSearch = host.includes('bing') || url.href.includes('/search') || url.search.includes('q=');
                if (!isSearch) {
                    srcEl.innerHTML = `Fuente: <a href="${url.href}" target="_blank" rel="noopener noreferrer">${url.hostname}</a>`;
                    srcEl.style.display = 'block';
                } else {
                    srcEl.innerText = '';
                    srcEl.style.display = 'none';
                }
            } catch (e) {
                // no es una URL válida; mostramos texto simple
                srcEl.innerText = `Fuente: ${product.source}`;
                srcEl.style.display = 'block';
            }
        } else {
            srcEl.innerText = '';
            srcEl.style.display = 'none';
        }
    }
}

function changeModalQty(delta) {
    pmQty = Math.max(1, pmQty + delta);
    document.getElementById('pm-qty').innerText = pmQty;
}

function addToCartModal() {
    const product = PRODUCTS[pmIndex];
    if (!product) return;
    // add with quantity
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.quantity += pmQty;
    } else {
        cart.push({ ...product, quantity: pmQty });
    }
    updateCart();
    // bump FAB
    const fab = document.getElementById('cart-fab');
    if (fab) { fab.classList.remove('bump'); void fab.offsetWidth; fab.classList.add('bump'); }
    closeProductModal();
}

// Modal navigation
function pmNext() { pmIndex = (pmIndex + 1) % PRODUCTS.length; renderProductModal(); }
function pmPrev() { pmIndex = (pmIndex - 1 + PRODUCTS.length) % PRODUCTS.length; renderProductModal(); }

// Events for modal (bind after DOM ready)
document.addEventListener('DOMContentLoaded', () => {
    const pmClose = document.getElementById('pm-close');
    const pmOverlay = document.getElementById('pm-overlay');
    const pmNextBtn = document.getElementById('pm-next');
    const pmPrevBtn = document.getElementById('pm-prev');
    const pmInc = document.getElementById('pm-inc');
    const pmDec = document.getElementById('pm-dec');
    const pmAddBtn = document.getElementById('pm-add');

    pmClose?.addEventListener('click', closeProductModal);
    pmOverlay?.addEventListener('click', closeProductModal);
    pmNextBtn?.addEventListener('click', pmNext);
    pmPrevBtn?.addEventListener('click', pmPrev);
    pmInc?.addEventListener('click', () => changeModalQty(1));
    pmDec?.addEventListener('click', () => changeModalQty(-1));
    pmAddBtn?.addEventListener('click', () => {
        // visual feedback on modal add button
        if (pmAddBtn) {
            pmAddBtn.classList.remove('clicked');
            void pmAddBtn.offsetWidth; // reflow to restart animation
            pmAddBtn.classList.add('clicked');
            // cleanup after animation
            setTimeout(() => pmAddBtn.classList.remove('clicked'), 420);
        }
        addToCartModal();
    });

    // keyboard navigation
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('product-modal');
        if (!modal || modal.getAttribute('aria-hidden') === 'true') return;
        if (e.key === 'Escape') closeProductModal();
        if (e.key === 'ArrowRight') pmNext();
        if (e.key === 'ArrowLeft') pmPrev();
    });
});