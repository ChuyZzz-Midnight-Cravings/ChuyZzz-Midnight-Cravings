// Store location: Manolo Fortich, Bukidnon
const storeLocation = { lat: 8.5060, lng: 125.0176 };

// Haversine formula to calculate distance in km
function getDistanceFromStore(userLat, userLng) {
  const R = 6371; // Earth radius in km
  const dLat = (userLat - storeLocation.lat) * Math.PI / 180;
  const dLng = (userLng - storeLocation.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(storeLocation.lat * Math.PI / 180) * Math.cos(userLat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

// Delivery calculation: ₱20 per km, minimum ₱50
function calculateDelivery(distanceKm) {
  return Math.max(50, distanceKm * 20);
}

// Render cart items
function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  container.innerHTML = '';
  const checkoutBtn = document.querySelector('.cart-actions .btn:not(.alt)');

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    updateTotals(0);
    updateCartCount();

    if (checkoutBtn) {
      checkoutBtn.style.pointerEvents = 'none';
      checkoutBtn.style.opacity = '0.5';
      checkoutBtn.title = 'Your cart is empty';
    }
    return;
  }

  cart.forEach((item, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${item.img || item.image || 'assets/images/placeholder.png'}" alt="${item.name}" class="cart-img">
      <div class="cart-info">
        <h4>${item.name}</h4>
        <p>₱${item.price.toFixed(2)}</p>
      </div>
      <div class="cart-quantity">
        <button class="qty-btn" data-index="${idx}" data-delta="-1">-</button>
        <span>${item.quantity}</span>
        <button class="qty-btn" data-index="${idx}" data-delta="1">+</button>
      </div>
      <div class="cart-total-price">₱${(item.price * item.quantity).toFixed(2)}</div>
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

  updateCartCount();

  // Enable checkout button if cart has items
  if (checkoutBtn) {
    checkoutBtn.style.pointerEvents = 'auto';
    checkoutBtn.style.opacity = '1';
    checkoutBtn.title = '';
  }

  // Calculate delivery dynamically
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const distanceKm = getDistanceFromStore(pos.coords.latitude, pos.coords.longitude);
      updateTotals(distanceKm);
      // Store distance for checkout page if needed
      document.getElementById('cart-items').dataset.distanceKm = distanceKm.toFixed(2);
    }, () => {
      // fallback if geolocation fails
      updateTotals(0);
    });
  } else {
    updateTotals(0);
  }
}

// Change quantity
function changeQty(index, delta) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartPage();
}

// Remove item
function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartPage();
}

// Update totals
function updateTotals(distanceKm = 0) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = distanceKm > 0 ? calculateDelivery(distanceKm) : (subtotal > 0 ? 80 : 0);
  document.getElementById('cart-subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('cart-delivery').textContent = delivery.toFixed(2);
  document.getElementById('cart-total').textContent = (subtotal + delivery).toFixed(2);
}

// Update cart count in header
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = count;
}

// Initialize
window.addEventListener('DOMContentLoaded', renderCartPage);
