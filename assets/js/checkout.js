function loadCheckoutRecap() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = subtotal > 0 ? 80 : 0;
  const total = subtotal + delivery;

  // Update totals
  document.getElementById('recap-subtotal').textContent = subtotal.toFixed(2);
  document.getElementById('recap-delivery').textContent = delivery.toFixed(2);
  document.getElementById('recap-total').textContent = total.toFixed(2);

  // Render cart items
  const items = document.getElementById('checkout-items');
  if (items) items.innerHTML = '';
  cart.forEach(it => {
    const p = document.createElement('p');
    p.textContent = `${it.name} x${it.quantity} — ₱${(it.price * it.quantity).toFixed(2)}`;
    items && items.appendChild(p);
  });

  // Update header cart count
  updateCartCount();
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const count = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartCount = document.getElementById('cart-count');
  if (cartCount) cartCount.textContent = count;
}

window.addEventListener('DOMContentLoaded', () => {
  loadCheckoutRecap();

  // Payment section toggle
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

    if (!name || !phone || !address) {
      alert('Please fill delivery info');
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    const orderNumber = 'ORD' + Date.now();
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const delivery = subtotal > 0 ? 80 : 0;
    const total = subtotal + delivery;

    // Save last order
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
      status: 'Pending',
      date: new Date().toISOString()
    };
    localStorage.setItem('lastOrder', JSON.stringify(order));

    // Save admin orders
    const adminOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    adminOrders.unshift(order); // store full order, not just id and total
    localStorage.setItem('admin_orders', JSON.stringify(adminOrders));

    // Clear cart
    localStorage.removeItem('cart');
    updateCartCount();

    // Redirect
    window.location.href = 'order-success.html';
  });
});
