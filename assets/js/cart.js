// ===============================
// STORE INFO & DISTANCE CALCULATION
// ===============================
const storeLocation = { lat: 8.5060, lng: 125.0176 };

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

function calculateDelivery(distanceKm) {
  return Math.max(50, distanceKm * 20);
}

// ===============================
// CART FUNCTIONALITY
// ===============================
function changeQty(index, delta) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (!cart[index]) return;
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartPage();
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartPage();
}

// ===============================
// CART RENDERING
// ===============================
function renderCartPage() {
  const container = document.getElementById("cart-items");
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  container.innerHTML = "";
  const checkoutBtn = document.querySelector(".cart-actions .btn:not(.alt)");

  if (cart.length === 0) {
    container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    updateTotals(0);
    updateCartCount();
    if (checkoutBtn) {
      checkoutBtn.style.pointerEvents = "none";
      checkoutBtn.style.opacity = "0.5";
      checkoutBtn.title = "Your cart is empty";
    }
    return;
  }

  cart.forEach((item, idx) => {
    const el = document.createElement("div");
    el.className = "cart-item";
    el.innerHTML = `
      <img src="${item.img || 'assets/images/placeholder.png'}" alt="${item.name}" class="cart-img">
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

  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      changeQty(parseInt(btn.dataset.index), parseInt(btn.dataset.delta))
    );
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeItem(parseInt(btn.dataset.index))
    );
  });

  updateCartCount();

  if (checkoutBtn) {
    checkoutBtn.style.pointerEvents = "auto";
    checkoutBtn.style.opacity = "1";
    checkoutBtn.title = "";
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const distanceKm = getDistanceFromStore(
          pos.coords.latitude,
          pos.coords.longitude
        );
        updateTotals(distanceKm);
      },
      () => updateTotals(0)
    );
  } else {
    updateTotals(0);
  }
}

// ===============================
// UPDATE TOTALS
// ===============================
function updateTotals(distanceKm = 0) {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const delivery = distanceKm > 0 ? calculateDelivery(distanceKm) : subtotal > 0 ? 80 : 0;
  document.getElementById("cart-subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("cart-delivery").textContent = delivery.toFixed(2);
  document.getElementById("cart-total").textContent = (subtotal + delivery).toFixed(2);
}

// ===============================
// UPDATE CART COUNT
// ===============================
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const count = cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartCount = document.getElementById("cart-count");
  if (cartCount) cartCount.textContent = count;
}

// ===============================
// GET LOGGED USER
// ===============================
function getLoggedUser() {
  return JSON.parse(localStorage.getItem("loggedUser") || "null");
}

// ===============================
// SETUP HAMBURGER & HEADER
// ===============================
function setupHeader() {
  const userDisplay = document.getElementById("user-display");
  const loginLink = document.getElementById("login-link");
  const dropdownUser = document.getElementById("dropdown-user");
  const dropdownLogout = document.getElementById("dropdown-logout");
  const hamburger = document.getElementById("hamburger-menu");
  const dropdown = document.getElementById("hamburger-dropdown");

  // Update header UI
  function updateHeaderUI() {
    const user = getLoggedUser();
    if (userDisplay) userDisplay.textContent = user ? `Hello, ${user.username || user.name}!` : "";
    if (loginLink) loginLink.style.display = user ? "none" : "inline-block";
    if (dropdownUser) dropdownUser.textContent = user ? user.username || user.name : "";
    if (dropdownLogout) dropdownLogout.style.display = user ? "block" : "none";

    if (dropdown && user) {
      // Remove existing logout links
      dropdown.querySelectorAll(".dropdown-logout").forEach(el => el.remove());

      const logoutLink = document.createElement("a");
      logoutLink.href = "#";
      logoutLink.textContent = "Logout";
      logoutLink.classList.add("dropdown-logout");
      logoutLink.addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        window.location.href = "login.html";
      });
      dropdown.appendChild(logoutLink);
    }
  }

  updateHeaderUI();

  // Hamburger toggle
  if (hamburger && dropdown) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
      hamburger.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
        dropdown.classList.remove("show");
        hamburger.classList.remove("open");
      }
    });

    // Close dropdown when any link inside is clicked
    dropdown.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        dropdown.classList.remove("show");
        hamburger.classList.remove("open");
      });
    });
  }
}

// ===============================
// DOM CONTENT LOADED
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  renderCartPage();
  setupHeader();
});
