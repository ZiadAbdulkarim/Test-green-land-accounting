// auth.js

// تسجيل الدخول
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "inventory_sales.html"; // بعد الدخول يتحول للمخزون
      })
      .catch((error) => {
        const errorEl = document.getElementById("error");
        if (errorEl) {
          errorEl.innerHTML = `
            <div class="alert-message">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
              </svg>
              <span>بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى</span>
            </div>
          `;
        }
      });
  });
}

// وظيفة إظهار/إخفاء كلمة المرور
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");
const eyeIcon = document.getElementById("eyeIcon");

if (togglePassword && passwordInput && eyeIcon) {
  togglePassword.addEventListener("click", function () {

    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;

    if (type === "password") {
      eyeIcon.classList.remove("bi-eye-slash");
      eyeIcon.classList.add("bi-eye");
    } else {
      eyeIcon.classList.remove("bi-eye");
      eyeIcon.classList.add("bi-eye-slash");
    }

  });
}

// حماية الصفحات
auth.onAuthStateChanged((user) => {
  if (!user && !window.location.href.includes("index.html")) {
    window.location.href = "index.html";
  }
});

// تسجيل الخروج
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });

}
