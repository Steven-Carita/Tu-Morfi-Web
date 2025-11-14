(function () {
  function money(n) {
    if (n == null) return '';
    n = parseFloat(n);
    var s = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
    if (s.endsWith(',00')) s = s.slice(0, -3);
    return '$ ' + s;
  }
  function setMoney(id, val) {
    var el = document.getElementById(id);
    if (!el || val == null) return;
    el.innerHTML = money(val) + ' <span class="ars-badge">ARS</span>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    // --- Montos del resumen ---
    var total = localStorage.getItem('pago_total');
    var envio = localStorage.getItem('pago_envio');
    var subtotal = localStorage.getItem('pago_subtotal');

    // Fallback para que no se vea vacío si se entra directo
    if (total == null || total === '') {
      total = 20000;
    }
    if (envio == null || envio === '') {
      envio = 0;
    }
    if (subtotal == null || subtotal === '') {
      subtotal = total;
    }

    // Normalizamos montos como números
    total = parseFloat(total);
    envio = parseFloat(envio) || 0;
    subtotal = parseFloat(subtotal);

    var originalTotal = total;
    var currentTotal = total;
    var couponApplied = null;

    function actualizarTotalesConDescuento() {
      setMoney('precioTotal', currentTotal);
      setMoney('precioPagar', currentTotal);
    }

    setMoney('precioPrincipal', originalTotal);
    setMoney('precioEnvio', envio);
    setMoney('precioSubtotal', subtotal);
    actualizarTotalesConDescuento();

    // --- Modal de código de promoción ---
    var promoLink = document.getElementById('promoLink');
    var promoModal = document.getElementById('promoModal');
    var promoInput = document.getElementById('promoCodeInput');
    var promoApplyBtn = document.getElementById('promoApplyBtn');
    var promoCancelBtn = document.getElementById('promoCancelBtn');
    var promoTag = document.getElementById('promoAppliedTag');

    function abrirModalPromo() {
      if (!promoModal) return;
      promoModal.classList.add('is-visible');
      if (promoInput) {
        promoInput.value = '';
        promoInput.focus();
      }
    }

    function cerrarModalPromo() {
      if (!promoModal) return;
      promoModal.classList.remove('is-visible');
    }

    if (promoLink) {
      promoLink.addEventListener('click', function (e) {
        e.preventDefault();
        abrirModalPromo();
      });
    }

    if (promoCancelBtn) {
      promoCancelBtn.addEventListener('click', function () {
        cerrarModalPromo();
      });
    }

    if (promoModal) {
      promoModal.addEventListener('click', function (e) {
        if (e.target === promoModal) {
          cerrarModalPromo();
        }
      });
    }

    if (promoApplyBtn) {
      promoApplyBtn.addEventListener('click', function () {
        if (!promoInput) return;
        var code = promoInput.value.trim().toUpperCase();
        if (!code) {
          Toastify && Toastify({
            text: "Ingresá un código de promoción.",
            duration: 3000,
            gravity: "top",
            position: "right",
            close: true,
            style: { background: "linear-gradient(to right,#f97316,#fb923c)" }
          }).showToast();
          return;
        }

        if (couponApplied) {
          Toastify && Toastify({
            text: "Ya aplicaste un cupón.",
            duration: 3000,
            gravity: "top",
            position: "right",
            close: true,
            style: { background: "linear-gradient(to right,#22c55e,#4ade80)" }
          }).showToast();
          cerrarModalPromo();
          return;
        }

        var listaCupones = (window.PAYMENT_COUPONS || []);
        var cupon = listaCupones.find(function (c) {
          return (c.code || '').toUpperCase() === code;
        });

        if (!cupon || !cupon.discount) {
          Toastify && Toastify({
            text: "Código no válido.",
            duration: 3500,
            gravity: "top",
            position: "right",
            close: true,
            style: { background: "linear-gradient(to right,#b91c1c,#ef4444)" }
          }).showToast();
          return;
        }

        // Aplicamos 5% de descuento sobre el total original
        currentTotal = Math.round(originalTotal * (1 - cupon.discount) * 100) / 100;
        couponApplied = cupon.code;
        actualizarTotalesConDescuento();
        // Mostrar etiqueta de cupón aplicado junto al link
        if (promoTag) {
          var porcentaje = Math.round((cupon.discount || 0) * 100);
          if (!porcentaje || isNaN(porcentaje)) {
            porcentaje = 5;
          }
          promoTag.textContent = porcentaje + "% OFF aplicado";
          promoTag.classList.add('is-visible');
        }
        cerrarModalPromo();

        var mensaje = cupon.description || ("Cupón aplicado: " + cupon.code + " (5% OFF)");
        Toastify && Toastify({
          text: mensaje,
          duration: 4000,
          gravity: "top",
          position: "right",
          close: true,
          style: { background: "linear-gradient(to right,#16a34a,#22c55e)" }
        }).showToast();
      });
    }

    // --- Formato automático MM/AA ---
    var expInput = document.getElementById('exp');
    if (expInput) {
      expInput.setAttribute('maxlength', '5');
      expInput.addEventListener('input', function () {
        var val = expInput.value.replace(/[^0-9]/g, '');
        if (val.length >= 3) {
          expInput.value = val.substring(0, 2) + '/' + val.substring(2, 4);
        } else {
          expInput.value = val;
        }
      });
    }

    // --- Formato automático del número de tarjeta ---
    var cardInput = document.getElementById('card');
    if (cardInput) {
      cardInput.setAttribute('maxlength', '19'); // 16 dígitos + 3 espacios
      cardInput.addEventListener('input', function () {
        var val = cardInput.value.replace(/[^0-9]/g, ''); // solo números
        var grupos = val.match(/.{1,4}/g);
        var formatted = grupos ? grupos.join(' ') : '';
        cardInput.value = formatted;
      });
    }

    // --- Lógica de pago y redirección a success ---
    var payBtn = document.getElementById('payButton');
    if (!payBtn) return;

    payBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (payBtn.classList.contains('loading')) return;

      var email = document.getElementById('email').value.trim();
      var card = document.getElementById('card').value.trim();
      var exp = document.getElementById('exp').value.trim();
      var cvc = document.getElementById('cvc').value.trim();
      var name = document.getElementById('name').value.trim();
      var countryEl = document.getElementById('country');
      var country = countryEl ? countryEl.value : '';

      var originalHtml = payBtn.innerHTML;
      payBtn.classList.add('loading');
      payBtn.innerHTML = '<span class="spinner"></span>Procesando...';

      setTimeout(function () {
        var db = window.PAYMENT_DB || [];
        var ok = db.some(function (p) {
          return p.email === email &&
            p.card === card &&
            p.exp === exp &&
            p.cvc === cvc &&
            p.name === name &&
            p.country === country;
        });

        if (ok) {
          window.location.href = 'success.html';
        } else {
          Toastify({
            text: "Error. No pudimos procesar el pago.",
            duration: 5000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "right", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "linear-gradient(to right, #b12424ff, #cf3d3dff)",
            },
            offset: {
              x: 50, // horizontal axis - can be a number or a string indicating unity. eg: '2em'
              y: 20 // vertical axis - can be a number or a string indicating unity. eg: '2em'
            },
            onClick: function () { } // Callback after click
          }).showToast();



          payBtn.classList.remove('loading');
          payBtn.innerHTML = originalHtml;

        }
      }, 1200);
    });
  });
})();