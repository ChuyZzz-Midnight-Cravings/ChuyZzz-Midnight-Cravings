document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signup-btn");
  const nameInput = document.getElementById("su-name");
  const emailInput = document.getElementById("su-email");
  const passInput = document.getElementById("su-pass");
  const pass2Input = document.getElementById("su-pass2");

  signupBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const pass = passInput.value.trim();
    const pass2 = pass2Input.value.trim();

    // --- Validation for empty fields ---
    if (!name || !email || !pass || !pass2) {
      let missingFields = [];
      if (!name) missingFields.push("Full Name");
      if (!email) missingFields.push("Email");
      if (!pass) missingFields.push("Password");
      if (!pass2) missingFields.push("Confirm Password");
      alert("Please fill in the following fields: " + missingFields.join(", "));
      return;
    }

    // --- Password match ---
    if (pass !== pass2) {
      alert("Passwords do not match!");
      return;
    }

    // --- Email format check ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    // --- Get existing users ---
    let users = JSON.parse(localStorage.getItem("users") || "[]");

    // --- Check duplicate email ---
    if (users.find(u => u.email === email)) {
      alert("This email is already registered!");
      return;
    }

    // --- Add new user ---
    const newUser = { name, email, password: pass };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    // --- Log in the user ---
    localStorage.setItem("loggedUser", email);

    alert("Account created successfully! Redirecting to your profile...");
    window.location.href = "profile.html";
  });
});
