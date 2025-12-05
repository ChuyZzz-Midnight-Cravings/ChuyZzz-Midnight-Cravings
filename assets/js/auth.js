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

document.addEventListener("DOMContentLoaded", () => {

  // -------------------------------
  // LOCAL LOGIN
  // -------------------------------
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

  // -------------------------------
  // GOOGLE LOGIN / SIGN-UP
  // -------------------------------
  const clientId = "540201718454-mub2h4ufht1b749ot2k3t9f019h2fcnm.apps.googleusercontent.com";

  
  google.accounts.id.initialize({
    client_id: clientId,
    callback: handleGoogleCredential
  });

  
  google.accounts.id.renderButton(
    document.getElementById("google-login-container"),
    { theme: "outline", size: "large", width: 250, text: "signin_with" }
  );

  
  google.accounts.id.prompt();

  
  const googleSignupBtn = document.getElementById("google-signup");
  googleSignupBtn?.addEventListener("click", () => {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleSignup
    });
    google.accounts.id.prompt();
  });

  // -------------------------------
  // HANDLERS
  // -------------------------------
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

});
