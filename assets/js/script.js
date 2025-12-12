document.addEventListener("DOMContentLoaded", () => {

  // ===== GET LOGGED USER =====
  function getLoggedUser() {
    const email = localStorage.getItem("loggedUser");
    if (!email) return null;
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find(u => u.email === email) || null;
  }

  // ===== UPDATE HEADER UI =====
  function updateHeaderUI() {
    const user = getLoggedUser();
    const nameBox = document.getElementById("user-display");
    const logoutBtn = document.getElementById("logout-btn");
    const loginLink = document.getElementById("login-link");
    const hamburgerDropdown = document.getElementById("hamburger-dropdown");

    if (!nameBox || !logoutBtn || !loginLink || !hamburgerDropdown) return;

    // Remove old logout link from dropdown if exists
    const existingLogout = hamburgerDropdown.querySelector(".dropdown-logout");
    if (existingLogout) existingLogout.remove();

    if (user) {
      nameBox.textContent = "Hello, " + user.name + "!";
      logoutBtn.style.display = "inline-block";
      loginLink.style.display = "none";

      // Add logout to dropdown
      const logoutLink = document.createElement("a");
      logoutLink.href = "#";
      logoutLink.textContent = "Logout";
      logoutLink.classList.add("dropdown-logout");
      logoutLink.addEventListener("click", () => {
        localStorage.removeItem("loggedUser");
        window.location.href = "login.html";
      });

      hamburgerDropdown.appendChild(logoutLink);
    } else {
      nameBox.textContent = "";
      logoutBtn.style.display = "none";
      loginLink.style.display = "inline-block";
    }
  }

  // ===== LOGOUT MAIN BUTTON =====
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedUser");
      window.location.href = "login.html";
    });
  }

  // ===== HAMBURGER TOGGLE =====
  const hamburger = document.getElementById("hamburger-menu");
  const dropdown = document.getElementById("hamburger-dropdown");

  if (hamburger && dropdown) {
    hamburger.addEventListener("click", e => {
      e.stopPropagation();
      dropdown.classList.toggle("show");
    });

    document.addEventListener("click", e => {
      if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
        dropdown.classList.remove("show");
      }
    });
  }

  // ===== CART COUNT =====
  function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const el = document.getElementById("cart-count");
    if (el) el.textContent = cart.reduce((s, i) => s + i.quantity, 0);
  }

  // INITIALIZE HEADER
  updateHeaderUI();
  updateCartCount();
});
