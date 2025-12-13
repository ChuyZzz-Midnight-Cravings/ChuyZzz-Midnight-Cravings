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
  localStorage.setItem("loggedUser", email.toLowerCase());
}

function getLoggedUser() {
  const email = localStorage.getItem("loggedUser");
  if (!email) return null;
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
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

  // ===== Message Box =====
  const messageBox = document.createElement("div");
  messageBox.style.color = "#1e90ff";
  messageBox.style.textAlign = "center";
  messageBox.style.margin = "8px 0";
  messageBox.style.wordBreak = "break-word";
  messageBox.style.transition = "opacity 0.4s ease";
  document.body.prepend(messageBox);

  function showMessage(msg, duration = 3000) {
    messageBox.textContent = msg;
    messageBox.style.opacity = "1";
    setTimeout(() => {
      messageBox.style.opacity = "0";
      setTimeout(() => messageBox.textContent = '', 400);
    }, duration);
  }

  // ===== Update Header UI =====
  function updateHeaderUI() {
    const user = getLoggedUser();
    if (userDisplay) userDisplay.textContent = user ? "Hello, " + user.name + "!" : "";
    if (loginLink) loginLink.style.display = user ? "none" : "inline-block";
    if (dropdownUser) dropdownUser.textContent = user ? user.name : "";
    if (dropdownLogout) dropdownLogout.style.display = user ? "block" : "none";

    if (dropdown) {
      let existingLogout = dropdown.querySelector(".dropdown-logout");
      if (!existingLogout && user) {
        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.textContent = "Logout";
        logoutLink.classList.add("dropdown-logout");
        logoutLink.style.wordBreak = "break-word";
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
  function updateCartCount() {
    if (cartCountEl) {
      const cart = getUserCart();
      cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
      cartCountEl.style.wordBreak = "break-word";
    }
  }
  updateCartCount();

  // ===== LOCAL LOGIN =====
  const loginBtn = document.getElementById("login-btn");
  loginBtn?.addEventListener("click", () => {
    const email = document.getElementById("login-email")?.value.trim().toLowerCase();
    const pass = document.getElementById("login-pass")?.value;
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email && u.pass === pass);

    if (user) {
      setLoggedInUser(email);
      showMessage("✅ Login successful!");
      setTimeout(() => window.location.href = "index.html", 800);
    } else {
      showMessage("❌ Incorrect email or password.");
    }
  });

  // ===== FORGOT PASSWORD =====
  const resetBtn = document.getElementById("reset-btn");
  resetBtn?.addEventListener("click", () => {
    const email = document.getElementById("fp-email")?.value.trim().toLowerCase();
    const password = document.getElementById("fp-password")?.value;
    const password2 = document.getElementById("fp-password2")?.value;

    if (!email || !password || !password2) {
      showMessage("⚠️ Please fill all fields.");
      return;
    }
    if (password !== password2) {
      showMessage("⚠️ Passwords do not match.");
      return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email);
    if (userIndex === -1) {
      showMessage("❌ No account found with this email.");
      return;
    }

    users[userIndex].pass = password;
    saveUsers(users);
    showMessage("✅ Password reset successful!");
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
        { theme: "outline", size: "large", width: '100%', text: "signin_with" }
      );
    }
  }

  function decodeJwtResponse(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join(''));
      return JSON.parse(jsonPayload);
    } catch (err) {
      console.error("JWT decode error:", err);
      return null;
    }
  }

  function handleGoogleCredential(response) {
    const payload = decodeJwtResponse(response.credential);
    if (!payload || !payload.email) {
      showMessage("❌ Google login failed.");
      return;
    }
    const email = payload.email.toLowerCase();
    setLoggedInUser(email);

    const users = getUsers();
    if (!users.some(u => u.email.toLowerCase() === email)) {
      users.push({ name: payload.name || "Google User", email, pass: "" });
      saveUsers(users);
    }

    showMessage(`✅ Google login successful! Welcome ${payload.name || email}`);
    setTimeout(() => window.location.href = "index.html", 800);
  }

  // ===== PROFILE PAGE FUNCTIONS =====
  const profileName = document.getElementById("profile-name");
  const profileEmail = document.getElementById("profile-email");
  const saveProfileBtn = document.getElementById("save-profile");
  const logoutProfileBtn = document.getElementById("logout-btn-main");

  function initializeProfilePage() {
    const user = getLoggedUser();
    if (!user) return;
    if (profileName) profileName.value = user.name;
    if (profileEmail) profileEmail.value = user.email;
  }

  saveProfileBtn?.addEventListener("click", () => {
    const user = getLoggedUser();
    if (!user) return;
    const newName = profileName.value.trim();
    const newEmail = profileEmail.value.trim();
    if (!newName || !newEmail) return alert("Name and email cannot be empty!");

    const users = getUsers();
    const index = users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      users[index].name = newName;
      users[index].email = newEmail;
      saveUsers(users);
      setLoggedInUser(newEmail);
      alert("Profile updated successfully!");
      initializeProfilePage();
      updateHeaderUI();
    }
  });

  logoutProfileBtn?.addEventListener("click", () => {
    localStorage.removeItem("loggedUser");
    window.location.href = "login.html";
  });

  initializeProfilePage();
  updateHeaderUI();

  // ===== RESPONSIVE ADJUSTMENTS =====
  function responsiveUI() {
    messageBox.style.fontSize = window.innerWidth <= 768 ? "0.85rem" : "1rem";
    if (dropdown) dropdown.style.width = window.innerWidth <= 480 ? "90%" : "200px";
  }
  window.addEventListener("resize", responsiveUI);
  responsiveUI();

  // ===== AUTO UPDATE CART =====
  setInterval(updateCartCount, 2000);

  // ===== FOOTER STICKY =====
  const footer = document.querySelector(".site-footer");
  const mainContainer = document.querySelector(".main-container");
  function fixFooter() {
    if (!footer || !mainContainer) return;
    const bodyHeight = document.body.offsetHeight;
    const windowHeight = window.innerHeight;
    if (bodyHeight < windowHeight) {
      footer.style.position = "absolute";
      footer.style.bottom = "0";
      footer.style.width = "100%";
    } else {
      footer.style.position = "relative";
    }
  }
  window.addEventListener("resize", fixFooter);
  fixFooter();
});
