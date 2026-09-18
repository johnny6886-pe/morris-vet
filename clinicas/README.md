# Morris Vet Clínicas — landing B2B

Código de producción de la landing "Morris Vet — Atención Veterinaria para Clínicas", a partir del diseño UI aprobado en Claude Design y la Guía Visual de Marca.

## Estructura del proyecto

```
morris-vet-clinicas-site/
├── index.html              # Toda la página (HTML semántico + SEO)
├── css/
│   └── styles.css          # Una sola hoja de estilos, organizada por capas
├── js/
│   └── main.js             # Menú móvil, formulario, año dinámico
├── img/                    # Logos, foto e íconos (ver detalle abajo)
├── reference/               # Código guardado para reinstalar más adelante (ver abajo)
├── favicon.ico
├── robots.txt
└── sitemap.xml
```

No hay build ni dependencias: son archivos estáticos. Para verlo en local basta abrir `index.html` en el navegador, o levantar un servidor simple (`npx serve` o la extensión Live Server de VS Code) para que las rutas relativas y las fuentes de Google carguen igual que en producción.

## Metodología de código

- **HTML**: semántico (`header`, `main`, `section`, `footer`, jerarquía de encabezados h1→h4), con `aria-label`/`aria-labelledby` en cada sección y `alt` en todas las imágenes con significado (las puramente decorativas llevan `alt=""` + `aria-hidden`).
- **CSS**: metodología **ITCSS + BEM**.
  - *ITCSS* ordena el archivo de lo más general a lo más específico: tokens → reset → tipografía → objetos de layout reutilizables (`.o-*`) → componentes → utilidades (`.u-*`). Así evitas que una regla tardía "gane" por casualidad de orden en vez de por especificidad real.
  - *BEM* nombra cada componente como `bloque__elemento--modificador` (por ejemplo `.specialties__card--yellow`). Cada bloque es una sección de la página (`.hero`, `.faq`, `.contact`, etc.), así que si mañana agregas o quitas una sección, tocas un bloque y no rompes otro.
  - Toda la paleta y la tipografía están en variables CSS (`:root` al inicio de `styles.css`), con los nombres tal como aparecen en la Guía Visual de Marca (`--mv-verde-oscuro`, `--mv-amarillo`, etc.) más alias semánticos de uso (`--color-primary`, `--color-accent`...). Si la marca cambia un color, se edita en un solo lugar.
- **JavaScript**: vanilla, sin frameworks ni dependencias, en un único archivo con tres responsabilidades bien separadas (ver comentarios en `main.js`).

## Nota sobre tipografía

La guía de marca pide **Pie Piper** (logo) y **Century Gothic** (títulos/textos). Ninguna de las dos es una fuente web gratuita, así que el diseño en Claude Design ya las reemplazó por sus alternativas más cercanas y de licencia libre:

- **Fredoka** en vez de Pie Piper → mismo espíritu redondeado y amigable para títulos.
- **Jost** en vez de Century Gothic → geometría muy similar (círculos y trazos monolineales) para el texto de cuerpo.

Ambas se cargan desde Google Fonts en el `<head>` de `index.html`. Si más adelante consiguen las fuentes originales con licencia, solo hay que reemplazar el `<link>` de Google Fonts por tus propios `@font-face` y actualizar `--font-display` / `--font-body` en `styles.css`.

## Imágenes incluidas

| Archivo | Uso en la página |
|---|---|
| `img/morris-vet-isotipo-mark.png` | Isotipo (M + gato), recortado sin el relleno transparente del original — navbar, footer y pantalla de "caso recibido" |
| `img/morris-vet-logo-mark.png` | Logotipo "Morris Vet", recortado igual que el isotipo — footer |
| `img/morris-vet-isotipo.png`, `img/morris-vet-logo.png` | Archivos originales sin recortar (se conservan solo como respaldo; no se usan en la página) |
| `img/morris-vet-sello.png` | Sello decorativo sobre la foto del hero |
| `img/morris-vet-cirujano-clinica.webp` | Foto principal del hero |
| `img/og-cover.jpg` | Imagen de vista previa al compartir el link (WhatsApp, Facebook, Twitter/X) — la generé combinando la foto del hero con el logo, en el tamaño estándar 1200×630 |
| `favicon.ico`, `img/favicon-32.png`, `img/apple-touch-icon.png`, `img/icon-192.png`, `img/icon-512.png` | Set de favicons generado a partir del isotipo |

## Conexión con HubSpot (gestión de leads)

El formulario de contacto ya no valida nada más: al enviarlo, `js/main.js` manda los campos directo a la API de formularios de HubSpot (plan gratis, sin backend propio ni servicios intermedios). Para activarlo:

1. **Crea una cuenta de HubSpot** (plan gratis) si todavía no tienes una, y agrega como usuario al cirujano/equipo médico que también deba ver los casos (el plan gratis permite 2 usuarios).
2. **Crea las propiedades de contacto personalizadas** en HubSpot (Configuración → Propiedades → Propiedades de contacto → Crear propiedad), una por cada campo que no sea estándar, con exactamente estos nombres internos:
   - `distrito` (texto de una línea, o desplegable con los 11 distritos de la web)
   - `tipo_procedimiento` (texto de una línea, o desplegable con las mismas opciones del formulario) — **importante:** el nombre interno de una propiedad en HubSpot solo se puede definir al momento de crearla (después queda fijo, aunque cambies el nombre visible). Verifica antes de guardar que quede exactamente como `tipo_procedimiento`; si ya tienes una versión con otro nombre interno, bórrala y créala de nuevo con este nombre exacto (mientras no tenga datos guardados, no hay ningún riesgo en hacerlo).
   - `paciente` (texto de una línea)
   - `prioridad_caso` (texto de una línea, o desplegable: Programada / Esta semana / Urgente (24 h))
   - `resumen_caso` (texto multilínea)
   - `linea_negocio` (texto de una línea, o desplegable con las opciones "Domicilio" y "Clínicas") — se creó también en el sitio de mascotas (morrisvet.pe), y sirve para poder ver por separado en HubSpot los casos de clínicas y los de domicilio, ya que ambos formularios comparten el mismo portal. `js/main.js` manda automáticamente el valor "Clínicas" en cada envío — no es un campo que llene el usuario. Ver el README del sitio de mascotas para armar las dos vistas filtradas en Contactos.

   Los demás campos (clínica, médico responsable, WhatsApp, correo) usan las propiedades estándar de HubSpot `company`, `firstname`, `phone` y `email` — no hay que crear nada para esos cuatro. El médico responsable ya no tiene una propiedad personalizada aparte: se guarda directo en `firstname` (Nombre) para que la lista de contactos muestre ese nombre en vez del correo.

   **Sobre el correo:** el campo "Correo" del formulario ahora es **obligatorio** (antes era opcional), justo para que a HubSpot siempre le llegue el dato real — HubSpot necesita sí o sí un `email` para crear o identificar el contacto, y si el envío no trae ninguno lo descarta completo en silencio (así se quedaron sin llegar varios casos de domicilio en un momento, por el mismo motivo).
3. **Crea un formulario en HubSpot** (Marketing → Formularios → Crear formulario) con esos mismos campos, más `Estado del lead` y `linea_negocio` como campos **ocultos** (el código los manda automáticamente, el usuario nunca los ve) — no lo vas a insertar en la página (seguimos usando el formulario propio, ya diseñado), es solo para que HubSpot tenga dónde registrar los envíos. Revisa que no tenga activado ningún requisito de consentimiento legal (GDPR) que no aplique a Perú. **Importante:** la API de envíos de HubSpot descarta cualquier propiedad que el código mande pero que no esté agregada como campo del formulario, y los cambios al formulario no aplican hasta que le des clic a "Revisar y actualizar" para publicarlos.
4. **Copia el Portal ID y el GUID del formulario** y pégalos en `js/main.js`, al inicio de la sección 2 (`HUBSPOT_PORTAL_ID` y `HUBSPOT_FORM_GUID`). El Portal ID está en Configuración → Cuenta y facturación; el GUID del formulario se copia desde su código de inserción o la URL del editor.
5. **Arma el pipeline**: en HubSpot, ve a Ventas → Negociaciones y crea un pipeline "Casos quirúrgicos" con las etapas Nuevo caso → Cotizado → Agendado → Realizado. Cada envío del formulario crea o actualiza un **contacto**; para llevar el seguimiento, conviertan ese contacto en una negociación (un clic desde su ficha) y muévanla por el pipeline.

**Sobre los archivos adjuntos (exámenes, radiografías, fotos):** a propósito no viajan a HubSpot. Su API de formularios solo acepta texto — el campo "archivo" de HubSpot en realidad guarda una URL, no el archivo, y esa subida solo la hace el script propio de su formulario embebido (no está disponible para un envío hecho por fuera, como el nuestro). Por eso el formulario ahora invita a mandar esos archivos por WhatsApp justo después de enviar el caso — es además el canal más rápido para algo urgente. Si en algún momento quieren centralizar también los archivos en HubSpot, se puede armar una función serverless (por ejemplo en Cloudflare Workers, con plan gratis) que reciba el archivo, lo suba con la API de archivos de HubSpot usando una "app privada", y recién ahí complete el envío — es una pieza más de infraestructura, así que vale la pena solo si el volumen de casos lo justifica.

El campo de "Adjuntar archivos" que tenía el formulario (con el mismo diseño ya aprobado: ícono, botón "Subir archivo" y lista de chips) se guardó completo en `reference/campo-adjuntar-archivos.md`, listo para reinstalar cuando conecten un servicio de archivos (por ejemplo Getform/Forminit gratis, o Web3Forms Pro si quieren adjuntos reales por correo).

## Configuración SEO incluida

- **Metadatos**: `title` y `meta description` con las palabras clave del negocio (cirugía veterinaria, clínicas, Lima), `canonical`, `robots`.
- **Open Graph + Twitter Card**: para que el link se vea bien al compartirlo por WhatsApp/redes, usando `img/og-cover.jpg`.
- **Datos estructurados (JSON-LD)**: tipo `VeterinaryCare` de schema.org, con teléfono, correo, distritos de cobertura (`areaServed`) y redes (`sameAs`). Esto ayuda a que Google entienda de qué trata el negocio.
- **`robots.txt`** y **`sitemap.xml`**: listos para que cualquier buscador rastree el sitio.
- **Rendimiento**: `preconnect` a Google Fonts, la foto del hero con `fetchpriority="high"` (es lo primero que ve el usuario) y las imágenes del footer con `loading="lazy"` (cargan solo si el usuario llega hasta abajo); `width`/`height` en las imágenes para que la página no "salte" mientras carga.

## Publicar en morrisvet.pe/clinicas (GitHub Pages)

El dominio `morrisvet.pe` ya está comprado (directo en NIC.pe/punto.pe) y el sitio B2B va a vivir en la ruta `/clinicas` del mismo dominio, dentro del **mismo repositorio de GitHub** que el sitio B2C — GitHub Pages solo permite conectar un repo por dominio personalizado, así que no puede ser un repo aparte. Ya dejamos el código listo para esa ruta (`canonical`, Open Graph, JSON-LD y `sitemap.xml` apuntan a `https://morrisvet.pe/clinicas/`; todas las rutas de `img/`, `css/`, `js/` son relativas así que funcionan igual en la raíz o en una subcarpeta). Pasos para publicarlo:

1. **Copia esta carpeta dentro del repo del B2C**: todo el contenido de `morris-vet-clinicas-site/` (menos `README.md` y `reference/`, que son solo documentación interna) va en una carpeta llamada `clinicas/` en la raíz de ese repositorio — o sea, el resultado debe quedar como `clinicas/index.html`, `clinicas/css/styles.css`, etc.
2. **Archivo `CNAME`** (sin extensión, con ese nombre exacto) en la **raíz del repo** (no dentro de `clinicas/`) con una sola línea: `morrisvet.pe`. Ese archivo es el que le dice a GitHub Pages a qué dominio responder — aplica a todo el repo, incluida la carpeta `clinicas/`.
3. **DNS en el panel de NIC.pe (RCP)**: en la pantalla "DNS (administrar DNS)", click en **"Usar DNS de la RCP"** para activar su DNS propio (así puedes administrar los registros ahí mismo, sin depender de Cloudflare). Luego, en "Registros MX/CNAME/A/TXT", agrega 4 registros tipo **A** con host `@` apuntando a las IPs de GitHub Pages: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`. Si además quieren que `www.morrisvet.pe` funcione, agreguen un registro **CNAME** con host `www` apuntando a `<tu-usuario-de-github>.github.io`.
4. **En GitHub**: Settings → Pages → Custom domain → escribe `morrisvet.pe` → Save. GitHub revisa el DNS (puede tardar de minutos a un par de horas en propagar) y, una vez que lo detecta correctamente, aparece la opción **"Enforce HTTPS"** — actívala para que el candado/SSL funcione solo.
5. **`robots.txt`**: el que está en esta carpeta **no sirve tal cual dentro de `/clinicas/`** — un `robots.txt` solo funciona si vive en la raíz del dominio (`https://morrisvet.pe/robots.txt`). Hay que fusionar sus dos líneas (`Allow: /` y el `Sitemap:`) con el `robots.txt` real del repo del B2C (o crear uno en la raíz si el B2C todavía no tiene). El `sitemap.xml` de esta carpeta sí puede quedarse dentro de `clinicas/` sin problema, ya que el `Sitemap:` de robots.txt puede apuntar a cualquier ruta.

## Pendientes antes de publicar (TODO)

1. **Pipeline de HubSpot**: `HUBSPOT_PORTAL_ID` y `HUBSPOT_FORM_GUID` en `js/main.js` ya tienen los valores reales de la cuenta de Morris Vet, así que cada envío del formulario ya llega a HubSpot como contacto. Solo falta el paso 5 de "Conexión con HubSpot" arriba: armar el pipeline "Casos quirúrgicos" (Ventas → Negociaciones) para llevar el seguimiento de cada caso.
2. **Equipo médico**: el diseño no incluye todavía nombres/fotos del cirujano o cirujanos a cargo — cuando los definan, es una sección nueva fácil de sumar siguiendo el mismo patrón de `.team__item`.
