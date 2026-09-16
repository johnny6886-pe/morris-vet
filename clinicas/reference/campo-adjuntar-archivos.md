# Campo "Adjuntar archivos" — guardado para más adelante

Este campo estuvo en el formulario de contacto (sección "Resumen del caso") y se quitó a propósito: la API de formularios de HubSpot no acepta archivos binarios en un envío hecho por fuera de su formulario embebido, solo guarda una URL. Mientras tanto, los exámenes/radiografías/fotos se piden por WhatsApp (ver la nota que quedó en su lugar en `index.html`).

Cuando conecten un servicio que sí reciba archivos de verdad (por ejemplo Getform/Forminit gratis con link de descarga, o Web3Forms Pro con adjunto real por correo), estos tres bloques reinstalan el campo con el mismo diseño que ya estaba aprobado — con el mismo ícono verde, el botón "Subir archivo" en español, y la lista de archivos con chips removibles. Solo hay que pegarlos de vuelta en su lugar y conectar el envío al servicio elegido (ver la nota al final).

## 1. HTML — va en `index.html`, dentro de `<form id="case-form">`, justo antes del botón `<button type="submit" class="form__submit">`

```html
<label class="form__field form__field--full">Exámenes y análisis (opcional)
  <span class="form__upload">
    <svg class="form__upload-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 17V7"/><path d="m8 11 4-4 4 4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>
    <span class="form__upload-copy">
      <span class="form__upload-title">Adjunta fotos o PDF</span>
      <span class="form__upload-hint">Puedes adjuntar varios: análisis de sangre, radiografías, ecografías o historia clínica · JPG, PNG o PDF</span>
    </span>
    <span class="form__upload-btn">Subir archivo</span>
    <input type="file" id="file-input" multiple accept="image/*,.pdf" aria-label="Adjuntar fotos o PDF">
  </span>
</label>
<ul class="form__files" id="file-list"></ul>
```

Y quitar (o dejar junto a este campo) la nota que la reemplazó:

```html
<p class="form__note">¿Tienes exámenes, radiografías o fotos del paciente? Envíalos por <a href="https://wa.me/51914962401" target="_blank" rel="noopener">WhatsApp</a> después de enviar este formulario — es el canal más rápido, sobre todo si el caso es urgente.</p>
```

## 2. CSS — va en `css/styles.css`, en la sección "5.11 Formulario de contacto" (junto a `.form__priority*`), reemplazando o junto a `.form__note`

```css
.form__upload{
  position: relative;
  display: flex; flex-wrap: wrap; align-items: center; gap: 14px;
  border: 2px dashed var(--color-line-soft); border-radius: var(--radius-sm);
  padding: 16px; background: #fff; cursor: pointer; transition: border-color .15s ease;
}
.form__upload:hover, .form__upload:focus-within{ border-color: var(--color-primary-alt); }
.form__upload-icon{ flex: none; stroke: var(--color-primary-alt); }
.form__upload-copy{ min-width: 0; flex: 1; }
.form__upload-title{ display: block; font-size: 15.5px; color: var(--color-ink); font-weight: 500; }
.form__upload-hint{ display: block; font-size: 13.5px; color: var(--color-ink-faint); margin-top: 2px; }
.form__upload-btn{
  flex: none; position: relative; z-index: 1;
  border: 2px solid var(--color-primary-alt); border-radius: 999px;
  padding: 8px 16px; font-size: 14px; font-weight: 600; color: var(--color-primary);
  background: #fff; white-space: nowrap;
}
.form__upload:hover .form__upload-btn, .form__upload:focus-within .form__upload-btn{ background: rgba(13, 189, 103, .1); }
.form__upload input[type="file"]{
  position: absolute; inset: 0; width: 100%; height: 100%;
  margin: 0; padding: 0; opacity: 0; cursor: pointer;
}

.form__files{ grid-column: 1 / -1; list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.form__file-chip{
  display: flex; align-items: center; gap: 8px;
  background: rgba(13, 189, 103, .12); border-radius: 999px;
  padding: 6px 8px 6px 14px; font-size: 14px; color: var(--color-primary); font-weight: 500;
}
.form__file-remove{
  flex: none; display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border: none; border-radius: 999px;
  background: transparent; color: var(--color-primary); padding: 0;
  transition: background-color .15s ease, color .15s ease;
}
.form__file-remove:hover{ background: var(--mv-naranja); color: var(--mv-blanco); }
```

## 3. JavaScript — va en `js/main.js`, dentro de la sección "2. Formulario de contacto"

Declarar junto a las otras variables del formulario:

```js
var fileInput = document.getElementById("file-input");
var fileList = document.getElementById("file-list");

// El navegador reemplaza fileInput.files por completo cada vez que se abre
// el selector de nuevo, así que mantenemos nuestra propia lista y la vamos
// sumando, para poder adjuntar archivos en varias vueltas.
var selectedFiles = [];

function fileKey(file) {
  return file.name + "_" + file.size + "_" + file.lastModified;
}

function syncFileInput() {
  var dt = new DataTransfer();
  selectedFiles.forEach(function (file) {
    dt.items.add(file);
  });
  fileInput.files = dt.files;
}

if (fileInput && fileList) {
  fileInput.addEventListener("change", function () {
    var incoming = Array.from(fileInput.files || []);
    var existingKeys = selectedFiles.map(fileKey);

    incoming.forEach(function (file) {
      var key = fileKey(file);
      if (existingKeys.indexOf(key) === -1) {
        selectedFiles.push(file);
        existingKeys.push(key);
      }
    });

    syncFileInput();
    renderFileList();
  });
}

function renderFileList() {
  fileList.innerHTML = "";

  selectedFiles.forEach(function (file, index) {
    var chip = document.createElement("li");
    chip.className = "form__file-chip";

    var checkIcon =
      '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" ' +
      'stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" ' +
      'aria-hidden="true"><path d="m5 13 4 4L19 7"/></svg>';

    var removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "form__file-remove";
    removeBtn.setAttribute("aria-label", "Quitar " + file.name);
    removeBtn.innerHTML =
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2.8" stroke-linecap="round" ' +
      'aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6 6 18"/></svg>';

    removeBtn.addEventListener("click", function () {
      removeFileAt(index);
    });

    chip.innerHTML = checkIcon + escapeHtml(file.name);
    chip.appendChild(removeBtn);
    fileList.appendChild(chip);
  });
}

function removeFileAt(indexToRemove) {
  selectedFiles.splice(indexToRemove, 1);
  syncFileInput();
  renderFileList();
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
```

Y en el handler de `formReset` (botón "Enviar otro caso"), agregar de vuelta la limpieza de archivos:

```js
if (formReset) {
  formReset.addEventListener("click", function () {
    form.reset();
    selectedFiles = [];
    fileList.innerHTML = "";
    formSuccess.hidden = true;
    form.hidden = false;
  });
}
```

## Lo único que falta al reinstalarlo: conectarlo a un servicio

Este código deja los archivos listos en `fileInput.files` (o en el arreglo `selectedFiles`), pero **no los envía a ningún lado por sí solo** — eso es aparte, y depende del servicio que elijan en su momento:

- **Getform/Forminit (gratis)**: se agrega el mismo `<input type="file">` dentro de un `<form>` normal apuntando a la URL de tu endpoint de Getform, con `method="POST"` y `enctype="multipart/form-data"` (puede ir en un segundo `<form>` oculto solo para el archivo, ya que el formulario principal sigue yendo a HubSpot).
- **Web3Forms Pro / Formspree pagos**: parecido, un `POST` con `enctype="multipart/form-data"` a la URL que te den, con su `access_key`/token correspondiente.

Avísenme cuando decidan el servicio y lo conecto.
