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
├── assets/                 # Aquí va el tarifario-morrisvet.pdf (ver TODO)
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
   - `medico_responsable` (texto de una línea)
   - `distrito` (texto de una línea, o desplegable con los 11 distritos de la web)
   - `tipo_procedimiento` (texto de una línea, o desplegable con las mismas opciones del formulario)
   - `paciente` (texto de una línea)
   - `prioridad_caso` (texto de una línea, o desplegable: Programada / Esta semana / Urgente (24 h))
   - `resumen_caso` (texto multilínea)

   Los demás campos (clínica, WhatsApp, correo) usan las propiedades estándar de HubSpot `company`, `phone` y `email` — no hay que crear nada para esos tres.
3. **Crea un formulario en HubSpot** (Marketing → Formularios → Crear formulario) con esos mismos campos — no lo vas a insertar en la página (seguimos usando el formulario propio, ya diseñado), es solo para que HubSpot tenga dónde registrar los envíos. En la configuración del formulario, **desmarca "correo" como obligatorio** (en nuestra página es opcional) y revisa que no tenga activado ningún requisito de consentimiento legal (GDPR) que no aplique a Perú.
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

## Pendientes antes de publicar (TODO)

1. **Dominio real**: reemplaza `https://clinicas.morrisvet.pe/` por el dominio definitivo en `index.html` (canonical, Open Graph, JSON-LD), `robots.txt` y `sitemap.xml`. Usé ese como referencia porque el B2C ya usa `www.morrisvet.pe` según la guía de marca.
2. **Pipeline de HubSpot**: `HUBSPOT_PORTAL_ID` y `HUBSPOT_FORM_GUID` en `js/main.js` ya tienen los valores reales de la cuenta de Morris Vet, así que cada envío del formulario ya llega a HubSpot como contacto. Solo falta el paso 5 de "Conexión con HubSpot" arriba: armar el pipeline "Casos quirúrgicos" (Ventas → Negociaciones) para llevar el seguimiento de cada caso.
3. **Equipo médico**: el diseño no incluye todavía nombres/fotos del cirujano o cirujanos a cargo — cuando los definan, es una sección nueva fácil de sumar siguiendo el mismo patrón de `.team__item`.
