const openingOverlay = document.getElementById("openingOverlay");
const petalLayer = document.getElementById("petalLayer");
const readLetterButton = document.getElementById("readLetterButton");
const fullLetter = document.getElementById("fullLetter");
const openGalleryButton = document.getElementById("openGalleryButton");
const photoGallery = document.getElementById("photoGallery");
const surpriseButton = document.getElementById("surpriseButton");
const surpriseMessage = document.getElementById("surpriseMessage");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const bgMusic = document.getElementById("bgMusic");

let musicFadeFrame;
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function hideOpeningOverlay() {
  window.setTimeout(() => openingOverlay.classList.add("hide"), 1100);
  window.setTimeout(() => openingOverlay.remove(), 1800);
}

function createPetals() {
  const count = reducedMotionQuery.matches ? 8 : 14;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.setProperty("--x", `${Math.random() * 100}vw`);
    petal.style.setProperty("--dx", `${Math.random() * 20 - 10}vw`);
    petal.style.setProperty("--dur", `${Math.random() * 6 + 8}s`);
    petal.style.animationDelay = `${Math.random() * 5}s`;
    fragment.appendChild(petal);
  }

  petalLayer.appendChild(fragment);
}

function refreshPetalsOnMotionChange() {
  reducedMotionQuery.addEventListener("change", () => {
    petalLayer.innerHTML = "";
    createPetals();
  });
}

function revealSections() {
  const targets = document.querySelectorAll(".reveal");
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

  targets.forEach((section) => observer.observe(section));
}

function fadeAudio(targetVolume) {
  cancelAnimationFrame(musicFadeFrame);
  const startVolume = bgMusic.volume;
  const duration = 500;
  const start = performance.now();

  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
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
    return;
  }

  fadeAudio(0);
  window.setTimeout(() => bgMusic.pause(), 520);
  musicToggle.setAttribute("aria-pressed", "false");
  musicLabel.textContent = "Play Music";
}

function revealLetter() {
  fullLetter.hidden = false;
  readLetterButton.disabled = true;
  readLetterButton.textContent = "Full Letter Opened";
}

function openGallery() {
  photoGallery.hidden = false;
  openGalleryButton.disabled = true;
  openGalleryButton.textContent = "Photo Gallery Opened";
}

function burstSurprise() {
  const rect = surpriseButton.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + window.scrollY + rect.height / 2;

  for (let i = 0; i < 22; i += 1) {
    const heart = document.createElement("span");
    heart.className = "burst-heart";
    heart.style.left = `${centerX + (Math.random() * 110 - 55)}px`;
    heart.style.top = `${centerY + (Math.random() * 40 - 20)}px`;
    heart.style.animationDelay = `${Math.random() * 0.25}s`;
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 1700);
  }

  for (let i = 0; i < 28; i += 1) {
    const petal = document.createElement("span");
    petal.className = "burst-petal";
    petal.style.left = `${centerX + (Math.random() * 130 - 65)}px`;
    petal.style.top = `${centerY + (Math.random() * 36 - 18)}px`;
    petal.style.animationDelay = `${Math.random() * 0.2}s`;
    document.body.appendChild(petal);
    window.setTimeout(() => petal.remove(), 1450);
  }

  surpriseMessage.textContent = "You are the heart of our family.";
}

function bindEvents() {
  musicToggle.addEventListener("click", toggleMusic);
  readLetterButton.addEventListener("click", revealLetter);
  openGalleryButton.addEventListener("click", openGallery);
  surpriseButton.addEventListener("click", burstSurprise);
}

function init() {
  hideOpeningOverlay();
  createPetals();
  refreshPetalsOnMotionChange();
  revealSections();
  bindEvents();
}

init();
