/*!
 * Morris Vet — Atención Veterinaria para Clínicas
 * JavaScript de la landing. Sin dependencias externas.
 *
 * Contiene:
 *   1. Menú móvil (toggle del header)
 *   2. Formulario de contacto: envío directo a HubSpot (Forms API) + estado
 *   3. Animaciones al hacer scroll (reveal de secciones)
 *   4. Año dinámico en el footer
 *
 * NOTA SOBRE EL FORMULARIO:
 * Los datos del caso (clínica, distrito, procedimiento, prioridad, resumen...)
 * se envían directo a HubSpot con su API de formularios, sin backend propio.
 * No hay campo de adjuntar archivos a propósito: la API de formularios de
 * HubSpot no acepta archivos en un envío hecho por fuera de su formulario
 * embebido (solo guarda una URL, no el binario), así que los exámenes,
 * radiografías o fotos se piden por WhatsApp — ver la nota debajo del
 * formulario en index.html. Antes de publicar el sitio hay que completar
 * HUBSPOT_PORTAL_ID y HUBSPOT_FORM_GUID aquí abajo (instrucciones en el
 * README).
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------------------
   * 1. Menú móvil
   * ------------------------------------------------------------------- */
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = document.body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------------------------------------------------------------------
   * 2. Formulario de contacto → HubSpot
   * ------------------------------------------------------------------- */
  var form = document.getElementById("case-form");
  var formSuccess = document.getElementById("form-success");
  var formReset = document.getElementById("form-reset");
  var formSubmitBtn = form ? form.querySelector(".form__submit") : null;

  // Cuenta de HubSpot de Morris Vet — formulario "Solicitar un cirujano"
  // (Marketing → Formularios). Si alguna vez crean un formulario nuevo en
  // HubSpot para reemplazar este, actualicen el GUID aquí.
  var HUBSPOT_PORTAL_ID = "52008444";
  var HUBSPOT_FORM_GUID = "abf73978-6c88-464c-b444-395922e0b50f";

  // Relación entre el name= de cada campo del formulario y el nombre interno
  // de la propiedad en HubSpot. "company", "phone" y "email" son propiedades
  // estándar de HubSpot; el resto hay que crearlas como propiedades de
  // contacto personalizadas con exactamente estos nombres internos (el
  // README trae el detalle de cada una).
  var HUBSPOT_FIELD_MAP = {
    clinica: "company",
    medico: "medico_responsable",
    whatsapp: "phone",
    correo: "email",
    distrito: "distrito",
    procedimiento: "tipo_procedimiento",
    paciente: "paciente",
    prioridad: "prioridad_caso",
    resumen: "resumen_caso"
  };

  function submitToHubSpot(formData) {
    var fields = Object.keys(HUBSPOT_FIELD_MAP)
      .map(function (name) {
        var value = (formData.get(name) || "").toString().trim();
        return value ? { name: HUBSPOT_FIELD_MAP[name], value: value } : null;
      })
      .filter(Boolean);

    var endpoint =
      "https://api.hsforms.com/submissions/v3/integration/submit/" +
      HUBSPOT_PORTAL_ID + "/" + HUBSPOT_FORM_GUID;

    return fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: fields,
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      })
    });
  }

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.reportValidity()) return;

      var formData = new FormData(form);
      if (formSubmitBtn) formSubmitBtn.disabled = true;

      submitToHubSpot(formData)
        .catch(function (err) {
          // Si HubSpot no responde (o los IDs todavía no están configurados),
          // igual dejamos pasar al cliente a la pantalla de confirmación: un
          // problema de red o de configuración no debería bloquear el caso.
          // Mientras tanto, el WhatsApp y el teléfono siguen funcionando como
          // respaldo. Revisa la consola del navegador si ves este aviso.
          console.warn("No se pudo enviar el caso a HubSpot:", err);
        })
        .then(function () {
          form.hidden = true;
          if (formSuccess) {
            formSuccess.hidden = false;
            formSuccess.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          if (formSubmitBtn) formSubmitBtn.disabled = false;
        });
    });
  }

  if (formReset) {
    formReset.addEventListener("click", function () {
      form.reset();
      formSuccess.hidden = true;
      form.hidden = false;
    });
  }

  /* ---------------------------------------------------------------------
   * 3. Animaciones al hacer scroll (reveal)
   * ------------------------------------------------------------------- */
  var revealEls = document.querySelectorAll(".u-reveal");

  if (revealEls.length) {
    if ("IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      // Sin soporte de IntersectionObserver: mostrar todo directo, sin animar.
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }
  }

  /* ---------------------------------------------------------------------
   * 4. Año dinámico en el footer
   * ------------------------------------------------------------------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
