
const formRegister = document.querySelector(".form-register");
const inputUser = document.querySelector('.form-register [name="userName"]');
const inputLastName = document.querySelector('.form-register [name="userLastName"]');
const inputPass = document.querySelector('.form-register input[type="password"]');
const inputEmail = document.querySelector('.form-register input[type="email"]');
const alertaError = document.querySelector(".form-register .alerta-error");
const alertaExito = document.querySelector(".form-register .alerta-exito");


const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,40}$/;
export const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
export const passwordRegex = /^.{4,12}$/;


export const estadoValidacionCampos = {
  userName: false,
  userLastName: false,
  userEmail: false,
  userPassword: false,
};

document.addEventListener("DOMContentLoaded", () => {
  
  inputUser.addEventListener("input", () => {
    validarCampo(nameRegex, inputUser, "Solo letras (sin números ni caracteres especiales). Mínimo 2 caracteres.");
  });
  inputLastName.addEventListener("input", () => {
    validarCampo(nameRegex, inputLastName, "Solo letras (sin números ni caracteres especiales). Mínimo 2 caracteres.");
  });
  inputEmail.addEventListener("input", () => {
    validarCampo(emailRegex, inputEmail, "El correo solo puede contener letras, números, puntos, guiones y guión bajo.");
  });
  inputPass.addEventListener("input", () => {
    validarCampo(passwordRegex, inputPass, "La contraseña tiene que ser de 4 a 12 dígitos");
  });

  formRegister.addEventListener("submit", (e) => {
    e.preventDefault();
    validarCampo(nameRegex, inputUser, "Solo letras (sin números ni caracteres especiales). Mínimo 2 caracteres.");
    validarCampo(nameRegex, inputLastName, "Solo letras (sin números ni caracteres especiales). Mínimo 2 caracteres.");
    validarCampo(emailRegex, inputEmail, "El correo solo puede contener letras, números, puntos, guiones y guión bajo.");
    validarCampo(passwordRegex, inputPass, "La contraseña tiene que ser de 4 a 12 dígitos");
    enviarFormulario(formRegister, alertaError, alertaExito);
  });
});

export function validarCampo(regularExpresion, campo, mensaje) {

  
  if (campo.value.trim() === "") {
    eliminarAlerta(campo.parentElement.parentElement);
    estadoValidacionCampos[campo.name] = false;
    campo.parentElement.classList.remove("error");
    return;
  }
  const ok = regularExpresion.test(campo.value.trim());
  if (ok) {
    eliminarAlerta(campo.parentElement.parentElement);
    estadoValidacionCampos[campo.name] = true;
    campo.parentElement.classList.remove("error");
    return;
  }
  estadoValidacionCampos[campo.name] = false;
  campo.parentElement.classList.add("error");
  mostrarAlerta(campo.parentElement.parentElement, mensaje);
}

function mostrarAlerta(referencia, mensaje) {
  eliminarAlerta(referencia);
  const alertaDiv = document.createElement("div");
  alertaDiv.classList.add("alerta");
  alertaDiv.textContent = mensaje;
  referencia.appendChild(alertaDiv);
}

function eliminarAlerta(referencia) {
  const alerta = referencia.querySelector(".alerta");
  if (alerta) alerta.remove();
}


export function enviarFormulario(form, alertaError, alertaExito) {
 
  const isRegister = form.classList.contains("form-register");

  let valido = false;
  if (isRegister) {
    valido =
      estadoValidacionCampos.userName &&
      estadoValidacionCampos.userLastName &&
      estadoValidacionCampos.userEmail &&
      estadoValidacionCampos.userPassword;
  } else {
    
    valido = estadoValidacionCampos.userEmail && estadoValidacionCampos.userPassword;
  }

  if (valido) {
   
    let email = "";
    let password = "";
    let nombre = "";
    let apellido = "";

    try{
      const data = new FormData(form);
      email = (data.get("userEmail") || "").toString().trim();
      password = (data.get("userPassword") || "").toString();
      nombre = (data.get("userName") || "").toString().trim();
      apellido = (data.get("userLastName") || "").toString().trim();
    }catch(e){}

    
    if (window.AppDB) {
      if (isRegister) {
        window.AppDB.registerUser({
          nombre,
          apellido,
          email,
          password
        });
      } else {
        const ok = window.AppDB.login(email, password);
        if (!ok) {
          
          alertaExito.classList.remove("alertaExito");
          alertaError.classList.add("alertaError");
          setTimeout(() => {
            alertaError.classList.remove("alertaError");
          }, 3000);
          return;
        }
      }
    }

    
    estadoValidacionCampos.userName = false;
    estadoValidacionCampos.userLastName = false;
    estadoValidacionCampos.userEmail = false;
    estadoValidacionCampos.userPassword = false;

    form.reset();
    alertaExito.classList.add("alertaExito");
    alertaError.classList.remove("alertaError");

   
    if (!isRegister) {
      setTimeout(() => {
        try{
          window.location.href = "../../index.html";
        }catch(e){}
      }, 800);
    }

    setTimeout(() => {
      alertaExito.classList.remove("alertaExito");
    }, 3000);
    return;
  }


  alertaExito.classList.remove("alertaExito");
  alertaError.classList.add("alertaError");
  setTimeout(() => {
    alertaError.classList.remove("alertaError");
  }, 3000);
}
