/* =========================
   Helpers
========================= */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/* =========================
   Año en footer
========================= */
$('[data-js="year"]').textContent = String(new Date().getFullYear());

/* =========================
   Menú hamburguesa (BEM + data-js)
========================= */
const navToggle = $('[data-js="navToggle"]');
const navPanel = $('[data-js="navPanel"]');

function setMenu(open) {
  navPanel.dataset.open = open ? "true" : "false";
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  navToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
}

navToggle.addEventListener("click", () => {
  const isOpen = navPanel.dataset.open === "true";
  setMenu(!isOpen);
});

document.addEventListener("click", (e) => {
  const isOpen = navPanel.dataset.open === "true";
  if (!isOpen) return;

  const clickedInside =
    navPanel.contains(e.target) || navToggle.contains(e.target);
  if (!clickedInside) setMenu(false);
});

$$(".nav__link").forEach((a) =>
  a.addEventListener("click", () => setMenu(false)),
);

/* =========================
   Reveal on scroll (utility)
========================= */
const revealEls = $$(".u-reveal");
const io = new IntersectionObserver(
  (entries) => {
    for (const ent of entries) {
      if (ent.isIntersecting) {
        ent.target.classList.add("is-visible");
        io.unobserve(ent.target);
      }
    }
  },
  { threshold: 0.14 },
);

revealEls.forEach((el) => io.observe(el));

/* =========================
   Tilt effect (utility)
========================= */
function attachTilt(el) {
  const max = 10;

  function onMove(ev) {
    const r = el.getBoundingClientRect();
    const x = (ev.clientX - r.left) / r.width;
    const y = (ev.clientY - r.top) / r.height;

    const rx = (y - 0.5) * -max;
    const ry = (x - 0.5) * max;

    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
  }

  function onLeave() {
    el.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)";
  }

  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
}

$$(".u-tilt").forEach(attachTilt);

/* =========================
   Trabajos: click cambia detalle
========================= */
const workData = [
  {
    title: "Serie “Criaturas del Monte”",
    text: "Una colección de personajes con formas suaves, líneas gruesas y expresiones exageradas. Pensada para editorial, redes y merchandising.",
    bullets: [
      "Exploración de siluetas + gestos",
      "Paleta principal: verdes y acentos cálidos",
      "Versiones para impresión y digital",
    ],
  },
  {
    title: "Identidad “Verde Raro Studio”",
    text: "Sistema de identidad minimalista con personalidad: logotipo, tipografía, set de iconos y micro-animaciones para web.",
    bullets: [
      "Logo y variantes (responsive)",
      "Guía visual: color, retícula, componentes",
      "Animaciones sutiles para UI",
    ],
  },
  {
    title: "Pack de Stickers “Muecas”",
    text: "Stickers listos para tienda: cortes, bordes y exportación lista para impresión. Diseñados para enganchar a primera vista.",
    bullets: [
      "Preparación para impresión (márgenes/corte)",
      "Acabados: brillo, vinil, variantes",
      "Piezas optimizadas para e-commerce",
    ],
  },
];

const workCards = $$('[data-js="workCard"]');
const workTitle = $('[data-js="workTitle"]');
const workText = $('[data-js="workText"]');
const workBullets = $('[data-js="workBullets"]');

function setActiveWork(idx) {
  workCards.forEach((c) => c.classList.remove("work-card--active"));

  const card = workCards[idx];
  if (card) card.classList.add("work-card--active");

  const d = workData[idx];
  workTitle.textContent = d.title;
  workText.textContent = d.text;
  workBullets.innerHTML = d.bullets.map((b) => `<li>${b}</li>`).join("");
}

workCards.forEach((card) => {
  card.addEventListener("click", () => {
    const idx = Number(card.dataset.work || "0");
    setActiveWork(idx);
  });
});

setActiveWork(0);

/* =========================
   Galería: stacked cards slider (BEM)
========================= */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

const stage = $('[data-js="galleryStage"]');
const prevBtn = $('[data-js="galleryPrev"]');
const nextBtn = $('[data-js="galleryNext"]');

const galleryItems = [
  {
    label: "Ilustración — “Niño mandarina”",
    img: "assets/gallery/mandarina.png",
  },
  { label: "Sticker — “Chico Cactus”", img: "assets/gallery/cactus.png" },
  { label: "Poster — “Azteca”", img: "assets/gallery/azteca.png" },
  { label: "Poster — “Ouroboros”", img: "assets/gallery/urob.png" },
  {
    label: "Personaje — “El diablazo, la cebolla”",
    img: "assets/gallery/diablazo.png",
  },
  { label: "Print — “Los 3 Mosqueteros”", img: "assets/gallery/3mos.png" },
  { label: "Personaje — “Chico Emo”", img: "assets/gallery/chicoemo.png" },
  { label: "Personaje — “Diablo”", img: "assets/gallery/diablo.png" },
  {
    label: "Personaje — “Chill de Cojones”",
    img: "assets/gallery/chillcojones.png",
  },
];

let gIndex = 0;
let isDragging = false;
let dragStartX = 0;
let dragDeltaX = 0;
let lastX = 0;
let lastT = 0;
let velocityX = 0;

function renderGallery() {
  stage.innerHTML = "";
  const visibleCount = 4;

  for (let i = visibleCount - 1; i >= 0; i--) {
    const itemIdx = (gIndex + i) % galleryItems.length;
    const item = galleryItems[itemIdx];

    const card = document.createElement("div");
    card.className = "gallery-card";
    card.setAttribute("role", "group");
    card.setAttribute("aria-label", item.label);

    const art = document.createElement("div");
    art.className = "gallery-card__art";

    const img = document.createElement("img");
    img.className = "gallery-card__img";
    img.src = item.img;
    img.alt = item.label;
    img.loading = "lazy";

    art.appendChild(img);

    const label = document.createElement("div");
    label.className = "gallery-card__label";
    label.textContent = item.label;

    card.appendChild(art);
    card.appendChild(label);

    const depth = i;
    const fan = 1.25;
    const spread = 18;
    const isMobile = window.matchMedia("(max-width: 560px)").matches;

    const x = depth * (isMobile ? spread * 0.75 : spread) * fan;
    const y = depth * (isMobile ? 16 : 22) * fan;
    const rot = depth * (isMobile ? -3.8 : -5.2) * fan;
    const scale = 1 - depth * (isMobile ? 0.06 : 0.07);

    card.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${rot}deg) scale(${scale})`;
    card.style.zIndex = String(10 - depth);
    card.style.opacity = String(1 - depth * 0.1);

    const shadow = 0.22 - depth * 0.05;
    card.style.boxShadow = `0 26px 60px rgba(10,15,10,${clamp(shadow, 0.08, 0.22)})`;

    card.style.filter = depth === 0 ? "none" : `blur(${depth * 0.3}px)`;
    if (depth !== 0) card.style.pointerEvents = "none";

    stage.appendChild(card);
  }

  const front = stage.querySelector(".gallery-card");
  if (front) attachGalleryDrag(front);
}

function bumpStage() {
  stage.animate(
    [
      { transform: "translateY(0px)" },
      { transform: "translateY(-2px)" },
      { transform: "translateY(0px)" },
    ],
    { duration: 220, easing: "cubic-bezier(.2,.9,.2,1)" },
  );
}

function goNext() {
  gIndex = (gIndex + 1) % galleryItems.length;
  bumpStage();
  renderGallery();
}

function goPrev() {
  gIndex = (gIndex - 1 + galleryItems.length) % galleryItems.length;
  bumpStage();
  renderGallery();
}

prevBtn.addEventListener("click", goPrev);
nextBtn.addEventListener("click", goNext);

function attachGalleryDrag(frontCard) {
  frontCard.onmousedown = null;
  frontCard.ontouchstart = null;

  const setTransform = (x, rot, tilt) => {
    frontCard.style.transform = `translate(-50%, -50%) translate(${x}px, 0px) rotate(${rot}deg) rotateY(${tilt}deg) scale(1)`;
  };

  const animateBack = () => {
    frontCard.animate(
      [
        { transform: frontCard.style.transform || "translate(-50%, -50%)" },
        {
          transform:
            "translate(-50%, -50%) rotate(0deg) rotateY(0deg) scale(1)",
        },
      ],
      { duration: 380, easing: "cubic-bezier(.2,.9,.2,1)" },
    );
    frontCard.style.transform = "translate(-50%, -50%)";
  };

  const throwAway = (dir) => {
    const off = dir * (window.innerWidth * 0.75);
    const rot = dir * 18;

    frontCard.animate(
      [
        { transform: frontCard.style.transform || "translate(-50%, -50%)" },
        {
          transform: `translate(-50%, -50%) translate(${off}px, 0px) rotate(${rot}deg) rotateY(${dir * 12}deg) scale(1)`,
        },
      ],
      { duration: 260, easing: "cubic-bezier(.2,.9,.2,1)" },
    );

    setTimeout(() => {
      dir === -1 ? goNext() : goPrev();
    }, 170);
  };

  const onDown = (clientX) => {
    isDragging = true;
    dragStartX = clientX;
    dragDeltaX = 0;

    velocityX = 0;
    lastX = clientX;
    lastT = performance.now();

    frontCard.style.transition = "none";
  };

  const onMove = (clientX) => {
    if (!isDragging) return;

    const now = performance.now();
    const dx = clientX - lastX;
    const dt = Math.max(8, now - lastT);

    velocityX = dx / dt;
    lastX = clientX;
    lastT = now;

    dragDeltaX = clientX - dragStartX;

    const rot = clamp(dragDeltaX / 18, -18, 18);
    const tilt = clamp(velocityX * 80, -12, 12);

    setTransform(dragDeltaX, rot, tilt);

    const pull = clamp(Math.abs(dragDeltaX) / 280, 0, 1);
    frontCard.style.boxShadow = `0 30px 70px rgba(10,15,10,${0.22 + pull * 0.1})`;
  };

  const onUp = () => {
    if (!isDragging) return;
    isDragging = false;

    const threshold = 90;
    const vThreshold = 0.55;
    const v = velocityX;

    if (dragDeltaX < -threshold || v < -vThreshold) throwAway(-1);
    else if (dragDeltaX > threshold || v > vThreshold) throwAway(1);
    else animateBack();
  };

  frontCard.onmousedown = (e) => onDown(e.clientX);
  frontCard.ontouchstart = (e) => onDown(e.touches[0].clientX);

  const moveHandler = (e) => {
    if (!isDragging) return;
    if (e.touches && e.touches[0]) onMove(e.touches[0].clientX);
    else onMove(e.clientX);
  };

  const upHandler = () => onUp();

  window.addEventListener("mousemove", moveHandler, { passive: true });
  window.addEventListener("mouseup", upHandler, { passive: true });
  window.addEventListener("touchmove", moveHandler, { passive: true });
  window.addEventListener("touchend", upHandler, { passive: true });
}

renderGallery();

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === "ArrowRight") goNext();
});

stage.addEventListener(
  "wheel",
  (e) => {
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      if (e.deltaX > 0) goNext();
      else goPrev();
    }
  },
  { passive: false },
);

/* =========================
   Productos: botón Comprar (demo)
========================= */ /*
$$('[data-js="buyBtn"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.dataset.item || "Producto";

    btn.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-2px) scale(1.02)" },
        { transform: "translateY(0)" },
      ],
      { duration: 220, easing: "cubic-bezier(.2,.9,.2,1)" },
    );

    alert(`✅ Agregado: ${item}\n\nAquí podrías integrar tu checkout real.`);
  });
});
 */
document.querySelectorAll('[data-js="buyBtn"]').forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.dataset.item || "Producto";

    btn.animate(
      [
        { transform: "translateY(0)" },
        { transform: "translateY(-2px) scale(1.02)" },
        { transform: "translateY(0)" },
      ],
      { duration: 220, easing: "cubic-bezier(.2,.9,.2,1)" },
    );

    // 👉 redirección
    window.location.href = "https://www.instagram.com/ninix_delmont3";
  });
});

/* =========================
   Contacto: simulación envío
========================= */
const form = $('[data-js="contactForm"]');
const note = $('[data-js="formNote"]');

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const name = String(fd.get("name") || "").trim();
  const email = String(fd.get("email") || "").trim();
  const message = String(fd.get("message") || "").trim();

  if (!name || !email || !message) {
    note.textContent = "Porfa llena todos los campos 🙂";
    return;
  }

  note.textContent = "Enviando...";

  setTimeout(() => {
    note.textContent =
      "✅ Listo. Tu correo ha sido enviado. No olvides seguirme en Instagram para más novedades."; //FALTA AGREGRAR BACKEND REAL
    form.reset();
  }, 700);
});

/* =========================
CÓDIGO A AÑADIR PARA ENVIAR EL FORMULARIO A UN BACKEND REAL
<script src="https://cdn.emailjs.com/dist/email.min.js"></script>
<script>
  (function(){
    emailjs.init("TU_PUBLIC_KEY");
  })();

  document.getElementById("contact-form")
    .addEventListener("submit", function(e) {
      e.preventDefault();

      emailjs.sendForm(
        "TU_SERVICE_ID",
        "TU_TEMPLATE_ID",
        this
      ).then(
        () => alert("Mensaje enviado 💌"),
        (error) => alert("Error 😢")
      );
    });
</script>
Pros

No backend

Funciona en cualquier hosting

Muy profesional

Contras

Configuración inicial (15–20 min)

👉 Esta es la opción que usan la mayoría de tiendas pequeñas y creativos.

  ========================= */
