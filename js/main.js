/*!
 * Morris Vet — Atención Veterinaria a Domicilio (sitio B2C)
 * JavaScript de la landing. Sin dependencias externas.
 *
 * Contiene:
 *   1. Menú móvil (toggle del header)
 *   2. Formulario "Agendar visita": envío directo a HubSpot (Forms API) + estado
 *   3. Animaciones al hacer scroll (reveal de secciones)
 *   4. Año dinámico en el footer
 *
 * NOTA SOBRE EL FORMULARIO:
 * Igual que en el sitio de clínicas (morrisvet.pe/clinicas), los datos se
 * envían directo a HubSpot con su API de formularios, sin backend propio.
 * Antes de publicar el sitio hay que crear el formulario en HubSpot y
 * completar HUBSPOT_FORM_GUID aquí abajo (instrucciones en el README).
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
   * 2. Formulario "Agendar visita" → HubSpot
   * ------------------------------------------------------------------- */
  var form = document.getElementById("case-form");
  var formSuccess = document.getElementById("form-success");
  var formReset = document.getElementById("form-reset");
  var formSubmitBtn = form ? form.querySelector(".form__submit") : null;

  // Misma cuenta de HubSpot que el sitio de clínicas (portal 52008444), pero
  // con un formulario NUEVO y propio para "Agendar visita a domicilio"
  // (Marketing → Formularios). Reemplaza el GUID cuando lo crees.
  var HUBSPOT_PORTAL_ID = "52008444";
  var HUBSPOT_FORM_GUID = "8f1b7c26-218e-4655-9c30-c04e5e6994ba";

  // Relación entre el name= de cada campo y la propiedad interna en HubSpot.
  // "firstname" y "phone" son propiedades estándar de HubSpot. "distrito",
  // "paciente" y "resumen_caso" ya existen porque se crearon para el
  // formulario del sitio de clínicas — se reutilizan tal cual. La única
  // propiedad nueva que hay que crear es "tipo_servicio_domicilio" (ver
  // README).
  var HUBSPOT_FIELD_MAP = {
    nombre: "firstname",
    whatsapp: "phone",
    correo: "email",
    mascota: "paciente",
    distrito: "distrito",
    servicio: "tipo_servicio_domicilio",
    mensaje: "resumen_caso"
  };

  function submitToHubSpot(formData) {
    var fields = Object.keys(HUBSPOT_FIELD_MAP)
      .map(function (name) {
        var value = (formData.get(name) || "").toString().trim();
        return value ? { name: HUBSPOT_FIELD_MAP[name], value: value } : null;
      })
      .filter(Boolean);

    // El campo "Correo" del formulario es opcional (para no obligar a
    // completar un dato que a veces no tienen a mano), pero HubSpot
    // necesita un "email" sí o sí para poder crear o identificar el
    // contacto — sin él, el envío completo se descarta en silencio. Si no
    // lo llenaron, se arma uno de respaldo con los dígitos del WhatsApp.
    var tieneCorreo = fields.some(function (f) { return f.name === "email"; });
    if (!tieneCorreo) {
      var whatsappDigits = (formData.get("whatsapp") || "")
        .toString()
        .replace(/\D/g, "");
      if (whatsappDigits) {
        fields.push({
          name: "email",
          value: whatsappDigits + "@sincorreo.morrisvet.pe"
        });
      }
    }

    // Para poder separar en HubSpot los contactos de domicilio de los de
    // clínicas (mismo portal, un solo listado de Contactos), cada sitio
    // marca de dónde viene el contacto en la propiedad "linea_negocio".
    fields.push({ name: "linea_negocio", value: "Domicilio" });

    // Todo caso que llega por la web nace como "Nuevo" en Estado del lead,
    // igual que en el sitio de clínicas.
    fields.push({ name: "hs_lead_status", value: "Nuevo" });

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
          // Si HubSpot no responde (o el GUID todavía no está configurado),
          // igual dejamos pasar a la pantalla de confirmación: un problema
          // de red o de configuración no debería bloquear la solicitud.
          // Mientras tanto, WhatsApp y el teléfono siguen funcionando como
          // respaldo. Revisa la consola del navegador si ves este aviso.
          console.warn("No se pudo enviar la solicitud a HubSpot:", err);
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
