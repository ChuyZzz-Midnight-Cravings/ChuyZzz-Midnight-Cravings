function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    updateTotals();
    updateCartCount();
    return;
  }

  cart.forEach((it, idx) => {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${it.img || it.image}" alt="${it.name}">
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
  const delivery = subtotal > 0 ? 80 : 0;
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
