document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const dropdown = document.getElementById("hamburger-dropdown");
  const userDisplay = document.getElementById("user-display");
  const dropdownUser = document.getElementById("dropdown-user");
  const logoutBtn = document.getElementById("dropdown-logout");
  const cartCount = document.getElementById("cart-count");

  // Get logged user
  function getLoggedUser() {
    const email = localStorage.getItem("loggedUser");
    if (!email) return null;
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find(u => u.email === email) || null;
  }

  // Update UI
  function updateHeader() {
    const user = getLoggedUser();
    if (user) {
      userDisplay.textContent = "Hello, " + user.name;
      dropdownUser.textContent = user.name;
      logoutBtn.style.display = "block";
    } else {
      userDisplay.textContent = "";
      dropdownUser.textContent = "";
      logoutBtn.style.display = "none";
    }

    if (cartCount) {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      cartCount.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    }
  }

  // Hamburger toggle
  hamburger.addEventListener("click", e => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
  });
  document.addEventListener("click", e => {
    if (!dropdown.contains(e.target) && !hamburger.contains(e.target)) {
      dropdown.style.display = "none";
    }
  });

  // Logout
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
  });

  updateHeader();
});
