// ===============================
// LOCAL USERS FUNCTIONS
// ===============================
function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function setLoggedInUser(email) {
  localStorage.setItem("loggedUser", email);
}

function getLoggedUser() {
  const email = localStorage.getItem("loggedUser");
  if (!email) return null;
  const users = getUsers();
  return users.find(u => u.email === email) || null;
}

// ===============================
// PER-USER CART
// ===============================
function getUserCart() {
  const user = getLoggedUser();
  const key = user ? `cart_${user.email}` : "cart";
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function saveUserCart(cart) {
  const user = getLoggedUser();
  const key = user ? `cart_${user.email}` : "cart";
  localStorage.setItem(key, JSON.stringify(cart));
}

// ===============================
// DOM CONTENT LOADED
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // ===== Header & Dropdown Elements =====
  const userDisplay = document.getElementById("user-display");
  const loginLink = document.getElementById("login-link");
  const dropdownUser = document.getElementById("dropdown-user");
  const dropdownLogout = document.getElementById("dropdown-logout");
  const hamburger = document.getElementById("hamburger-menu");
  const dropdown = document.getElementById("hamburger-dropdown");
  const cartCountEl = document.getElementById("cart-count");

  const messageBox = document.createElement("div");
  messageBox.style.color = "#1e90ff";
  messageBox.style.textAlign = "center";
  messageBox.style.margin = "8px 0";
  document.body.prepend(messageBox);

  // ===== Update Header UI =====
  function updateHeaderUI() {
    const user = getLoggedUser();
    if (userDisplay) userDisplay.textContent = user ? "Hello, " + user.name + "!" : "";
    if (loginLink) loginLink.style.display = user ? "none" : "inline-block";
    if (dropdownUser) dropdownUser.textContent = user ? user.name : "";
    if (dropdownLogout) dropdownLogout.style.display = user ? "block" : "none";

    // Logout in dropdown
    if (dropdown) {
      let existingLogout = dropdown.querySelector(".dropdown-logout");
      if (!existingLogout && user) {
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
  }

  // ===== Logout Button =====
  dropdownLogout?.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
  });

  // ===== Hamburger Toggle =====
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

  // ===== Cart Count =====
  if (cartCountEl) {
    const cart = getUserCart();
    cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ===== LOCAL LOGIN =====
  const loginBtn = document.getElementById("login-btn");
  loginBtn?.addEventListener("click", () => {
    const email = document.getElementById("login-email")?.value.trim().toLowerCase();
    const pass = document.getElementById("login-pass")?.value;

    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email && u.pass === pass);

    if (user) {
      setLoggedInUser(email);
      messageBox.textContent = "✅ Login successful!";
      setTimeout(() => window.location.href = "index.html", 800);
    } else {
      messageBox.textContent = "❌ Incorrect email or password.";
    }
  });

  // ===== FORGOT PASSWORD =====
  const resetBtn = document.getElementById("reset-btn");
  resetBtn?.addEventListener("click", () => {
    const email = document.getElementById("fp-email")?.value.trim().toLowerCase();
    const password = document.getElementById("fp-password")?.value;
    const password2 = document.getElementById("fp-password2")?.value;

    if (!email || !password || !password2) {
      messageBox.textContent = "⚠️ Please fill all fields.";
      return;
    }

    if (password !== password2) {
      messageBox.textContent = "⚠️ Passwords do not match.";
      return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email);
    if (userIndex === -1) {
      messageBox.textContent = "❌ No account found with this email.";
      return;
    }

    users[userIndex].pass = password;
    saveUsers(users);
    messageBox.textContent = "✅ Password reset successful!";
    setTimeout(() => window.location.href = "login.html", 1000);
  });

  // ===== GOOGLE LOGIN / SIGNUP =====
  const clientId = "540201718454-mub2h4ufht1b749ot2k3t9f019h2fcnm.apps.googleusercontent.com";
  if (typeof google !== "undefined" && google.accounts) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCredential
    });

    const googleBtnContainer = document.getElementById("google-login-container");
    if (googleBtnContainer) {
      google.accounts.id.renderButton(
        googleBtnContainer,
        { theme: "outline", size: "large", width: 250, text: "signin_with" }
      );
      google.accounts.id.prompt();
    }

    const googleSignupBtn = document.getElementById("google-signup");
    googleSignupBtn?.addEventListener("click", () => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleSignup
      });
      google.accounts.id.prompt();
    });
  }

  // ===== JWT DECODE FUNCTION =====
  function decodeJwtResponse(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("JWT decode error:", err);
      return null;
    }
  }

  function handleGoogleCredential(response) {
    const payload = decodeJwtResponse(response.credential);
    if (!payload || !payload.email) {
      messageBox.textContent = "❌ Google login failed.";
      return;
    }
    const email = payload.email;
    setLoggedInUser(email);

    const users = getUsers();
    if (!users.some(u => u.email === email)) {
      users.push({ name: payload.name || "Google User", email, pass: "" });
      saveUsers(users);
    }

    messageBox.textContent = `✅ Google login successful! Welcome ${email}`;
    setTimeout(() => window.location.href = "index.html", 800);
  }

  function handleGoogleSignup(response) {
    const payload = decodeJwtResponse(response.credential);
    if (!payload || !payload.email) {
      messageBox.textContent = "❌ Google signup failed.";
      return;
    }
    const email = payload.email;

    const users = getUsers();
    if (!users.some(u => u.email === email)) {
      users.push({ name: payload.name || "Google User", email, pass: "" });
      saveUsers(users);
      messageBox.textContent = `✅ Google account created for ${email}`;
    } else {
      messageBox.textContent = `⚠️ Account already exists for ${email}`;
    }

    setLoggedInUser(email);
    setTimeout(() => window.location.href = "index.html", 800);
  }

  // ===== INITIALIZE =====
  updateHeaderUI();
});
