/* =========================================================
   TAUS — contacto.js
   Lógica específica de la página de contacto:
   - Validación del formulario
   - Estado de éxito tras envío
========================================================= */
(function () {
  "use strict";

  const form        = document.getElementById("contactForm");
  const formSuccess = document.getElementById("formSuccess");
  const btnSubmit   = document.getElementById("btnSubmit");

  if (!form) return;

  // --- Marcar campo en error ---
  function setError(field) {
    field.style.borderColor = "#e05353";
    field.style.boxShadow   = "0 0 0 3px rgba(224,83,83,.14)";
  }

  // --- Limpiar error al escribir ---
  function clearError(field) {
    field.style.borderColor = "";
    field.style.boxShadow   = "";
  }

  form.querySelectorAll("input, select, textarea").forEach(function (field) {
    field.addEventListener("input",  function () { clearError(field); });
    field.addEventListener("change", function () { clearError(field); });
  });

  // --- Submit ---
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var requiredFields = form.querySelectorAll("[required]");
    var firstInvalid   = null;

    requiredFields.forEach(function (field) {
      clearError(field);
      if (!field.value.trim()) {
        setError(field);
        if (!firstInvalid) firstInvalid = field;
      }
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Estado de carga en el botón
    if (btnSubmit) {
      btnSubmit.disabled      = true;
      btnSubmit.style.opacity = "0.65";
      btnSubmit.style.cursor  = "wait";
    }

    // Aquí conectas tu backend / servicio de email (p. ej. Formspree, EmailJS, etc.)
    // Por ahora simula el envío con un timeout
    setTimeout(function () {
      form.style.display = "none";
      if (formSuccess) {
        formSuccess.style.display = "block";
      }
    }, 1100);
  });

})();