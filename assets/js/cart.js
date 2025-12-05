function renderCartPage() {
  const container = document.getElementById('cart-items');
  if (!container) return;
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  container.innerHTML = '';
  if (cart.length === 0) { container.innerHTML = '<p>Your cart is empty.</p>'; updateTotals(); return; }

  cart.forEach((it, idx) => {
    const el = document.createElement('div'); el.className = 'cart-item';
    el.innerHTML = `
      <img src="${it.image}" alt="${it.name}">
      <div style="flex:1"><h4>${it.name}</h4><p>₱${it.price}</p></div>
      <div class="cart-quantity"><button onclick="changeQty(${idx},-1)">-</button><span style="margin:0 8px;">${it.quantity}</span><button onclick="changeQty(${idx},1)">+</button></div>
      <div style="width:80px;text-align:right">₱${it.price * it.quantity}</div>
      <button onclick="removeItem(${idx})" class="btn alt">Remove</button>
    `;
    container.appendChild(el);
  });
  updateTotals();
}

function changeQty(index, delta) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart));
  renderCartPage(); updateCartCount();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]'); cart.splice(index, 1);
  localStorage.setItem('cart', JSON.stringify(cart)); renderCartPage(); updateCartCount();
}

function updateTotals() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = subtotal > 0 ? 80 : 0;
  document.getElementById('cart-subtotal').textContent = subtotal;
  document.getElementById('cart-delivery').textContent = delivery;
  document.getElementById('cart-total').textContent = subtotal + delivery;
}

window.addEventListener('DOMContentLoaded', renderCartPage);
