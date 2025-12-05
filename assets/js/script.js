//  GET LOGGED USER 
function getLoggedUser() {
  const email = localStorage.getItem("loggedUser");
  if (!email) return null;

  const users = JSON.parse(localStorage.getItem("users") || "[]");
  return users.find(u => u.email === email) || null;
}

// UPDATE HEADER UI 
function updateHeaderUI() {
  const user = getLoggedUser();

  const nameBox = document.getElementById("user-display");
  const logoutBtn = document.getElementById("logout-btn");
  const loginLink = document.getElementById("login-link");

  if (!nameBox || !logoutBtn || !loginLink) return;

  if (user) {
    nameBox.textContent = "Hello, " + user.name + "!";
    logoutBtn.style.display = "inline-block";
    loginLink.style.display = "none";
  } else {
    nameBox.textContent = "";
    logoutBtn.style.display = "none";
    loginLink.style.display = "inline-block";
  }
}

//  LOGOUT 
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedUser");
      window.location.href = "login.html";
    });
  }
});

//  CART COUNT 
function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const el = document.getElementById("cart-count");
  if (el) el.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

window.addEventListener("DOMContentLoaded", () => {
  updateHeaderUI();
  updateCartCount();
});
