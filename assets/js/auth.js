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

function logoutUser() {
  localStorage.removeItem("loggedUser");
}

// ===============================
// DOM CONTENT LOADED
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  // LOCAL LOGIN
  const loginBtn = document.getElementById("login-btn");
  loginBtn?.addEventListener("click", () => {
    const email = document.getElementById("login-email").value.trim();
    const pass = document.getElementById("login-pass").value;

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

  // SIGNUP
  const signupBtn = document.getElementById("signup-btn");
  signupBtn?.addEventListener("click", () => {
    const name = document.getElementById("su-name").value.trim();
    const email = document.getElementById("su-email").value.trim();
    const pass = document.getElementById("su-pass").value;
    const pass2 = document.getElementById("su-pass2").value;

    if (!name || !email || !pass) return alert("Fill all fields.");
    if (pass !== pass2) return alert("Passwords do not match.");

    const users = getUsers();
    if (users.some(u => u.email === email)) {
      return alert("User already exists.");
    }

    users.push({ name, email, pass });
    saveUsers(users);

    alert("Account created! You can now log in.");
    window.location.href = "login.html";
  });

  // PASSWORD RESET
  const resetBtn = document.getElementById("reset-btn");
  resetBtn?.addEventListener("click", () => {
    const email = document.getElementById("fp-email").value.trim();
    const pass1 = document.getElementById("fp-password").value;
    const pass2 = document.getElementById("fp-password2").value;

    if (!email || !pass1 || !pass2) {
      alert("Fill all fields.");
      return;
    }

    if (pass1 !== pass2) {
      alert("Passwords do not match!");
      return;
    }

    let users = getUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      alert("No account found with that email.");
      return;
    }

    user.pass = pass1;
    saveUsers(users);

    alert("Password reset successful!");
    window.location.href = "login.html";
  });

  // ===============================
  // GOOGLE LOGIN (GSI)
  // ===============================
  const googleLoginBtn = document.getElementById("google-login");
  googleLoginBtn?.addEventListener("click", () => {
    google.accounts.id.initialize({
      client_id: "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com", // Replace with your real Client ID
      callback: handleGoogleCredential
    });
    google.accounts.id.prompt(); // shows the Google One Tap or popup
  });

  function handleGoogleCredential(response) {
    // Decode JWT token to get user info
    const jwt = response.credential;
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    const email = payload.email;

    // Save as logged in user
    setLoggedInUser(email);
    alert("Google login successful! Welcome " + email);
    window.location.href = "index.html";
  }

});
