// --- CART.JS ---

function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  container.innerHTML = '';

  const checkoutBtn = document.querySelector('.cart-actions .btn:not(.alt)');

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    updateTotals();
    updateCartCount();

    // Disable checkout button
    if (checkoutBtn) {
      checkoutBtn.style.pointerEvents = 'none';
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.title = 'Your cart is empty';
    }
    return;
  }

  cart.forEach((it, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${it.img || it.image || 'assets/images/placeholder.png'}" alt="${it.name}">
      <div style="flex:1">
        <h4>${it.name}</h4>
        <p>₱${it.price.toFixed(2)}</p>
      </div>
      <div class="cart-quantity">
        <button class="qty-btn" data-index="${idx}" data-delta="-1">-</button>
        <span style="margin:0 8px;">${it.quantity}</span>
        <button class="qty-btn" data-index="${idx}" data-delta="1">+</button>
      </div>
      <div style="width:80px;text-align:right">₱${(it.price * it.quantity).toFixed(2)}</div>
      <button class="remove-btn btn alt" data-index="${idx}">Remove</button>
    `;
    container.appendChild(el);
  });

  // Attach event listeners
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      changeQty(parseInt(btn.dataset.index), parseInt(btn.dataset.delta));
    });
  });

  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeItem(parseInt(btn.dataset.index));
    });
  });

  updateTotals();
  updateCartCount();

  // Enable checkout button if cart has items
  if (checkoutBtn) {
    checkoutBtn.style.pointerEvents = 'auto';
    checkoutBtn.style.opacity = '1';
    checkoutBtn.title = '';
  }
}

function changeQty(index, delta) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartPage();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartPage();
}

function updateTotals() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = subtotal > 0 ? 80 : 0; // Temporary fallback, updated in checkout
  document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('cart-delivery').textContent = delivery.toFixed(2);
  document.getElementById('cart-total').textContent = (subtotal + delivery).toFixed(2);
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = count;
}

window.addEventListener('DOMContentLoaded', renderCartPage);

// --- CHECKOUT.JS ---

// Store location: Manolo Fortich, Bukidnon
const storeLocation = { lat: 8.5060, lng: 125.0176 };

// Haversine formula to calculate distance in km
function getDistanceFromStore(userLat, userLng) {
  const R = 6371; // Earth radius in km
  const dLat = (userLat - storeLocation.lat) * Math.PI / 180;
  const dLng = (userLng - storeLocation.lng) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(storeLocation.lat * Math.PI/180) * Math.cos(userLat * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}

// Delivery calculation: ₱20 per km, minimum ₱50
function calculateDelivery(distanceKm) {
  return Math.max(50, distanceKm * 20);
}

// Load checkout recap
function loadCheckoutRecap() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  let subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  let delivery = 80; // fallback
  let total = subtotal + delivery;

  const items = document.getElementById('checkout-items');
  if (items) items.innerHTML = '';
  cart.forEach(it => {
    const p = document.createElement('p');
    p.textContent = `${it.name} x${it.quantity} — ₱${(it.price * it.quantity).toFixed(2)}`;
    items && items.appendChild(p);
  });

  updateCartCount();

  // Disable checkout if cart empty
  const placeOrderBtn = document.getElementById('place-order');
  if (cart.length === 0 && placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.title = "Cart is empty";
  } else if (placeOrderBtn) {
    placeOrderBtn.disabled = false;
    placeOrderBtn.title = "";
  }

  // Try geolocation for dynamic delivery
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const distanceKm = getDistanceFromStore(position.coords.latitude, position.coords.longitude);
      delivery = calculateDelivery(distanceKm);
      total = subtotal + delivery;

      document.getElementById('recap-subtotal').textContent = subtotal.toFixed(2);
      document.getElementById('recap-delivery').textContent = delivery.toFixed(2);
      document.getElementById('recap-total').textContent = total.toFixed(2);

      // Store distance
      document.getElementById('checkout-form').dataset.distanceKm = distanceKm.toFixed(2);
    }, () => {
      // Fallback
      document.getElementById('recap-subtotal').textContent = subtotal.toFixed(2);
      document.getElementById('recap-delivery').textContent = delivery.toFixed(2);
      document.getElementById('recap-total').textContent = total.toFixed(2);
    });
  } else {
    document.getElementById('recap-subtotal').textContent = subtotal.toFixed(2);
    document.getElementById('recap-delivery').textContent = delivery.toFixed(2);
    document.getElementById('recap-total').textContent = total.toFixed(2);
  }
}

// DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
  loadCheckoutRecap();

  // Payment toggle
  document.querySelectorAll('input[name="payment"]').forEach(radio => {
    radio.addEventListener('change', () => {
      const selected = document.querySelector('input[name="payment"]:checked').value;
      document.getElementById('card-section').style.display = selected === 'card' ? 'block' : 'none';
    });
  });

  // Place order
  document.getElementById('place-order').addEventListener('click', () => {
    const name = document.getElementById('del-name').value.trim();
    const phone = document.getElementById('del-phone').value.trim();
    const address = document.getElementById('del-address').value.trim();
    const payment = document.querySelector('input[name="payment"]:checked').value;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (!name || !phone || !address) {
      alert('Please fill delivery info');
      return;
    }
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const orderNumber = 'ORD' + Date.now();
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const distanceKm = parseFloat(document.getElementById('checkout-form').dataset.distanceKm) || 0;
    const delivery = calculateDelivery(distanceKm);
    const total = subtotal + delivery;

    const order = {
      orderNumber,
      name,
      phone,
      address,
      payment,
      items: cart,
      subtotal,
      delivery,
      total,
      distanceKm,
      status: 'Pending',
      date: new Date().toISOString()
    };
    localStorage.setItem('lastOrder', JSON.stringify(order));

    const adminOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    adminOrders.unshift(order);
    localStorage.setItem('admin_orders', JSON.stringify(adminOrders));

    localStorage.removeItem('cart');
    updateCartCount();

    window.location.href = 'order-success.html';
  });
});
