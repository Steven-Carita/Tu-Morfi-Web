
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btn-admin-login");
  if (!btn || typeof Swal === "undefined") return;

  
  btn.addEventListener("click", async () => {
  const { value: formValues } = await Swal.fire({
    title: "Ingreso administrador",
    html: `
      <div class="admin-swal-body">
        <input id="swal-admin-email"
               class="swal2-input admin-swal-input"
               placeholder="Email de admin">
        <input id="swal-admin-pass"
               type="password"
               class="swal2-input admin-swal-input"
               placeholder="Contraseña">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Ingresar",
    cancelButtonText: "Cancelar",
    customClass: {
      popup: "admin-swal-popup",
      title: "admin-swal-title",
      confirmButton: "admin-swal-confirm",
      cancelButton: "admin-swal-cancel"
    },
    buttonsStyling: false,
    preConfirm: () => {
      const email = (document.getElementById("swal-admin-email")?.value || "").trim();
      const pass = (document.getElementById("swal-admin-pass")?.value || "").trim();
      if (!email || !pass) {
        Swal.showValidationMessage("Completá email y contraseña");
        return;
      }
      return { email, pass };
    }
  });

  if (!formValues) return;

  const { email, pass } = formValues;
  const ADMIN_EMAIL = "admin@gmail.com";
  const ADMIN_PASS = "admin123";

  if (email.toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASS) {
    localStorage.setItem("tmw-admin", "1");

    Swal.fire({
        title: "Bienvenido",
        text: "Accediendo al panel de administración.",
        icon: "success",
        customClass: {
            popup: "admin-swal-popup",
            title: "admin-swal-title",
            confirmButton: "admin-swal-confirm"
        },
        buttonsStyling: false,
    }).then(() => {
        window.location.href = "../pages/admin.html";
    });

} else {
    Swal.fire({
        title: "Error",
        text: "Credenciales de administrador incorrectas.",
        icon: "error",
        customClass: {
            popup: "admin-swal-popup",
            title: "admin-swal-title",
            confirmButton: "admin-swal-confirm"
        },
        buttonsStyling: false,
    });
}

});

});
