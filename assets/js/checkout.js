function loadCheckoutRecap() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const delivery = subtotal > 0 ? 80 : 0;
  document.getElementById('recap-subtotal').textContent = subtotal;
  document.getElementById('recap-delivery').textContent = delivery;
  document.getElementById('recap-total').textContent = subtotal + delivery;

  const items = document.getElementById('checkout-items'); if (items) items.innerHTML = '';
  cart.forEach(it => {
    const p = document.createElement('p');
    p.textContent = `${it.name} x${it.quantity} — ₱${it.price * it.quantity}`;
    items && items.appendChild(p);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadCheckoutRecap();
  document.querySelectorAll('input[name="payment"]').forEach(r => {
    r.addEventListener('change', () => {
      const v = document.querySelector('input[name="payment"]:checked').value;
      document.getElementById('card-section').style.display = v === 'card' ? 'block' : 'none';
    });
  });

  document.getElementById('place-order').addEventListener('click', () => {
    const name = document.getElementById('del-name').value.trim();
    const phone = document.getElementById('del-phone').value.trim();
    const address = document.getElementById('del-address').value.trim();
    const pay = document.querySelector('input[name="payment"]:checked').value;
    if (!name || !phone || !address) { alert('Please fill delivery info'); return; }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) { alert('Your cart is empty'); return; }
    const orderNumber = 'ORD' + Date.now();
    const order = { orderNumber, name, phone, address, payment: pay, items: cart, status: 'Pending' };
    localStorage.setItem('lastOrder', JSON.stringify(order));


    const adminOrders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
    adminOrders.unshift({ id: orderNumber, customer: name, status: 'Pending', total: cart.reduce((s, i) => s + i.price * i.quantity, 0) });
    localStorage.setItem('admin_orders', JSON.stringify(adminOrders));
    localStorage.removeItem('cart'); updateCartCount();
    window.location.href = 'order-success.html';
  });
});
