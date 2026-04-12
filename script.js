// Page navigation
function showPage(page) {
  document
    .querySelectorAll(".page")
    .forEach((p) => p.classList.remove("active"));
  document
    .querySelectorAll(".nav-links a")
    .forEach((a) => a.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.getElementById("nav-" + page).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── HAMBURGER MENU ───
function toggleMenu() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  const isOpen = navLinks.classList.contains("open");
  if (isOpen) {
    closeMenu();
  } else {
    hamburger.classList.add("open");
    navLinks.classList.add("open");
  }
}
function closeMenu() {
  document.getElementById("hamburger").classList.remove("open");
  document.getElementById("navLinks").classList.remove("open");
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
window.addEventListener("resize", () => {
  if (window.innerWidth > 900) closeMenu();
});

// Navbar scroll effect
window.addEventListener("scroll", () => {
  document
    .getElementById("navbar")
    .classList.toggle("scrolled", window.scrollY > 20);
});

// ─── VALIDATION HELPERS ───
function showError(fieldId, errId, msg) {
  const el = document.getElementById(fieldId);
  el.classList.add("invalid");
  el.classList.remove("valid");
  document.getElementById(errId).textContent = msg;
}
function showValid(fieldId, errId) {
  const el = document.getElementById(fieldId);
  el.classList.add("valid");
  el.classList.remove("invalid");
  document.getElementById(errId).textContent = "";
}
function clearState(fieldId, errId) {
  const el = document.getElementById(fieldId);
  el.classList.remove("valid", "invalid");
  document.getElementById(errId).textContent = "";
}

// Regex patterns
const REGEX = {
  // Only letters, spaces, hyphens, apostrophes (handles names like "O'Brien", "Mary-Jane")
  name: /^[a-zA-Z\u0900-\u097F]+([\s'\-][a-zA-Z\u0900-\u097F]+)*$/,
  // RFC 5322 simplified but solid email check
  email: /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/,
  // Accepts: 10-digit Indian number, optional +91 or 0 prefix → total digits must be exactly 10
  phone: /^(?:\+91[\s\-]?|0)?[6-9]\d{9}$/,
};

function validateField(id) {
  const raw = document.getElementById(id).value;
  const val = raw.trim();
  const errId = "err-" + id;

  if (id === "fname") {
    if (!val) {
      showError(id, errId, "First name is required.");
      return false;
    }
    if (val.length < 2) {
      showError(id, errId, "Min 2 characters required.");
      return false;
    }
    if (val.length > 30) {
      showError(id, errId, "Max 30 characters allowed.");
      return false;
    }
    if (!REGEX.name.test(val)) {
      showError(id, errId, "Only letters, spaces or hyphens allowed.");
      return false;
    }
  }
  if (id === "lname") {
    if (!val) {
      showError(id, errId, "Last name is required.");
      return false;
    }
    if (val.length < 2) {
      showError(id, errId, "Min 2 characters required.");
      return false;
    }
    if (val.length > 30) {
      showError(id, errId, "Max 30 characters allowed.");
      return false;
    }
    if (!REGEX.name.test(val)) {
      showError(id, errId, "Only letters, spaces or hyphens allowed.");
      return false;
    }
  }
  if (id === "email") {
    if (!val) {
      showError(id, errId, "Email address is required.");
      return false;
    }
    if (!REGEX.email.test(val)) {
      showError(id, errId, "Enter a valid email (e.g. name@domain.com).");
      return false;
    }
  }
  if (id === "phone") {
    if (!val) {
      showError(id, errId, "Phone number is required.");
      return false;
    }
    // Strip spaces/dashes for regex test
    const cleaned = val.replace(/[\s\-]/g, "");
    if (!REGEX.phone.test(cleaned)) {
      showError(
        id,
        errId,
        "Enter a valid 10-digit Indian mobile number (starts with 6-9).",
      );
      return false;
    }
  }
  if (id === "type") {
    if (!val) {
      showError(id, errId, "Please select an option.");
      return false;
    }
  }
  if (id === "msg") {
    if (!val) {
      showError(id, errId, "Message cannot be empty.");
      return false;
    }
    if (val.length < 10) {
      showError(id, errId, "Please add a bit more detail (min 10 chars).");
      return false;
    }
    if (val.length > 1000) {
      showError(id, errId, "Message too long. Max 1000 characters.");
      return false;
    }
  }
  showValid(id, errId);
  return true;
}

// Live validation on blur & input
["fname", "lname", "email", "phone", "type", "msg"].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("blur", () => {
    if (el.value.trim()) validateField(id);
  });
  el.addEventListener("input", () => {
    if (el.classList.contains("invalid")) validateField(id);
  });
});

// Phone: allow only digits, +, spaces, hyphens — block letters live
document.getElementById("phone").addEventListener("keypress", function (e) {
  if (
    !/[\d\+\s\-]/.test(e.key) &&
    !["Backspace", "Delete", "Tab", "Enter"].includes(e.key)
  ) {
    e.preventDefault();
  }
});

// ─── FORM SUBMIT — WEB3FORMS ───
document
  .getElementById("contactForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();
    const fields = ["fname", "lname", "email", "phone", "type", "msg"];
    let isValid = true;
    fields.forEach((id) => {
      if (!validateField(id)) isValid = false;
    });
    if (!isValid) return;

    const btn = document.getElementById("submitBtn");
    document.getElementById("btn-text").style.display = "none";
    document.getElementById("btn-loader").style.display = "inline";
    btn.disabled = true;

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: new FormData(this),
      });
      const data = await res.json();
      if (data.success) {
        this.style.display = "none";
        document.getElementById("form-success").style.display = "block";
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      showToast("❌ Something went wrong. Please try again.", true);
      document.getElementById("btn-text").style.display = "inline";
      document.getElementById("btn-loader").style.display = "none";
      btn.disabled = false;
    }
  });

function resetForm() {
  const form = document.getElementById("contactForm");
  form.reset();
  ["fname", "lname", "email", "phone", "type", "msg"].forEach((id) =>
    clearState(id, "err-" + id),
  );
  form.style.display = "block";
  document.getElementById("form-success").style.display = "none";
  document.getElementById("btn-text").style.display = "inline";
  document.getElementById("btn-loader").style.display = "none";
  document.getElementById("submitBtn").disabled = false;
}

function showToast(msg, isError) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.style.background = isError ? "#C0392B" : "var(--navy)";
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 4000);
}
