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

if (togglePassword && passwordInput) {
  togglePassword.addEventListener("click", function () {
    // تغيير نوع الحقل
    const type = passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    // تغيير شكل الأيقونة
    this.innerHTML = type === "password"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
          <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
        </svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
          <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
          <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-4.908 3.593A8.705 8.705 0 0 1 8 12.5c2.12 0 3.879-1.168 5.168-2.457.038-.037.077-.074.115-.113l.814.815a9.596 9.596 0 0 1-1.64 1.542l.57.57a10.459 10.459 0 0 0 1.91-1.64c.053-.057.108-.114.162-.172l.51.51a11.536 11.536 0 0 1-2.14 2.14l.263.264c.16.16.332.316.516.467l-.707.707a13.14 13.14 0 0 0-.585-.494l-.707 1.414zm-1.859-1.071l-.707-.707C2.43 14.246 1.173 15.75 1.173 15.75s3-5.5 8-5.5c.34 0 .673.04 1 .116l-.824-.824c-.057.06-.113.12-.17.178l-.51-.51a11.536 11.536 0 0 0 2.14-2.14l.263-.264a6.974 6.974 0 0 0 .584.494l.707-.707c-.16-.16-.33-.316-.516-.467l.707-1.414zm-4.908-1.542l-.814-.815a9.596 9.596 0 0 1 1.64-1.542l-.57-.57a10.459 10.459 0 0 0-1.91 1.64c-.053.057-.108.114-.162.172l-.51-.51a11.536 11.536 0 0 0 2.14-2.14l-.263-.264c-.16-.16-.332-.316-.516-.467l.707-.707a13.14 13.14 0 0 1 .585.494l.707-1.414z"/>
          <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
          <path d="M1 1l14 14"/>
        </svg>`;
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