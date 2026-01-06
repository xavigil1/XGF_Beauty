const PHONE_NUMBER = "584245639202"; // Reemplaza con tu número
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];

// --- CONFIGURACIÓN DE EFECTOS ---
const addSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'); 
addSound.volume = 0.15; // Volumen ligeramente más sutil

function addToCart(id) {
    // PRODUCTS debe estar definido globalmente en products.js
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return;

    const itemInCart = cart.find(item => item.id === id);

    if (itemInCart) {
        itemInCart.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    // --- FEEDBACK VISUAL Y SONORO DEL BOTÓN FLOTANTE ---
    
    // 1. Sonido instantáneo
    addSound.currentTime = 0; // Reinicia el audio por si se pulsa rápido
    addSound.play().catch(e => console.log("Interacción requerida para audio"));

    // 2. Animación de "salto" en el botón redondo
    const fab = document.getElementById('cart-fab');
    if (fab) {
        fab.classList.remove('bump'); 
        void fab.offsetWidth; // Reflow dinámico para reiniciar la animación CSS
        fab.classList.add('bump');
    }

    // 3. Feedback visual en el botón que disparó la acción (si aplica)
    try {
        const trigger = document.activeElement;
        if (trigger && trigger.classList && trigger.classList.contains('btn-add')) {
            trigger.classList.remove('clicked');
            void trigger.offsetWidth;
            trigger.classList.add('clicked');
            setTimeout(() => trigger.classList.remove('clicked'), 420);
        }
    } catch (e) {
        // no critical
    }

    updateCart();
    
    // OPCIONAL: Si prefieres que NO se abra el panel lateral cada vez, comenta la siguiente línea.
    // Al tener el botón flotante, a veces es mejor que el usuario siga comprando.
    if(typeof toggleCart === 'function') toggleCart(true);
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== id);
        }
        updateCart();
    }
}

function updateCart() {
    // Guardar en almacenamiento local
    localStorage.setItem('aura_cart', JSON.stringify(cart));
    
    // Cálculo de unidades totales
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Actualizar todos los contadores de la interfaz
    const countHeader = document.getElementById('cart-count');
    const countFab = document.getElementById('cart-count-fab');
    
    if (countHeader) countHeader.innerText = totalItems;
    if (countFab) countFab.innerText = totalItems;

    // Sincronizar con las funciones de dibujo en main.js
    if (typeof renderCart === 'function') renderCart();
    if (typeof renderProducts === 'function') renderProducts();
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function sendWhatsApp() {
    if (cart.length === 0) return alert("Tu carrito está vacío");

    let message = "¡Hola XGF Beauty! Me gustaría realizar este pedido:\n\n";
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n*Total: $${calculateTotal().toFixed(2)}*`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encodedMessage}`, '_blank');
}