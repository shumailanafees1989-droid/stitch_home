// LUMIERE Supabase Client Configuration & Sync Manager

const SUPABASE_CONFIG = {
  // Default values or user-configured credentials
  url: localStorage.getItem('lumiere_supabase_url') || '',
  anonKey: localStorage.getItem('lumiere_supabase_anon_key') || '',
  client: null,
  isConnected: false
};

// Initialize Supabase Client if credentials exist
function initSupabase() {
  if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey && window.supabase) {
    try {
      SUPABASE_CONFIG.client = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
      );
      SUPABASE_CONFIG.isConnected = true;
      console.log('⚡ LUMIERE: Supabase client initialized.');
      return SUPABASE_CONFIG.client;
    } catch (err) {
      console.warn('⚠️ LUMIERE: Supabase initialization error:', err.message);
      SUPABASE_CONFIG.isConnected = false;
      return null;
    }
  }
  SUPABASE_CONFIG.isConnected = false;
  return null;
}

// Save & Update credentials dynamically from UI Settings modal
function updateSupabaseCredentials(url, key) {
  if (url && key) {
    localStorage.setItem('lumiere_supabase_url', url.trim());
    localStorage.setItem('lumiere_supabase_anon_key', key.trim());
    SUPABASE_CONFIG.url = url.trim();
    SUPABASE_CONFIG.anonKey = key.trim();
    return initSupabase();
  } else {
    localStorage.removeItem('lumiere_supabase_url');
    localStorage.removeItem('lumiere_supabase_anon_key');
    SUPABASE_CONFIG.url = '';
    SUPABASE_CONFIG.anonKey = '';
    SUPABASE_CONFIG.client = null;
    SUPABASE_CONFIG.isConnected = false;
    return null;
  }
}

// Fetch products from Supabase with fallback to local catalog
async function apiGetProducts() {
  const client = initSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database fields to standard format
        return data.map(item => ({
          id: item.id,
          name: item.name,
          subtitle: item.subtitle,
          category: item.category,
          price: Number(item.price),
          formattedPrice: item.formatted_price || `$${Number(item.price).toFixed(2)}`,
          description: item.description,
          material: item.material,
          origin: item.origin,
          care: item.care,
          images: Array.isArray(item.images) ? item.images : [item.images],
          sizes: item.sizes || ['XS', 'S', 'M', 'L'],
          colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : (item.colors || []),
          featured: Boolean(item.featured)
        }));
      }
    } catch (e) {
      console.warn('Using local catalog fallback:', e.message);
    }
  }
  // Fallback to local products
  return typeof LUMIERE_PRODUCTS !== 'undefined' ? LUMIERE_PRODUCTS : [];
}

// Fetch wishlist from Supabase with fallback to localStorage
async function apiGetWishlist() {
  const localList = JSON.parse(localStorage.getItem('lumiere_wishlist') || '[]');
  const client = initSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('wishlist')
        .select('product_id')
        .eq('user_id', 'guest_user');

      if (!error && data) {
        const remoteIds = data.map(row => row.product_id);
        const merged = Array.from(new Set([...localList, ...remoteIds]));
        localStorage.setItem('lumiere_wishlist', JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn('Wishlist remote fetch error:', e.message);
    }
  }
  return localList;
}

// Toggle Wishlist item in Supabase + local storage
async function apiToggleWishlist(productId) {
  let list = JSON.parse(localStorage.getItem('lumiere_wishlist') || '[]');
  const index = list.indexOf(productId);
  let isAdded = false;

  if (index > -1) {
    list.splice(index, 1);
    isAdded = false;
  } else {
    list.push(productId);
    isAdded = true;
  }

  localStorage.setItem('lumiere_wishlist', JSON.stringify(list));

  const client = initSupabase();
  if (client) {
    try {
      if (isAdded) {
        await client.from('wishlist').insert({
          user_id: 'guest_user',
          product_id: productId
        });
      } else {
        await client.from('wishlist')
          .delete()
          .eq('user_id', 'guest_user')
          .eq('product_id', productId);
      }
    } catch (e) {
      console.warn('Supabase wishlist sync warning:', e.message);
    }
  }

  return { isAdded, list };
}

// Submit checkout/order to Supabase
async function apiCreateOrder(orderData) {
  const client = initSupabase();
  if (client) {
    try {
      const { data, error } = await client.from('orders').insert([orderData]).select();
      if (!error && data) return { success: true, order: data[0] };
    } catch (e) {
      console.warn('Supabase order creation error:', e.message);
    }
  }
  return { success: true, order: { id: 'ORD-' + Date.now(), ...orderData } };
}

// Auto-init on script load
window.addEventListener('DOMContentLoaded', () => {
  initSupabase();
});
