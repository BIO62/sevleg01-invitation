// ============================================================
// AUDIO & WELCOME MODAL CONTROLLER
// ============================================================
const invitationMusic = document.getElementById('invitationMusic');
const welcomeModal = document.getElementById('welcomeModal');
const btnOpenInvite = document.getElementById('btnOpenInvite');
const musicToggleBtn = document.getElementById('musicToggleBtn');
const musicIcon = document.getElementById('musicIcon');

function openInvitation() {
  invitationMusic.play().then(() => {
    if (musicIcon) musicIcon.textContent = '🎵';
  }).catch(err => {
    console.log('Audio autoplay prevented:', err);
  });

  if (welcomeModal) {
    welcomeModal.classList.add('hidden');
  }
}

function toggleMusic() {
  if (invitationMusic.paused) {
    invitationMusic.play().then(() => {
      if (musicIcon) musicIcon.textContent = '🎵';
    });
  } else {
    invitationMusic.pause();
    if (musicIcon) musicIcon.textContent = '🔇';
  }
}

if (btnOpenInvite) {
  btnOpenInvite.addEventListener('click', openInvitation);
}

if (musicToggleBtn) {
  musicToggleBtn.addEventListener('click', toggleMusic);
}

// Fallback: auto-start music on any first user interaction if modal was dismissed
document.addEventListener('click', function initMusicOnInteraction() {
  if (invitationMusic && invitationMusic.paused && welcomeModal && welcomeModal.classList.contains('hidden')) {
    invitationMusic.play().then(() => {
      if (musicIcon) musicIcon.textContent = '🎵';
    }).catch(() => {});
  }
}, { once: true });

// ============================================================
// HERO BACKGROUND SLIDESHOW (Ken Burns Zoom)
// ============================================================
const slides = document.querySelectorAll('.hero-slider .slide');
let currentSlide = 0;

function nextSlide() {
  if (!slides || slides.length === 0) return;
  slides[currentSlide].classList.remove('active');
  currentSlide = (currentSlide + 1) % slides.length;
  slides[currentSlide].classList.add('active');
}

if (slides && slides.length > 1) {
  setInterval(nextSlide, 5000);
}

// ============================================================
// COUNTDOWN TIMER (Target: 2026.09.26 11:40:00)
// ============================================================
const targetDate = new Date('2026-09-26T11:40:00+08:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const diff = targetDate - now;

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!daysEl) return;

  if (diff <= 0) {
    daysEl.textContent = '00';
    hoursEl.textContent = '00';
    minutesEl.textContent = '00';
    secondsEl.textContent = '00';
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  daysEl.textContent = String(days).padStart(2, '0');
  hoursEl.textContent = String(hours).padStart(2, '0');
  minutesEl.textContent = String(minutes).padStart(2, '0');
  secondsEl.textContent = String(seconds).padStart(2, '0');
}

setInterval(updateCountdown, 1000);
updateCountdown();

// ============================================================
// MOBILE NAVIGATION MENU
// ============================================================
const menuToggle = document.getElementById('menuToggle');
const navLinks = document.getElementById('navLinks');

if (menuToggle && navLinks) {
  menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

// ============================================================
// RSVP FORM HANDLER
// ============================================================
const rsvpForm = document.getElementById('rsvpForm');
const rsvpSuccess = document.getElementById('rsvpSuccess');

if (rsvpForm) {
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const guestName = document.getElementById('guestName')?.value;
    const guestPhone = document.getElementById('guestPhone')?.value;
    const guestCount = document.getElementById('guestCount')?.value;
    const foodChoice = document.getElementById('foodChoice')?.value;
    const guestWish = document.getElementById('guestWish')?.value;

    console.log('RSVP Details Submitted:', {
      guestName,
      guestPhone,
      guestCount,
      foodChoice,
      guestWish
    });

    rsvpForm.style.display = 'none';
    if (rsvpSuccess) {
      rsvpSuccess.style.display = 'block';
    }
  });
}
