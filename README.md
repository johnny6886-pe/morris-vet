# Morris Vet — Sitio B2C (raíz de morrisvet.pe)

Landing de **atención veterinaria a domicilio** para dueños de mascotas.
Corresponde al diseño que hiciste en Claude Design ("Landing Mascotas") y
va en la **raíz** de morrisvet.pe. El sitio para clínicas (referidos
quirúrgicos) vive aparte, en `morrisvet.pe/clinicas`.

Metodología: la misma que en el sitio de clínicas — ITCSS (capas, de lo
general a lo específico) + BEM para nombrar clases. Sin frameworks ni
dependencias externas, solo HTML/CSS/JS y Google Fonts (Fredoka + Jost).

## Cómo integrarlo a tu repositorio

Tu repositorio de GitHub Pages debe quedar así:

```
tu-repo/
├── index.html          ← este sitio (reemplaza el placeholder que ya subiste)
├── css/styles.css
├── js/main.js
├── img/
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── CNAME               ← ya contiene "morrisvet.pe"
└── clinicas/            ← el sitio B2B que ya tienes, sin cambios
    ├── index.html
    ├── css/, js/, img/, assets/
    └── ...
```

Es decir: copia el contenido de esta carpeta directo a la raíz de tu
repositorio (reemplazando `index.html`, `css/`, `js/`, `img/`, `favicon.ico`,
`robots.txt`, `sitemap.xml` y `CNAME` que dejó el placeholder), y deja la
carpeta `clinicas/` tal como está. No hace falta tocar nada de DNS ni de la
configuración de Pages otra vez — ya quedó lista con el dominio personalizado.

**Nota sobre `robots.txt` y `sitemap.xml`:** ahora sí viven en la raíz real
del dominio, así que ya tienen efecto para buscadores (a diferencia del que
quedó dentro de `clinicas/`, que es solo informativo). El `sitemap.xml` de
aquí ya incluye las dos páginas (`morrisvet.pe/` y `morrisvet.pe/clinicas/`),
así que puedes ignorar el de `clinicas/sitemap.xml` o borrarlo.

## Formulario "Agendar visita" → HubSpot

Igual que en el sitio de clínicas, el formulario envía los datos directo a
HubSpot (Forms API), sin backend propio. Para activarlo:

1. En HubSpot: Marketing → Formularios → crea un formulario nuevo, por
   ejemplo "Agendar visita a domicilio (web)".
2. Copia su **Form GUID** y pégalo en `js/main.js`, reemplazando
   `HUBSPOT_FORM_GUID = "PENDIENTE_CREAR_FORMULARIO_B2C"` por el valor real.
   El Portal ID es el mismo que ya usas (`52008444`).
3. Propiedades de contacto que usa este formulario — la mayoría **ya
   existen** porque las creaste para el formulario de clínicas:
   - `firstname` — estándar de HubSpot (nombre del dueño).
   - `phone` — estándar de HubSpot (WhatsApp).
   - `email` — estándar de HubSpot. El formulario tiene un campo "Correo"
     **obligatorio**, así que HubSpot siempre recibe el dato real que
     escribió la persona (HubSpot necesita un `email` sí o sí para
     crear/identificar el contacto — sin él, el envío entero se descarta en
     silencio). No hay que crear ninguna propiedad nueva para esto (`email`
     ya existe), pero sí hay que agregarla como campo oculto al
     formulario — ver el paso 4.
   - `distrito` — ya existe, se reutiliza tal cual.
   - `paciente` — ya existe, se reutiliza tal cual (aquí guarda "mascota,
     nombre y edad" en vez de datos del paciente quirúrgico, pero el campo
     sirve igual).
   - `resumen_caso` — ya existe, se reutiliza tal cual.
   - `tipo_servicio_domicilio` — es la única propiedad nueva de este
     formulario en particular (tipo texto de una línea o desplegable), para
     no mezclar los servicios de "atención a domicilio" con los
     `tipo_procedimiento` del formulario de clínicas.
   - `linea_negocio` — **nueva, y también hay que crearla en el sitio de
     clínicas** (texto de una línea o desplegable con las opciones
     "Domicilio" y "Clínicas"). Sirve para poder filtrar en la lista de
     Contactos y ver por separado los casos de domicilio y los de clínicas,
     ya que ambos formularios comparten el mismo portal de HubSpot. Cada
     sitio manda su propio valor fijo automáticamente (no es un campo que
     llene el usuario).
   - `hs_lead_status` (Estado del lead) — propiedad de HubSpot, ya no hay
     que crearla. Este formulario también manda automáticamente el valor
     "Nuevo" en cada envío, igual que el de clínicas.

4. **Importante — agrega los campos al formulario, no solo a las
   propiedades:** además de crear las propiedades de contacto arriba, entra
   a editar el formulario que creaste en el paso 1 y agrégale como campos
   (pueden quedar **ocultos**, ya que este formulario no se muestra en la
   web) `email`, `linea_negocio` y `Estado del lead`. La API de envíos de
   HubSpot descarta cualquier propiedad que el código mande pero que no esté
   dada de alta en el formulario — esto costó bastante depurar en el
   formulario de clínicas, así que no te saltes este paso. Si el formulario
   de "Agendar visita a domicilio" no tiene el campo `email` agregado, es
   justo el motivo por el que los envíos no estaban llegando.
5. Después de agregar los campos, dale clic a **"Revisar y actualizar"**
   para publicar el formulario — mientras diga "Guardado con cambios sin
   publicar", los envíos reales siguen usando la versión anterior.

Mientras el GUID no esté configurado, el formulario igual muestra la
pantalla de "¡Gracias!" al enviarse (para no bloquear al usuario), pero el
dato no llega a HubSpot — revisa la consola del navegador si quieres
confirmarlo.

## Ver domicilio y clínicas por separado en HubSpot

Como los dos formularios comparten el mismo portal, todos los contactos
caen en el mismo listado de Contactos. Para verlos separados:

1. Ve a Contactos → en la parte de arriba, junto a las pestañas de vistas,
   haz clic en **"+"** para crear una vista nueva.
2. Agrega un filtro: propiedad `linea_negocio` es igual a `Domicilio`.
   Guarda la vista con un nombre como "Domicilio".
3. Repite creando otra vista con el filtro `linea_negocio` es igual a
   `Clínicas`, guardada como "Clínicas".

Desde ahí puedes cambiar entre una tabla y otra con las pestañas de vistas,
sin que se mezclen los casos de ambos negocios.

## Fotos — qué son de verdad y qué falta reemplazar

Las 5 fotos que subiste ya están incorporadas y optimizadas para web
(`img/hero-consulta-en-casa.jpg` y las 4 de `img/galeria-*.jpg`). Dos cosas
a tener en cuenta antes de publicar:

- Las 5 son fotos de banco (no son de tu equipo ni de pacientes reales) —
  igual que se señaló en el sitio de clínicas, conviene reemplazarlas por
  fotos reales de tus visitas apenas las tengas. Están puestas para que el
  sitio no se vea vacío mientras tanto.
- **`img/galeria-gato-sofa.jpg`** (la foto del gato en el sofá) muestra un
  bolso con la marca **"Vet2Go"** visible, que no es tu marca. La dejé
  puesta porque era la que mejor calzaba temáticamente con "gato atendido
  en su sofá", pero te recomiendo cambiarla antes de publicar para no mostrar
  el maletín de otro servicio veterinario en tu propia web — basta con
  reemplazar ese archivo por otra foto del mismo tamaño (768×405 o similar).

Los testimonios de la sección "Lo que dicen las familias" también son de
ejemplo (ya lo dice el aviso debajo de esa sección) — reemplázalos por
reseñas reales antes de publicar.

## Enlace entre ambos sitios

Agregué un enlace real en el footer ("Morris Vet también ofrece servicio
quirúrgico para clínicas veterinarias. Conoce más aquí.") que lleva a
`/clinicas/`, para que quien entre a la web de mascotas pueda llegar a la
de clínicas y viceversa. Si quieres, podemos agregar el enlace inverso
también en el footer de `clinicas/index.html`.

## Verificación hecha antes de entregar

- Formulario: confirmé con una prueba automatizada que el formulario se
  oculta y aparece "¡Gracias!" correctamente al enviarse (y viceversa con
  "Enviar otra solicitud") — antes de esa prueba había un bug de CSS que lo
  dejaba mostrando ambos al mismo tiempo; ya está corregido.
- Menú móvil: probado en 390px de ancho, el botón "Agendar visita" del menú
  desplegable se pone verde oscuro al pasar el mouse (igual que en el sitio
  de clínicas).
- Sin errores de consola del navegador en la página.
