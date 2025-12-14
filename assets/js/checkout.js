// ===============================
// CART + CHECKOUT JS (FIXED)
// ===============================

// --- STORE LOCATION (Damilag, Manolo Fortich, Bukidnon) ---
const storeLocation = { lat: 8.5060, lng: 125.0176 };

// --- Haversine formula ---
function getDistanceFromStore(userLat, userLng) {
  const R = 6371;
  const dLat = (userLat - storeLocation.lat) * Math.PI / 180;
  const dLng = (userLng - storeLocation.lng) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(storeLocation.lat * Math.PI / 180) *
    Math.cos(userLat * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --- Delivery: ₱20/km, minimum ₱50 ---
function calculateDelivery(distanceKm) {
  return Math.max(50, Math.ceil(distanceKm * 20));
}

// --- CART COUNT ---
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const count = cart.reduce((s, i) => s + i.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = count;
}

// --- CHECKOUT RECAP ---
function loadCheckoutRecap() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const itemsBox = document.getElementById("checkout-items");

  let subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  let delivery = 80;
  let total = subtotal + delivery;

  if (itemsBox) itemsBox.innerHTML = "";

  cart.forEach(item => {
    const p = document.createElement("p");
    p.textContent = `${item.name} x${item.quantity} — ₱${(item.price * item.quantity).toFixed(2)}`;
    itemsBox.appendChild(p);
  });

  // Disable place order if empty cart
  const placeOrderBtn = document.getElementById("place-order");
  if (cart.length === 0 && placeOrderBtn) {
    placeOrderBtn.disabled = true;
    placeOrderBtn.title = "Cart is empty";
  }

  // Distance-based delivery
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        const distanceKm = getDistanceFromStore(
          pos.coords.latitude,
          pos.coords.longitude
        );

        delivery = calculateDelivery(distanceKm);
        total = subtotal + delivery;

        const form = document.getElementById("checkout-form");
        if (form) {
          form.dataset.distanceKm = distanceKm.toFixed(2);
          form.dataset.shippingPrice = delivery;
        }

        document.getElementById("shipping-method").textContent =
          `Distance-based (${distanceKm.toFixed(2)} km)`;

        document.getElementById("recap-subtotal").textContent = subtotal.toFixed(2);
        document.getElementById("recap-delivery").textContent = delivery.toFixed(2);
        document.getElementById("recap-total").textContent = total.toFixed(2);
      },
      () => updateTotalsFallback(subtotal, delivery)
    );
  } else {
    updateTotalsFallback(subtotal, delivery);
  }

  updateCartCount();
}

// --- FALLBACK TOTAL ---
function updateTotalsFallback(subtotal, delivery) {
  document.getElementById("recap-subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("recap-delivery").textContent = delivery.toFixed(2);
  document.getElementById("recap-total").textContent = (subtotal + delivery).toFixed(2);
}

// --- PLACE ORDER (FIXED) ---
function placeOrder() {
  const name = document.getElementById("del-name").value.trim();
  const phone = document.getElementById("del-phone").value.trim();
  const address = document.getElementById("del-address").value.trim();
  const payment = document.querySelector("input[name='payment']:checked")?.value;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");

  if (!name || !phone || !address) {
    alert("Please fill delivery information");
    return;
  }

  if (!payment) {
    alert("Please select payment method");
    return;
  }

  if (!cart || cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  const form = document.getElementById("checkout-form");
  const distanceKm = form?.dataset.distanceKm ? parseFloat(form.dataset.distanceKm) : 0;
  const delivery = form?.dataset.shippingPrice
    ? parseFloat(form.dataset.shippingPrice)
    : calculateDelivery(distanceKm);

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total = subtotal + delivery;

  const order = {
    orderNumber: "ORD-" + Date.now(),
    customer: { name, phone, address },
    payment,
    items: cart,
    subtotal,
    delivery,
    total,
    distanceKm,
    status: "Pending",
    date: new Date().toISOString()
  };

  // Save orders
  localStorage.setItem("lastOrder", JSON.stringify(order));

  const adminOrders = JSON.parse(localStorage.getItem("admin_orders") || "[]");
  adminOrders.unshift(order);
  localStorage.setItem("admin_orders", JSON.stringify(adminOrders));

  // Clear cart
  localStorage.removeItem("cart");
  updateCartCount();

  // Redirect
  window.location.href = "order-success.html";
}

// --- INIT ---
window.addEventListener("DOMContentLoaded", () => {
  loadCheckoutRecap();

  // Payment toggle FIX (lowercase value)
  document.querySelectorAll("input[name='payment']").forEach(radio => {
    radio.addEventListener("change", () => {
      const cardSection = document.getElementById("card-section");
      if (!cardSection) return;
      cardSection.style.display =
        document.querySelector("input[name='payment']:checked").value === "card"
          ? "block"
          : "none";
    });
  });

  document.getElementById("place-order")
    ?.addEventListener("click", placeOrder);
});
