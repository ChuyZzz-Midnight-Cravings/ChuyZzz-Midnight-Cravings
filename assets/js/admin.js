function renderAdminOrders() {
  const tbody = document.querySelector('.admin-table tbody'); if (!tbody) return;
  const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
  tbody.innerHTML = '';
  orders.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${o.id}</td><td>${o.customer}</td><td>${o.status}</td><td>₱${o.total}</td><td><button onclick="adminUpdate('${o.id}','Completed')">Complete</button><button onclick="adminUpdate('${o.id}','Canceled')">Cancel</button></td>`;
    tbody.appendChild(tr);
  });
}

function adminUpdate(id, status) {
  const orders = JSON.parse(localStorage.getItem('admin_orders') || '[]');
  const updated = orders.map(o => o.id === id ? { ...o, status } : o);
  localStorage.setItem('admin_orders', JSON.stringify(updated));
  renderAdminOrders();
  alert('Order updated');
}

/* product manager */
function renderAdminProducts() {
  const list = document.querySelector('.admin-product-list'); if (!list) return;
  const prods = JSON.parse(localStorage.getItem('admin_products') || '[]');
  list.innerHTML = '';
  prods.forEach(p => {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${p.name}</strong> — ₱${p.price} <button onclick="adminEditProduct('${p.id}')">Edit</button> <button onclick="adminDeleteProduct('${p.id}')">Del</button>`;
    list.appendChild(div);
  });
}

function adminAddProduct() {
  const name = document.getElementById('new-prod-name').value.trim();
  const price = Number(document.getElementById('new-prod-price').value);
  if (!name || !price) { alert('Name & price'); return; }
  const prods = JSON.parse(localStorage.getItem('admin_products') || '[]');
  prods.push({ id: 'P' + Date.now(), name, price });
  localStorage.setItem('admin_products', JSON.stringify(prods));
  renderAdminProducts();
}

function adminEditProduct(id) {
  const prods = JSON.parse(localStorage.getItem('admin_products') || '[]');
  const p = prods.find(x => x.id === id); if (!p) return;
  const n = prompt('New name', p.name); const pr = prompt('New price', p.price);
  if (n) p.name = n; if (pr) p.price = Number(pr);
  localStorage.setItem('admin_products', JSON.stringify(prods)); renderAdminProducts();
}

function adminDeleteProduct(id) {
  let prods = JSON.parse(localStorage.getItem('admin_products') || '[]');
  prods = prods.filter(x => x.id !== id); localStorage.setItem('admin_products', JSON.stringify(prods)); renderAdminProducts();
}

window.addEventListener('DOMContentLoaded', () => {
  renderAdminOrders(); renderAdminProducts();
  document.getElementById('add-prod-btn')?.addEventListener('click', adminAddProduct);
  document.getElementById('tab-orders')?.addEventListener('click', () => { document.getElementById('orders-area').style.display = 'block'; document.getElementById('products-area').style.display = 'none'; });
  document.getElementById('tab-products')?.addEventListener('click', () => { document.getElementById('products-area').style.display = 'block'; document.getElementById('orders-area').style.display = 'none'; });
});
