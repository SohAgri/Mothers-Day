const ambientLayer = document.getElementById("ambientLayer");
const petalLayer = document.getElementById("petalLayer");
const cursorGlow = document.getElementById("cursorGlow");
const surpriseButton = document.getElementById("surpriseButton");
const surpriseOverlay = document.getElementById("surpriseOverlay");
const surpriseClose = document.getElementById("surpriseClose");
const surprisePetals = document.getElementById("surprisePetals");
const surpriseSparkles = document.getElementById("surpriseSparkles");
const hugButton = document.getElementById("hugButton");
const hugMessage = document.getElementById("hugMessage");
const musicToggle = document.getElementById("musicToggle");
const musicLabel = document.getElementById("musicLabel");
const galleryModal = document.getElementById("galleryModal");
const galleryImage = document.getElementById("galleryImage");
const galleryCaption = document.getElementById("galleryCaption");
const galleryClose = document.getElementById("galleryClose");

const MUSIC_KEY = "mothersDayMusicPreference";

let audioContext;
let masterGain;
let chordTimer;
let musicPlaying = false;
let autoPlayListener;

const chordProgression = [
  [220, 277.18, 329.63],
  [196, 246.94, 293.66],
  [174.61, 220, 261.63],
  [196, 246.94, 329.63],
];
let chordIndex = 0;

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

function buildSurprisePetals() {
  if (!surprisePetals) return;
  surprisePetals.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 24; i += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.setProperty("--x", `${Math.random() * 100}vw`);
    petal.style.setProperty("--dx", `${Math.random() * 40 - 20}vw`);
    petal.style.setProperty("--dur", `${Math.random() * 4 + 4}s`);
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDelay = `${Math.random() * 2}s`;
    const size = Math.random() * 6 + 10;
    petal.style.width = `${size}px`;
    petal.style.height = `${size * 1.4}px`;
    fragment.appendChild(petal);
  }
  surprisePetals.appendChild(fragment);
}

function buildSparkles() {
  if (!surpriseSparkles) return;
  surpriseSparkles.innerHTML = "";
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < 22; i += 1) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDelay = `${Math.random() * 2.5}s`;
    sparkle.style.animationDuration = `${Math.random() * 2 + 2}s`;
    fragment.appendChild(sparkle);
  }
  surpriseSparkles.appendChild(fragment);
}

function openSurprise() {
  surpriseOverlay.classList.add("open");
  surpriseOverlay.setAttribute("aria-hidden", "false");
  syncModalState();
  hugMessage.classList.remove("visible");
  buildSurprisePetals();
  buildSparkles();
  startMusic();
}

function closeSurprise() {
  surpriseOverlay.classList.remove("open");
  surpriseOverlay.setAttribute("aria-hidden", "true");
  syncModalState();
}

function openGallery(card) {
  const src = card.dataset.src;
  const title = card.dataset.title || "Memory";
  galleryImage.src = src;
  galleryImage.alt = title;
  galleryCaption.textContent = title;
  galleryModal.classList.add("open");
  galleryModal.setAttribute("aria-hidden", "false");
  syncModalState();
}

function closeGallery() {
  galleryModal.classList.remove("open");
  galleryModal.setAttribute("aria-hidden", "true");
  syncModalState();
}

function syncModalState() {
  const anyOpen = surpriseOverlay.classList.contains("open") || galleryModal.classList.contains("open");
  document.body.classList.toggle("modal-open", anyOpen);
}

function ensureAudio() {
  if (audioContext) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  audioContext = new AudioContext();
  masterGain = audioContext.createGain();
  masterGain.gain.value = 0;
  const filter = audioContext.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1200;
  masterGain.connect(filter);
  filter.connect(audioContext.destination);
}

function fadeTo(value, duration = 1) {
  if (!audioContext || !masterGain) return;
  const now = audioContext.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(value, now + duration);
}

function playChord(frequencies, startTime) {
  frequencies.forEach((freq) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.12, startTime + 0.8);
    gain.gain.linearRampToValueAtTime(0, startTime + 3.6);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 3.8);
  });
}

function scheduleChord() {
  if (!musicPlaying || !audioContext) return;
  playChord(chordProgression[chordIndex], audioContext.currentTime);
  chordIndex = (chordIndex + 1) % chordProgression.length;
  chordTimer = window.setTimeout(scheduleChord, 3600);
}

function updateMusicUI(isPlaying) {
  musicToggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
  musicLabel.textContent = isPlaying ? "Pause Music" : "Play Music";
}

function startMusic() {
  ensureAudio();
  if (!audioContext) return;
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  if (musicPlaying) return;
  musicPlaying = true;
  fadeTo(0.32, 1.2);
  scheduleChord();
  updateMusicUI(true);
  localStorage.setItem(MUSIC_KEY, "on");
}

function stopMusic() {
  if (!musicPlaying) return;
  musicPlaying = false;
  fadeTo(0, 1);
  window.clearTimeout(chordTimer);
  updateMusicUI(false);
  localStorage.setItem(MUSIC_KEY, "off");
}

function toggleMusic() {
  if (musicPlaying) {
    stopMusic();
  } else {
    startMusic();
  }
}

function requestAutoPlay() {
  if (autoPlayListener) return;
  autoPlayListener = () => {
    startMusic();
    document.removeEventListener("pointerdown", autoPlayListener);
    autoPlayListener = null;
  };
  document.addEventListener("pointerdown", autoPlayListener, { once: true });
}

function bindEvents() {
  surpriseButton.addEventListener("click", openSurprise);
  surpriseClose.addEventListener("click", closeSurprise);
  surpriseOverlay.addEventListener("click", (event) => {
    if (event.target.dataset.close === "surprise") {
      closeSurprise();
    }
  });

  hugButton.addEventListener("click", () => {
    hugMessage.classList.add("visible");
    if (navigator.vibrate) {
      navigator.vibrate([60, 40, 60]);
    }
  });

  galleryClose.addEventListener("click", closeGallery);
  galleryModal.addEventListener("click", (event) => {
    if (event.target.dataset.close === "gallery") {
      closeGallery();
    }
  });

  document.querySelectorAll(".gallery-card").forEach((card) => {
    card.addEventListener("click", () => openGallery(card));
  });

  musicToggle.addEventListener("click", toggleMusic);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (surpriseOverlay.classList.contains("open")) {
        closeSurprise();
      }
      if (galleryModal.classList.contains("open")) {
        closeGallery();
      }
    }
  });
}

function init() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPowerDevice =
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
  const particleCount = reducedMotion || lowPowerDevice ? 18 : 32;
  const petalCount = reducedMotion || lowPowerDevice ? 10 : 18;

  createAmbient("particle", particleCount, ambientLayer);
  createAmbient("petal", petalCount, petalLayer);
  revealOnScroll();
  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    animateCursorGlow();
  }
  bindEvents();

  if (localStorage.getItem(MUSIC_KEY) === "on") {
    musicLabel.textContent = "Tap To Resume";
    requestAutoPlay();
  }
}

init();
