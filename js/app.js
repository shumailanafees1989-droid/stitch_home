// LUMIERE Core Application Logic
// Cart, Wishlist, Navigation, Supabase UI integration

// State Management
const LumiereState = {
  cart: JSON.parse(localStorage.getItem('lumiere_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('lumiere_wishlist') || '[]'),
  activeFilters: {
    category: 'ALL',
    sort: 'default',
    search: ''
  }
};

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, icon = 'check') {
  let toast = document.getElementById('lumiere-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'lumiere-toast';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="flex items-center space-x-3 bg-primary text-on-primary px-6 py-4 shadow-2xl border border-outline-variant/30 text-xs tracking-widest uppercase font-label">
      <span class="material-symbols-outlined text-sm">${icon}</span>
      <span>${message}</span>
    </div>
  `;

  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

// ==========================================
// SHOPPING BAG / CART
// ==========================================
function saveCart() {
  localStorage.setItem('lumiere_cart', JSON.stringify(LumiereState.cart));
  updateCartBadges();
  renderCartDrawer();
}

function addToCart(productId, size = 'M', color = 'Obsidian Black', quantity = 1) {
  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  if (!product) return;

  const existingIndex = LumiereState.cart.findIndex(
    item => item.productId === productId && item.size === size && item.color === color
  );

  if (existingIndex > -1) {
    LumiereState.cart[existingIndex].quantity += quantity;
  } else {
    LumiereState.cart.push({
      productId,
      name: product.name,
      price: product.price,
      formattedPrice: product.formattedPrice,
      image: product.images[0],
      size,
      color,
      quantity
    });
  }

  saveCart();
  showToast(`${product.name} added to Bag`, 'shopping_bag');
  openCartDrawer();
}

function updateCartQuantity(index, delta) {
  if (LumiereState.cart[index]) {
    LumiereState.cart[index].quantity += delta;
    if (LumiereState.cart[index].quantity <= 0) {
      LumiereState.cart.splice(index, 1);
      showToast('Item removed from Bag', 'delete');
    }
    saveCart();
  }
}

function removeFromCart(index) {
  if (LumiereState.cart[index]) {
    const item = LumiereState.cart[index];
    LumiereState.cart.splice(index, 1);
    saveCart();
    showToast(`${item.name} removed`, 'close');
  }
}

function getCartSubtotal() {
  return LumiereState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function updateCartBadges() {
  const count = LumiereState.cart.reduce((sum, item) => sum + item.quantity, 0);
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    if (count > 0) {
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  });
}

// ==========================================
// WISHLIST FUNCTIONALITY
// ==========================================
async function toggleWishlistItem(productId, buttonElement) {
  let isAdded = false;
  if (typeof apiToggleWishlist === 'function') {
    const res = await apiToggleWishlist(productId);
    isAdded = res.isAdded;
    LumiereState.wishlist = res.list;
  } else {
    const idx = LumiereState.wishlist.indexOf(productId);
    if (idx > -1) {
      LumiereState.wishlist.splice(idx, 1);
      isAdded = false;
    } else {
      LumiereState.wishlist.push(productId);
      isAdded = true;
    }
    localStorage.setItem('lumiere_wishlist', JSON.stringify(LumiereState.wishlist));
  }

  updateWishlistIcons();
  updateWishlistBadges();

  const product = typeof getProductById === 'function' ? getProductById(productId) : null;
  const name = product ? product.name : 'Item';
  if (isAdded) {
    showToast(`${name} added to Wishlist`, 'favorite');
  } else {
    showToast(`${name} removed from Wishlist`, 'heart_minus');
  }

  // If on wishlist page, re-render
  if (typeof renderWishlistPage === 'function') {
    renderWishlistPage();
  }
}

function updateWishlistIcons() {
  const buttons = document.querySelectorAll('[data-wishlist-id]');
  buttons.forEach(btn => {
    const id = btn.getAttribute('data-wishlist-id');
    const icon = btn.querySelector('.material-symbols-outlined') || btn;
    if (LumiereState.wishlist.includes(id)) {
      icon.style.fontVariationSettings = "'FILL' 1, 'wght' 400";
      icon.classList.add('text-black');
      btn.classList.add('is-wishlisted');
    } else {
      icon.style.fontVariationSettings = "'FILL' 0, 'wght' 300";
      btn.classList.remove('is-wishlisted');
    }
  });
}

function updateWishlistBadges() {
  const count = LumiereState.wishlist.length;
  const badges = document.querySelectorAll('.wishlist-count-badge');
  badges.forEach(b => {
    b.textContent = count;
    if (count > 0) b.classList.remove('hidden');
    else b.classList.add('hidden');
  });
}

// ==========================================
// CART DRAWER UI
// ==========================================
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCartDrawer();
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-subtotal');
  if (!container) return;

  if (LumiereState.cart.length === 0) {
    container.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-center p-6 space-y-4">
        <span class="material-symbols-outlined text-4xl text-outline-variant">shopping_bag</span>
        <p class="font-headline text-lg italic text-on-surface-variant">Your shopping bag is empty.</p>
        <a href="collection.html" onclick="closeCartDrawer()" class="editorial-underline font-label text-xs uppercase tracking-widest text-primary">
          Explore Collection 004
        </a>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '$0.00';
    return;
  }

  let html = '';
  LumiereState.cart.forEach((item, index) => {
    html += `
      <div class="flex space-x-4 py-4 border-b border-outline-variant/20">
        <div class="w-20 h-24 bg-surface-container flex-shrink-0 overflow-hidden">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover">
        </div>
        <div class="flex-1 flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start">
              <h4 class="font-headline text-sm font-semibold">${item.name}</h4>
              <button onclick="removeFromCart(${index})" class="text-outline hover:text-black transition-colors p-1">
                <span class="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <p class="font-label text-[10px] tracking-wider text-outline uppercase mt-0.5">Size: ${item.size} | ${item.color}</p>
          </div>
          <div class="flex justify-between items-center mt-2">
            <div class="flex items-center border border-outline-variant/30 px-2 py-0.5 space-x-3 text-xs">
              <button onclick="updateCartQuantity(${index}, -1)" class="hover:text-black">-</button>
              <span class="font-label">${item.quantity}</span>
              <button onclick="updateCartQuantity(${index}, 1)" class="hover:text-black">+</button>
            </div>
            <span class="font-body text-sm font-medium">$${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  if (subtotalEl) {
    subtotalEl.textContent = `$${getCartSubtotal().toFixed(2)}`;
  }
}

// ==========================================
// CHECKOUT MODAL
// ==========================================
function openCheckoutModal() {
  if (LumiereState.cart.length === 0) {
    showToast('Your bag is empty', 'info');
    return;
  }
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const totalEl = document.getElementById('checkout-total');
    if (totalEl) totalEl.textContent = `$${getCartSubtotal().toFixed(2)}`;
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

async function handleCheckoutSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('checkout-name')?.value || 'Guest';
  const email = document.getElementById('checkout-email')?.value || '';
  const address = document.getElementById('checkout-address')?.value || '';

  const orderData = {
    customer_name: name,
    customer_email: email,
    items: LumiereState.cart,
    total_amount: getCartSubtotal(),
    shipping_address: address,
    created_at: new Date().toISOString()
  };

  const btn = document.getElementById('checkout-submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="animate-pulse">Processing Order...</span>`;
  }

  if (typeof apiCreateOrder === 'function') {
    await apiCreateOrder(orderData);
  }

  setTimeout(() => {
    LumiereState.cart = [];
    saveCart();
    closeCheckoutModal();
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Confirm Order';
    }
    showToast('Thank you! Order placed successfully.', 'verified');
  }, 1200);
}

// ==========================================
// SUPABASE SETTINGS MODAL
// ==========================================
function openSupabaseModal() {
  let modal = document.getElementById('supabase-modal');
  if (!modal) {
    createSupabaseModalHtml();
    modal = document.getElementById('supabase-modal');
  }
  const urlInput = document.getElementById('supabase-url-input');
  const keyInput = document.getElementById('supabase-key-input');
  if (urlInput) urlInput.value = localStorage.getItem('lumiere_supabase_url') || '';
  if (keyInput) keyInput.value = localStorage.getItem('lumiere_supabase_anon_key') || '';
  updateSupabaseStatusBadge();
  modal.classList.remove('hidden');
}

function closeSupabaseModal() {
  const modal = document.getElementById('supabase-modal');
  if (modal) modal.classList.add('hidden');
}

function updateSupabaseStatusBadge() {
  const badge = document.getElementById('supabase-status-badge');
  const hasCreds = Boolean(localStorage.getItem('lumiere_supabase_url') && localStorage.getItem('lumiere_supabase_anon_key'));
  if (badge) {
    if (hasCreds) {
      badge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2"></span> Connected to Supabase`;
      badge.className = 'text-xs tracking-wider uppercase font-label text-emerald-600 flex items-center';
    } else {
      badge.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2"></span> Local Fallback Mode (Ready for Supabase credentials)`;
      badge.className = 'text-xs tracking-wider uppercase font-label text-amber-600 flex items-center';
    }
  }
}

function saveSupabaseSettings() {
  const url = document.getElementById('supabase-url-input')?.value || '';
  const key = document.getElementById('supabase-key-input')?.value || '';

  if (typeof updateSupabaseCredentials === 'function') {
    updateSupabaseCredentials(url, key);
  } else {
    localStorage.setItem('lumiere_supabase_url', url);
    localStorage.setItem('lumiere_supabase_anon_key', key);
  }

  updateSupabaseStatusBadge();
  showToast(url ? 'Supabase Credentials Saved!' : 'Switched to Local Mode', 'database');
  setTimeout(() => {
    closeSupabaseModal();
  }, 1000);
}

function createSupabaseModalHtml() {
  const div = document.createElement('div');
  div.id = 'supabase-modal';
  div.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm hidden';
  div.innerHTML = `
    <div class="bg-surface-container-lowest max-w-lg w-full p-8 border border-outline-variant/30 shadow-2xl relative">
      <button onclick="closeSupabaseModal()" class="absolute top-6 right-6 p-2 text-outline hover:text-black">
        <span class="material-symbols-outlined">close</span>
      </button>
      <div class="mb-6">
        <p class="font-label text-[10px] tracking-[0.2em] text-outline uppercase">Database Settings</p>
        <h3 class="font-headline text-2xl font-light mt-1">Supabase Integration</h3>
        <div id="supabase-status-badge" class="mt-3"></div>
      </div>
      <div class="space-y-4">
        <div>
          <label class="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">Supabase Project URL</label>
          <input type="text" id="supabase-url-input" placeholder="https://your-project.supabase.co" class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:border-black font-body">
        </div>
        <div>
          <label class="block font-label text-[11px] uppercase tracking-wider text-on-surface-variant mb-1">Supabase Anon Key</label>
          <input type="password" id="supabase-key-input" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..." class="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/40 text-sm focus:outline-none focus:border-black font-body">
        </div>
        <p class="font-body text-xs text-outline leading-relaxed">
          Credentials are stored safely in your browser &amp; sync with <code class="bg-surface-container px-1 py-0.5 text-[11px]">public.products</code> and <code class="bg-surface-container px-1 py-0.5 text-[11px]">public.wishlist</code>. A ready-to-run schema is in <code class="bg-surface-container px-1 py-0.5 text-[11px]">supabase_schema.sql</code>.
        </p>
      </div>
      <div class="mt-8 flex justify-end space-x-4">
        <button onclick="closeSupabaseModal()" class="px-6 py-3 font-label text-xs uppercase tracking-widest border border-outline-variant/40 hover:bg-surface-container-low">Cancel</button>
        <button onclick="saveSupabaseSettings()" class="px-8 py-3 bg-primary text-on-primary font-label text-xs uppercase tracking-widest hover:bg-primary-container">Save Credentials</button>
      </div>
    </div>
  `;
  document.body.appendChild(div);
}

// ==========================================
// MOBILE MENU DRAWER
// ==========================================
function openMobileMenu() {
  const drawer = document.getElementById('menu-drawer');
  const backdrop = document.getElementById('menu-backdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  const drawer = document.getElementById('menu-drawer');
  const backdrop = document.getElementById('menu-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Global DOM Ready initializer
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadges();
  updateWishlistIcons();
  updateWishlistBadges();

  // Attach global button triggers
  document.querySelectorAll('[data-action="open-cart"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  document.querySelectorAll('[data-action="open-menu"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openMobileMenu();
    });
  });

  document.querySelectorAll('[data-action="open-supabase"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSupabaseModal();
    });
  });
});
