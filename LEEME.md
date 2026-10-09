# Hilos & Estilos — guía rápida

## 1. Personalizar
Edita **`js/config.js`**: WhatsApp, correo, Instagram/Facebook, dirección, horario.
Lo que dejes vacío no se muestra. Si pones WhatsApp aparece un botón flotante.

## 2. Formulario
- Con `endpointFormulario` (ej. Formspree) se envía directo.
  Si usas otro dominio, cámbialo en `connect-src` y `form-action` de la CSP de cada .html.
- Sin endpoint pero con `email`, abre el correo del cliente con el mensaje listo.
- Sin ninguno de los dos, muestra un error (no finge el envío).

## 3. Publicar
- Netlify / Cloudflare Pages: usa `_headers`. Apache/cPanel: usa `.htaccess`.
- Activa HTTPS. Cambia `og:image` por una URL absoluta y agrega sitemap.xml.

## 4. Fotos
Reemplaza `assetes/imagenes/maniqui.jpg` y `maquina.jpg` por fotos propias (son de stock).
