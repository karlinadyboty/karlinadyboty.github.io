// ============ Menu mobile et switch de disponibilité ============
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const availabilityToggle = document.getElementById("availability-toggle");
const availabilityLabel = document.querySelector(".switch-label");

if (availabilityToggle && availabilityLabel) {
  const updateAvailabilityState = (isAvailable) => {
    availabilityToggle.setAttribute("aria-pressed", String(isAvailable));
    availabilityToggle.classList.toggle("is-off", !isAvailable);
    availabilityLabel.textContent = isAvailable ? "Disponible" : "Indisponible";
    availabilityLabel.setAttribute("data-state", isAvailable ? "online" : "offline");
  };

  availabilityToggle.addEventListener("click", () => {
    const nextState = availabilityToggle.getAttribute("aria-pressed") !== "true";
    updateAvailabilityState(nextState);
  });

  updateAvailabilityState(true);
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ============ Liens placeholder (href="#") ============
// Tant qu'un vrai lien n'a pas été renseigné, on empêche le comportement
// par défaut de href="#" (qui, combiné à scroll-behavior: smooth sur le
// <html>, ferait défiler toute la page vers le haut de façon inattendue).
document.querySelectorAll('a[data-placeholder="true"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
  });
});

// ============ Année automatique ============
document.getElementById("year").textContent = new Date().getFullYear();

// ============ Gestion du scroll, optimisée avec requestAnimationFrame ============
// Sans cette précaution, chaque pixel scrollé déclenche immédiatement toute
// la logique ci-dessous (potentiellement des dizaines de fois par seconde).
// En passant par requestAnimationFrame, on regroupe le travail une seule
// fois par image affichée par le navigateur (~60 fois/seconde max), ce qui
// évite de surcharger le thread principal pendant un défilement rapide.
const nav = document.querySelector(".nav");
let scrollTicking = false;

function handleScroll() {
  nav.classList.toggle("scrolled", window.scrollY > 10);
  updateActiveLink();
  scrollTicking = false;
}

window.addEventListener("scroll", () => {
  if (!scrollTicking) {
    requestAnimationFrame(handleScroll);
    scrollTicking = true;
  }
});

// ============ Texte de rôle défilant (effet machine à écrire) ============
const roles = [
  "Développeuse web",
  "Architecte de bases de données",
  "Créatrice d'API REST",
  "Développeuse Laravel & PHP",
];

const rotatorEl = document.getElementById("role-rotator");

if (rotatorEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const mot = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      rotatorEl.textContent = mot.slice(0, charIndex);
      if (charIndex === mot.length) {
        deleting = true;
        setTimeout(tick, 1600); // pause avant d'effacer
        return;
      }
    } else {
      charIndex--;
      rotatorEl.textContent = mot.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
      }
    }

    setTimeout(tick, deleting ? 35 : 65);
  }

  tick();
} else if (rotatorEl) {
  // Si l'utilisateur préfère moins d'animations, on affiche juste le premier rôle
  rotatorEl.textContent = roles[0];
}

// ============ Apparition au scroll (reveal) ============
const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  // Navigateur trop ancien pour IntersectionObserver : on affiche tout directement
  revealEls.forEach((el) => el.classList.add("visible"));
}

// ============ Mise en évidence du lien actif dans la nav (scrollspy) ============
const sections = document.querySelectorAll("section[id]");
const navAnchors = document.querySelectorAll(".nav a[href^='#']");

function updateActiveLink() {
  let currentId = "";
  const scrollPos = window.scrollY + 120; // décalage pour la nav sticky

  sections.forEach((section) => {
    if (scrollPos >= section.offsetTop) {
      currentId = section.id;
    }
  });

  navAnchors.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${currentId}`);
  });
}

// Appel initial : au chargement de la page (ex: lien direct vers #contact),
// la section active doit déjà être correctement surlignée, sans attendre
// le premier événement de scroll.
updateActiveLink();
