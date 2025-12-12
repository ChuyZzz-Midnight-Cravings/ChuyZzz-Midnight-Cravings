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

  // ===== Update Header UI =====
  function updateHeaderUI() {
    const user = getLoggedUser();

    if (userDisplay) userDisplay.textContent = user ? "Hello, " + user.name + "!" : "";
    if (loginLink) loginLink.style.display = user ? "none" : "inline-block";
    if (dropdownUser) dropdownUser.textContent = user ? user.name : "";
    if (dropdownLogout) dropdownLogout.style.display = user ? "block" : "none";

    // Ensure logout in dropdown is functional
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
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // ===== LOCAL LOGIN =====
  const loginBtn = document.getElementById("login-btn");
  loginBtn?.addEventListener("click", () => {
    const email = document.getElementById("login-email")?.value.trim();
    const pass = document.getElementById("login-pass")?.value;

    const users = getUsers();
    const user = users.find(u => u.email === email && u.pass === pass);

    if (user) {
      setLoggedInUser(email);
      alert("Login successful!");
      window.location.href = "index.html";
    } else {
      alert("Incorrect email or password.");
    }
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

  function handleGoogleCredential(response) {
    try {
      const jwt = response.credential;
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      const email = payload.email;

      setLoggedInUser(email);
      alert(`Google login successful! Welcome ${email}`);
      window.location.href = "index.html";
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login failed.");
    }
  }

  function handleGoogleSignup(response) {
    try {
      const jwt = response.credential;
      const payload = JSON.parse(atob(jwt.split(".")[1]));
      const email = payload.email;

      const users = getUsers();
      if (!users.some(u => u.email === email)) {
        users.push({ name: payload.name || "Google User", email, pass: "" });
        saveUsers(users);
        alert(`Google account created for ${email}`);
      } else {
        alert(`Account already exists for ${email}`);
      }

      setLoggedInUser(email);
      window.location.href = "index.html";
    } catch (err) {
      console.error("Google signup error:", err);
      alert("Google signup failed.");
    }
  }

  // ===== INITIALIZE =====
  updateHeaderUI();
});
