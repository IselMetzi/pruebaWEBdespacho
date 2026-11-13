/* =========================================================
   CSEJU Abogados y Consultores – Comportamiento del sitio
   ========================================================= */
(() => {
  'use strict';

  /* ---------- CONFIGURACIÓN (edita aquí) ---------- */
  const CONFIG = {
    // Número de WhatsApp que recibe el formulario (código de país + número, sin + ni espacios)
    whatsappNumero: '50370902347',

  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  /* ---------- Año del pie de página ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Espacios de imagen: muestran el recuadro hasta que exista la imagen ---------- */
  $$('.img-slot').forEach((slot) => {
    const img = $('img', slot);
    if (!img) return;

    const marcarCargada = () => slot.classList.add('has-image');
    const marcarFaltante = () => {
      slot.classList.remove('has-image');
      slot.classList.add('is-missing');
    };

    if (img.complete) {
      img.naturalWidth > 0 ? marcarCargada() : marcarFaltante();
    } else {
      img.addEventListener('load', marcarCargada, { once: true });
      img.addEventListener('error', marcarFaltante, { once: true });
    }
  });


  /* ---------- Encabezado: sombra al hacer scroll ---------- */
  const header = $('#site-header');
  const onScroll = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menú móvil ---------- */
  const toggle = $('#nav-toggle');
  const menu = $('#menu');

  const setMenu = (abierto) => {
    if (!toggle || !menu) return;
    menu.classList.toggle('is-open', abierto);
    toggle.setAttribute('aria-expanded', String(abierto));
    toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Cerrar al elegir una opción
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));

    // Cerrar con Escape o al hacer clic fuera
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setMenu(false);
    });
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });

    // Al pasar a pantalla grande, restablecer
    window.matchMedia('(min-width: 960px)').addEventListener('change', (e) => {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Enlace activo según la sección visible ---------- */
  const links = $$('.nav-link');
  const secciones = links
    .map((l) => $(l.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window && secciones.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) =>
            l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`)
          );
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    secciones.forEach((s) => observer.observe(s));
  }

  /* ---------- Aparición suave al hacer scroll ---------- */
  const revelar = $$('[data-reveal]');
  const sinAnimacion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !sinAnimacion) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revelar.forEach((el) => {
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  /* ---------- Perfiles del equipo: ver más / ver menos ---------- */
  $$('.team-toggle').forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    btn.addEventListener('click', () => {
      const abierto = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!abierto));
      panel.hidden = abierto;
      btn.textContent = abierto ? 'Ver perfil completo' : 'Ocultar perfil';
    });
  });

  /* ---------- Formulario de contacto → WhatsApp ---------- */
  const form = $('#contact-form');
  const error = $('#form-error');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const datos = new FormData(form);
      const nombre = String(datos.get('nombre') || '').trim();
      const contacto = String(datos.get('contacto') || '').trim();
      const mensaje = String(datos.get('mensaje') || '').trim();

      if (!nombre || !contacto || !mensaje) {
        if (error) error.hidden = false;
        return;
      }
      if (error) error.hidden = true;

      const lineas = [
        'Hola, quisiera solicitar una consulta legal con CSEJU.',
        `Nombre: ${nombre}`,
        `Contacto: ${contacto}`,
        `Mensaje: ${mensaje}`
      ].filter(Boolean);

      const url = `https://wa.me/${CONFIG.whatsappNumero}?text=${encodeURIComponent(lineas.join('\n'))}`;
      window.open(url, '_blank', 'noopener');
      form.reset();
    });
  }
})();
