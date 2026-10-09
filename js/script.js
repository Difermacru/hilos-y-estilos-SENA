/* ==========================================================
   HILOS & ESTILOS — Script principal
   Sin dependencias. No usa innerHTML con datos del usuario.
   ========================================================== */
(function () {
    "use strict"; // activa el modo estricto para evitar errores silenciosos

    /* ---------- CONFIGURACIÓN ---------- */
    // Datos editables en js/config.js (si falta el archivo, usamos valores vacíos)
    const CFG = Object.assign({}, window.SITIO_CONFIG || {});
    const ENDPOINT_FORMULARIO = (CFG.endpointFormulario || "").trim();

    // Utilidades de seguridad: solo aceptamos enlaces https y números de teléfono limpios
    const urlSegura = (u) => /^https:\/\/[^\s"'<>]+$/.test((u || "").trim()) ? u.trim() : "";
    const soloDigitos = (t) => String(t || "").replace(/\D/g, "");
    const correoValido = (c) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((c || "").trim());

    // Crea un enlace externo seguro (nueva pestaña sin acceso a nuestra ventana)
    function enlaceExterno(texto, href) {
        const a = document.createElement("a");
        a.href = href;
        a.textContent = texto; // textContent: nunca interpreta HTML
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        return a;
    }

    // Páginas del sitio: [archivo, texto del menú]
    const PAGINAS = [
        ["index.html", "Inicio"],
        ["catalogo.html", "Catálogo"],
        ["ofertas.html", "Ofertas"],
        ["contacto.html", "Contacto"]
    ];

    // Archivo de la página actual (si la URL termina en "/" es el inicio)
    const paginaActual = location.pathname.split("/").pop() || "index.html";

    /* ---------- HEADER Y FOOTER ---------- */
    // Se construyen aquí (en vez de fetch) para que funcionen también abriendo el archivo directo
    function construirHeader() {
        const contenedor = document.getElementById("header"); // punto de montaje
        if (!contenedor) return; // si no existe, salimos

        // Crea los <li> del menú marcando la página activa
        const items = PAGINAS.map(([archivo, texto]) => {
            const activo = archivo === paginaActual ? ' aria-current="page"' : "";
            return `<li><a href="${archivo}"${activo}>${texto}</a></li>`;
        }).join("");

        // HTML estático (no contiene datos del usuario, por eso es seguro)
        contenedor.innerHTML = `
        <header class="encabezado">
            <div class="contenedor encabezado-interno">
                <a class="marca" href="index.html" aria-label="Hilos y Estilos, ir al inicio">
                    <img src="assetes/imagenes/logo.jpg" alt="" width="52" height="52">
                    <p class="marca-nombre">HILOS <span>&amp;</span> ESTILOS</p>
                </a>
                <button class="menu-toggle" type="button" aria-expanded="false"
                        aria-controls="menu" aria-label="Abrir menú">☰</button>
                <nav class="nav-principal" id="menu" aria-label="Principal">
                    <ul class="links">${items}</ul>
                </nav>
            </div>
        </header>`;

        // Lógica del menú hamburguesa
        const boton = contenedor.querySelector(".menu-toggle");
        const menu = contenedor.querySelector(".nav-principal");

        boton.addEventListener("click", () => {
            const abierto = menu.classList.toggle("abierto"); // alterna visibilidad
            boton.setAttribute("aria-expanded", String(abierto)); // informa a lectores de pantalla
            boton.textContent = abierto ? "✕" : "☰"; // cambia el icono
        });

        // Cierra el menú con la tecla Escape
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && menu.classList.contains("abierto")) {
                menu.classList.remove("abierto");
                boton.setAttribute("aria-expanded", "false");
                boton.textContent = "☰";
                boton.focus();
            }
        });
    }

    function construirFooter() {
        const contenedor = document.getElementById("footer");
        if (!contenedor) return;

        const anio = new Date().getFullYear(); // año actual automático

        const enlaces = PAGINAS.map(([a, t]) => `<li><a href="${a}">${t}</a></li>`).join("");

        contenedor.innerHTML = `
        <footer>
            <div class="contenedor">
                <div class="footer-grid">
                    <div>
                        <h3>Hilos &amp; Estilos</h3>
                        <p>Moda y confección personalizada, hecha a tu medida y con atención a cada detalle.</p>
                    </div>
                    <div>
                        <h4>Navegación</h4>
                        <ul>${enlaces}</ul>
                    </div>
                    <div>
                        <h4>Contacto</h4>
                        <ul id="footer-contacto"></ul>
                    </div>
                </div>
                <p class="copy">© ${anio} Hilos &amp; Estilos. Todos los derechos reservados.</p>
            </div>
        </footer>`;

        // Rellena el contacto solo con los datos que existan en config.js
        const lista = contenedor.querySelector("#footer-contacto");
        const filas = datosContacto();
        if (!filas.length) {
            const li = document.createElement("li");
            li.textContent = "Escríbenos desde la página de contacto.";
            lista.appendChild(li);
        }
        filas.forEach((f) => lista.appendChild(f.nodo.cloneNode(true)));
    }

    // Construye las filas de contacto (icono + texto/enlace) según config.js
    function datosContacto() {
        const filas = [];
        const agregar = (icono, nodo) => {
            const li = document.createElement("li");
            const i = document.createElement("span");
            i.setAttribute("aria-hidden", "true");
            i.textContent = icono;
            const t = document.createElement("span");
            t.appendChild(nodo);
            li.append(i, t);
            filas.push({ nodo: li });
        };
        const txt = (t) => document.createTextNode(t);
        if (soloDigitos(CFG.whatsapp)) agregar("💬", enlaceExterno("WhatsApp", "https://wa.me/" + soloDigitos(CFG.whatsapp)));
        if (correoValido(CFG.email)) { const a = document.createElement("a"); a.href = "mailto:" + CFG.email.trim(); a.textContent = CFG.email.trim(); agregar("✉️", a); }
        if (urlSegura(CFG.instagram)) agregar("📸", enlaceExterno("Instagram", urlSegura(CFG.instagram)));
        if (urlSegura(CFG.facebook)) agregar("👍", enlaceExterno("Facebook", urlSegura(CFG.facebook)));
        if (CFG.direccion) agregar("📍", txt(String(CFG.direccion)));
        if (CFG.horario) agregar("🕘", txt(String(CFG.horario)));
        return filas;
    }

    // Muestra los datos de contacto en la página de contacto
    function rellenarContacto() {
        const ul = document.getElementById("datos-contacto");
        if (!ul) return;
        datosContacto().forEach((f) => ul.appendChild(f.nodo));
    }

    /* ---------- BOTONES FLOTANTES (WhatsApp y subir) ---------- */
    function botonesFlotantes() {
        const caja = document.createElement("div");
        caja.className = "flotantes";

        // Botón de WhatsApp: solo si hay número configurado
        if (soloDigitos(CFG.whatsapp)) {
            const wa = enlaceExterno("", "https://wa.me/" + soloDigitos(CFG.whatsapp) + "?text=" + encodeURIComponent("Hola, quisiera consultar por una prenda."));
            wa.className = "flotante flotante-wa";
            wa.setAttribute("aria-label", "Escríbenos por WhatsApp");
            wa.textContent = "💬";
            caja.appendChild(wa);
        }

        // Botón para volver arriba (aparece al bajar)
        const subir = document.createElement("button");
        subir.type = "button";
        subir.className = "flotante flotante-subir";
        subir.setAttribute("aria-label", "Volver arriba");
        subir.textContent = "↑";
        subir.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
        caja.appendChild(subir);
        document.body.appendChild(caja);

        window.addEventListener("scroll", () => {
            subir.classList.toggle("visible", window.scrollY > 500);
        }, { passive: true });
    }

    /* ---------- AMPLIAR FOTOS DEL CATÁLOGO ---------- */
    function activarLightbox() {
        const imagenes = document.querySelectorAll(".catalogo .producto-img img");
        if (!imagenes.length || typeof HTMLDialogElement === "undefined") return;

        const dialogo = document.createElement("dialog");
        dialogo.className = "lightbox";
        dialogo.setAttribute("aria-label", "Foto ampliada");
        const grande = document.createElement("img");
        const cerrar = document.createElement("button");
        cerrar.type = "button";
        cerrar.className = "lightbox-cerrar";
        cerrar.setAttribute("aria-label", "Cerrar");
        cerrar.textContent = "✕";
        dialogo.append(grande, cerrar);
        document.body.appendChild(dialogo);

        cerrar.addEventListener("click", () => dialogo.close());
        // Cierra al hacer clic fuera de la imagen
        dialogo.addEventListener("click", (e) => { if (e.target === dialogo) dialogo.close(); });

        imagenes.forEach((img) => {
            // Envolvemos la imagen en un botón para que sea accesible con teclado
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "ampliar";
            boton.setAttribute("aria-label", "Ampliar foto: " + img.alt);
            img.parentNode.insertBefore(boton, img);
            boton.appendChild(img);
            boton.addEventListener("click", () => {
                grande.src = img.src;
                grande.alt = img.alt;
                dialogo.showModal();
            });
        });
    }

    /* ---------- ANIMACIÓN AL HACER SCROLL ---------- */
    function activarAnimaciones() {
        const elementos = document.querySelectorAll(".aparecer");
        // Si el navegador no soporta IntersectionObserver, mostramos todo directamente
        if (!("IntersectionObserver" in window)) {
            elementos.forEach((el) => el.classList.add("visible"));
            return;
        }
        const observador = new IntersectionObserver((entradas) => {
            entradas.forEach((entrada) => {
                if (entrada.isIntersecting) {
                    entrada.target.classList.add("visible"); // lo hace visible
                    observador.unobserve(entrada.target); // deja de observarlo
                }
            });
        }, { threshold: 0.12 });
        elementos.forEach((el) => observador.observe(el));
    }

    /* ---------- FILTROS DEL CATÁLOGO ---------- */
    function activarFiltros() {
        const botones = document.querySelectorAll(".filtro");
        const productos = document.querySelectorAll(".catalogo .producto");
        if (!botones.length) return; // no estamos en el catálogo

        botones.forEach((boton) => {
            boton.addEventListener("click", () => {
                const categoria = boton.dataset.filtro; // "todos", "vestidos", etc.
                botones.forEach((b) => b.setAttribute("aria-pressed", String(b === boton)));
                productos.forEach((p) => {
                    // se oculta lo que no coincide con la categoría elegida
                    p.hidden = !(categoria === "todos" || p.dataset.categoria === categoria);
                });
            });
        });
    }

    /* ---------- FORMULARIO DE CONTACTO ---------- */
    function activarFormulario() {
        const form = document.getElementById("form-contacto");
        if (!form) return; // no estamos en contacto

        const estado = document.getElementById("estado-form");
        const mensaje = form.elements["mensaje"];
        const contador = document.getElementById("contador");
        const MAX_MENSAJE = 1000;

        // Pre-rellena el asunto si venimos desde una oferta o producto (?asunto=...)
        const asuntoURL = new URLSearchParams(location.search).get("asunto");
        if (asuntoURL) {
            const select = form.elements["asunto"];
            // solo aceptamos valores que existan en la lista (evita inyección)
            const valido = Array.from(select.options).some((o) => o.value === asuntoURL);
            if (valido) select.value = asuntoURL;
        }

        // Contador de caracteres del mensaje
        mensaje.addEventListener("input", () => {
            contador.textContent = `${mensaje.value.length} / ${MAX_MENSAJE}`;
        });

        // Muestra u oculta el error de un campo
        function marcarError(campo, texto) {
            const caja = document.getElementById("error-" + campo.name);
            campo.setAttribute("aria-invalid", texto ? "true" : "false");
            if (caja) caja.textContent = texto; // textContent: nunca interpreta HTML
            return !texto; // true si es válido
        }

        // Valida todos los campos
        function validar() {
            const nombre = form.elements["nombre"];
            const correo = form.elements["correo"];
            const texto = form.elements["mensaje"];

            const okNombre = marcarError(nombre,
                nombre.value.trim().length < 2 ? "Escribe tu nombre (mínimo 2 letras)." : "");
            // expresión simple y segura para validar correos
            const okCorreo = marcarError(correo,
                /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo.value.trim()) ? "" : "Ingresa un correo válido.");
            const okMensaje = marcarError(texto,
                texto.value.trim().length < 10 ? "Cuéntanos un poco más (mínimo 10 caracteres)." : "");

            return okNombre && okCorreo && okMensaje;
        }

        let ultimoEnvio = 0; // marca de tiempo para limitar envíos repetidos

        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // evita recargar la página
            estado.className = "mensaje-estado";
            estado.textContent = "";

            // Campo trampa: si un robot lo llena, fingimos éxito y no enviamos nada
            if (form.elements["sitio_web"].value) return;

            // Límite: un envío cada 30 segundos
            if (Date.now() - ultimoEnvio < 30000) {
                estado.className = "mensaje-estado error";
                estado.textContent = "Espera unos segundos antes de enviar otro mensaje.";
                return;
            }

            if (!validar()) {
                estado.className = "mensaje-estado error";
                estado.textContent = "Revisa los campos marcados.";
                const primero = form.querySelector('[aria-invalid="true"]');
                if (primero) primero.focus(); // lleva el foco al primer error
                return;
            }

            const boton = form.querySelector('button[type="submit"]');
            boton.disabled = true; // evita doble clic
            boton.textContent = "Enviando…";

            try {
                if (ENDPOINT_FORMULARIO) {
                    const datos = new FormData(form);
                    datos.delete("sitio_web"); // no enviamos el campo trampa
                    const resp = await fetch(ENDPOINT_FORMULARIO, {
                        method: "POST",
                        body: datos,
                        headers: { Accept: "application/json" }
                    });
                    if (!resp.ok) throw new Error("Respuesta " + resp.status);
                } else if (correoValido(CFG.email)) {
                    // Respaldo: abre el programa de correo del cliente con el mensaje listo
                    const cuerpo = "Nombre: " + form.elements["nombre"].value.trim() +
                        "\nCorreo: " + form.elements["correo"].value.trim() +
                        "\n\n" + form.elements["mensaje"].value.trim();
                    location.href = "mailto:" + CFG.email.trim() +
                        "?subject=" + encodeURIComponent(form.elements["asunto"].value) +
                        "&body=" + encodeURIComponent(cuerpo);
                } else {
                    // Sin servicio ni correo configurados: no fingimos que se envió
                    throw new Error("Formulario sin configurar");
                }
                ultimoEnvio = Date.now();
                estado.className = "mensaje-estado ok";
                estado.textContent = "¡Gracias! Recibimos tu mensaje y te responderemos pronto.";
                form.reset();
                contador.textContent = `0 / ${MAX_MENSAJE}`;
            } catch (err) {
                estado.className = "mensaje-estado error";
                estado.textContent = "No pudimos enviar tu mensaje por ahora. Inténtalo más tarde o contáctanos por otro medio.";
            } finally {
                boton.disabled = false;
                boton.textContent = "Enviar mensaje";
            }
        });
    }

    /* ---------- INICIO ---------- */
    document.addEventListener("DOMContentLoaded", () => {
        construirHeader();
        construirFooter();
        activarAnimaciones();
        activarFiltros();
        activarFormulario();
        rellenarContacto();
        botonesFlotantes();
        activarLightbox();
    });
})();
