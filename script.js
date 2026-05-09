const intro = document.getElementById("cinematicIntro");
const introLines = [...document.querySelectorAll("[data-intro-line]")];
const enterExperience = document.getElementById("enterExperience");
const ambientLayer = document.getElementById("ambientLayer");
const petalLayer = document.getElementById("petalLayer");
const cursorGlow = document.getElementById("cursorGlow");
const surpriseButton = document.getElementById("surpriseButton");
const surpriseMessage = document.getElementById("surpriseMessage");
const lightFlash = document.getElementById("lightFlash");
const memoryCards = [...document.querySelectorAll(".memory-card")];
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const bgMusic = document.getElementById("bgMusic");

let musicFadeFrame;

function startIntroSequence() {
  introLines.forEach((line, index) => {
    setTimeout(() => line.classList.add("visible"), 850 * (index + 1));
  });
  setTimeout(() => enterExperience.classList.add("visible"), 850 * (introLines.length + 1));
}

function closeIntro() {
  intro.classList.add("hidden");
}

function createAmbient(type, count, layer) {
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const item = document.createElement("span");
    item.className = type;
    item.style.setProperty("--x", `${Math.random() * 100}vw`);
    item.style.setProperty("--dx", `${Math.random() * 18 - 9}vw`);
    item.style.setProperty("--dur", `${Math.random() * 12 + 10}s`);
    const size = type === "particle" ? Math.random() * 8 + 6 : Math.random() * 6 + 8;
    item.style.width = `${size}px`;
    item.style.height = `${size}px`;
    item.style.animationDelay = `${Math.random() * 8}s`;
    fragment.appendChild(item);
  }
  layer.appendChild(fragment);
}

function revealOnScroll() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".section-reveal").forEach((section) => observer.observe(section));
}

function animateCursorGlow() {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

function makeHeartsBurst() {
  const bounds = surpriseButton.getBoundingClientRect();
  for (let i = 0; i < 18; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.style.left = `${bounds.left + bounds.width / 2 + (Math.random() * 80 - 40)}px`;
    heart.style.top = `${bounds.top + window.scrollY + bounds.height / 2 + (Math.random() * 40 - 20)}px`;
    heart.style.animationDelay = `${Math.random() * 0.28}s`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 2200);
  }

  for (let i = 0; i < 20; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.setProperty("--x", `${bounds.left + bounds.width / 2}px`);
    petal.style.setProperty("--dx", `${Math.random() * 50 - 25}px`);
    petal.style.setProperty("--dur", `${Math.random() * 1.7 + 1.3}s`);
    petal.style.left = `${bounds.left + bounds.width / 2}px`;
    petal.style.top = `${bounds.top + window.scrollY + bounds.height / 2}px`;
    petal.style.opacity = "1";
    petal.style.animationName = "lift";
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 2100);
  }
}

function triggerSurprise() {
  makeHeartsBurst();
  surpriseMessage.classList.add("visible");
  lightFlash.classList.add("active");
  setTimeout(() => lightFlash.classList.remove("active"), 900);
}

function openLightbox(src, title) {
  lightboxImage.src = src;
  lightboxCaption.textContent = `${title} (placeholder) — replace this image when ready.`;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImage.removeAttribute("src");
  document.body.style.overflow = "";
}

function setupMemoryPreview() {
  memoryCards.forEach((card) => {
    card.addEventListener("click", () => {
      openLightbox(card.dataset.src || "", card.dataset.title || "Memory");
    });
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });
}

function fadeAudio(targetVolume) {
  cancelAnimationFrame(musicFadeFrame);
  const startVolume = bgMusic.volume;
  const duration = 700;
  const startTime = performance.now();

  const update = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    bgMusic.volume = startVolume + (targetVolume - startVolume) * progress;
    if (progress < 1) {
      musicFadeFrame = requestAnimationFrame(update);
    }
  };

  musicFadeFrame = requestAnimationFrame(update);
}

function toggleMusic() {
  if (bgMusic.paused) {
    bgMusic.volume = 0;
    bgMusic
      .play()
      .then(() => {
        fadeAudio(0.34);
        musicToggle.setAttribute("aria-pressed", "true");
        musicLabel.textContent = "Pause Music";
      })
      .catch(() => {
        musicLabel.textContent = "Tap To Play";
      });
  } else {
    fadeAudio(0);
    setTimeout(() => bgMusic.pause(), 750);
    musicToggle.setAttribute("aria-pressed", "false");
    musicLabel.textContent = "Play Music";
  }
}

function bindEvents() {
  enterExperience.addEventListener("click", closeIntro);
  surpriseButton.addEventListener("click", triggerSurprise);
  musicToggle.addEventListener("click", toggleMusic);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) {
      closeLightbox();
    }
  });
}

function init() {
  startIntroSequence();
  createAmbient("particle", 32, ambientLayer);
  createAmbient("petal", 18, petalLayer);
  revealOnScroll();
  animateCursorGlow();
  setupMemoryPreview();
  bindEvents();
}

init();
