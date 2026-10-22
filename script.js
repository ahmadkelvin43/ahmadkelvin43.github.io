/* =========================================================
   AKATSUKI PROFILE — script.js
   Bahasa Indonesia: interaksi, animasi, galeri, kursor, partikel, audio.
   Audio berbeda untuk masuk website, membuka foto, dan menutup foto.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const body = document.body;
  const loader = $('#loader-screen');
  const enterButton = $('#enter-button');
  const progressFill = $('#progress-fill');
  const progressNumber = $('#progress-number');
  const loaderTyping = $('#loader-typing');
  const audioToggle = $('#audio-toggle');
  const audioToggleIcon = $('i', audioToggle);
  const audioToggleLabel = $('.audio-toggle-label', audioToggle);
  const audioNote = $('.audio-note');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- AUDIO: enam file terpisah; semua file sudah ada di folder /audio ----------
  const bgm = $('#bgm-audio');                       // Musik latar, loop.
  const clickAudio = $('#click-audio');              // Klik UI umum.
  const hoverAudio = $('#hover-audio');              // Hover menu/kartu.
  const entryAudio = $('#open-audio');               // Efek masuk website saat MASUK ditekan.
  const galleryOpenAudio = $('#gallery-open-audio'); // Efek saat foto dibuka.
  const galleryCloseAudio = $('#gallery-close-audio'); // Efek saat foto ditutup.
  const allAudio = [bgm, clickAudio, hoverAudio, entryAudio, galleryOpenAudio, galleryCloseAudio].filter(Boolean);

  const volumes = new Map([
    [bgm, 0.22],
    [clickAudio, 0.34],
    [hoverAudio, 0.15],
    [entryAudio, 0.50],
    [galleryOpenAudio, 0.72],
    [galleryCloseAudio, 0.50]
  ]);
  volumes.forEach((volume, audio) => {
    audio.volume = volume;
    // Muat efek singkat lebih awal agar gallery-open.mp3 siap saat foto diklik.
    audio.preload = 'auto';
    try { audio.load(); } catch (_) { /* Audio gagal dimuat tidak menghentikan website. */ }
  });
  if (bgm) bgm.loop = true;

  let audioAllowed = false;
  let audioMuted = false;
  let audioStarted = false;

  function playSound(audio, restart = true) {
    if (!audioAllowed || audioMuted || !audio) return;
    try {
      // Paksa audio galeri tidak ikut ter-mute dan mulai dari detik pertama.
      audio.muted = false;
      if (restart) audio.currentTime = 0;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((error) => {
          // Tampilkan petunjuk jika file hilang/ditolak, tanpa merusak halaman.
          console.warn(`Audio tidak dapat diputar: ${audio.currentSrc || audio.src}`, error);
        });
      }
    } catch (error) {
      console.warn('Gagal memulai efek audio:', error);
    }
  }

  function updateAudioButton() {
    if (!audioToggle) return;
    audioToggle.setAttribute('aria-pressed', String(audioStarted && !audioMuted));
    audioToggle.setAttribute('aria-label', audioMuted ? 'Aktifkan audio' : 'Matikan audio');
    audioToggleIcon.className = audioMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    audioToggleLabel.textContent = audioMuted ? 'AUDIO MUTED' : (audioStarted ? 'AUDIO ON' : 'AUDIO OFF');
    audioToggle.title = audioMuted ? 'Aktifkan audio' : (audioStarted ? 'Matikan audio' : 'Audio aktif setelah tombol MASUK');
  }

  function startAudioFromUserGesture() {
    // Fungsi ini dipanggil langsung dari klik MASUK sehingga browser mengizinkan audio.
    audioAllowed = true;
    audioMuted = false;
    audioStarted = true;
    allAudio.forEach((audio) => { audio.muted = false; });
    updateAudioButton();

    // Efek masuk website berbeda dari efek pembuka foto.
    playSound(entryAudio, true);
    playSound(bgm, false);
  }

  if (audioToggle) {
    audioToggle.addEventListener('click', () => {
      if (!audioAllowed) {
        if (audioNote) {
          audioNote.textContent = 'Tekan MASUK terlebih dahulu untuk mengaktifkan audio.';
          audioNote.classList.add('note-highlight');
        }
        return;
      }

      audioMuted = !audioMuted;
      allAudio.forEach((audio) => { audio.muted = audioMuted; });
      if (!audioMuted && audioStarted && bgm && bgm.paused) playSound(bgm, false);
      updateAudioButton();
      if (!audioMuted) playSound(clickAudio, true);
    });
  }
  updateAudioButton();

  // ---------- LOADER: teks ketik, progress, Sharingan, gerbang terbuka ----------
  body.classList.add('is-loading');
  const loadingMessages = [
    'Memuat...',
    'Mengumpulkan chakra...',
    'Membangkitkan kekuatan Rinnegan...',
    'Membuka arsip...'
  ];
  let messageIndex = 0;
  let typingTimer = null;

  function typeLoaderMessage(message) {
    if (typingTimer) window.clearInterval(typingTimer);
    let charIndex = 0;
    loaderTyping.textContent = '';
    typingTimer = window.setInterval(() => {
      loaderTyping.textContent = message.slice(0, charIndex + 1);
      charIndex += 1;
      if (charIndex >= message.length) {
        window.clearInterval(typingTimer);
        typingTimer = null;
      }
    }, reducedMotion ? 1 : 58);
  }

  typeLoaderMessage(loadingMessages[0]);
  const messageTimer = window.setInterval(() => {
    messageIndex = (messageIndex + 1) % loadingMessages.length;
    typeLoaderMessage(loadingMessages[messageIndex]);
  }, reducedMotion ? 300 : 850);

  let progress = 0;
  const progressTimer = window.setInterval(() => {
    progress = Math.min(100, progress + (progress < 70 ? 2 : 1));
    progressFill.style.width = `${progress}%`;
    progressNumber.textContent = String(progress);
    if (progress >= 100) {
      window.clearInterval(progressTimer);
      window.clearInterval(messageTimer);
      if (typingTimer) window.clearInterval(typingTimer);
      loaderTyping.textContent = 'Sistem siap. Masuk ke markas?';
      enterButton.disabled = false;
      enterButton.classList.add('ready');
    }
  }, reducedMotion ? 12 : 32);

  // Ganti teks profesi di sini sesuai kebutuhan.
  const roleElement = $('#typed-role');
  const roleTexts = ['Pelajar TJKT', 'Cybersecurity Enthusiast', 'Web Developer', 'Digital Creator'];
  let roleLoopStarted = false;

  function startRoleTyping() {
    if (!roleElement || roleLoopStarted) return;
    roleLoopStarted = true;
    let roleIndex = 0;
    let charIndex = roleTexts[0].length;
    let deleting = true;

    function tickRole() {
      if (deleting) {
        charIndex = Math.max(0, charIndex - 1);
        roleElement.textContent = roleTexts[roleIndex].slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roleTexts.length;
          window.setTimeout(tickRole, 250);
          return;
        }
        window.setTimeout(tickRole, reducedMotion ? 1 : 45);
        return;
      }

      const nextRole = roleTexts[roleIndex];
      charIndex = Math.min(nextRole.length, charIndex + 1);
      roleElement.textContent = nextRole.slice(0, charIndex);
      if (charIndex >= nextRole.length) {
        deleting = true;
        window.setTimeout(tickRole, 1550);
      } else {
        window.setTimeout(tickRole, reducedMotion ? 1 : 78);
      }
    }

    roleElement.textContent = roleTexts[0];
    window.setTimeout(tickRole, 1700);
  }

  function typeHeroName() {
    const nameElement = $('.glitch-name');
    if (!nameElement) return;
    const finalName = (nameElement.dataset.text || nameElement.textContent || 'AHMAD KELVIN NUGRAHA').trim();
    let charIndex = 0;
    nameElement.textContent = '';
    nameElement.dataset.text = '';
    const typing = window.setInterval(() => {
      charIndex += 1;
      const typedName = finalName.slice(0, charIndex);
      nameElement.textContent = typedName;
      nameElement.dataset.text = typedName;
      if (charIndex >= finalName.length) window.clearInterval(typing);
    }, reducedMotion ? 1 : 75);
  }

  enterButton.addEventListener('click', () => {
    if (enterButton.disabled || loader.classList.contains('opening')) return;
    startAudioFromUserGesture();
    loader.classList.add('opening');

    window.setTimeout(() => {
      loader.classList.add('dismissed');
      body.classList.remove('is-loading');
      $$('#home .reveal').forEach((element) => element.classList.add('is-visible'));
    }, reducedMotion ? 20 : 1000);

    window.setTimeout(typeHeroName, reducedMotion ? 30 : 430);
    window.setTimeout(startRoleTyping, reducedMotion ? 30 : 1050);
    window.setTimeout(() => loader.setAttribute('aria-hidden', 'true'), reducedMotion ? 100 : 1350);
  });

  // ---------- NAVIGASI STICKY, MENU MOBILE, DAN MENU AKTIF ----------
  const menuToggle = $('#menu-toggle');
  const mainNav = $('#main-nav');
  const navLinks = $$('.nav-link');
  const siteHeader = $('#site-header');

  function closeMenu() {
    mainNav.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Buka menu navigasi');
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi');
  });
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  function updateHeader() {
    siteHeader.classList.toggle('scrolled', window.scrollY > 20);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const observedSections = $$('main section[id]');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: '-35% 0px -50% 0px', threshold: 0 });
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  // ---------- SCROLL REVEAL ----------
  const revealElements = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  // ---------- ANIMASI BAR SKILL ----------
  const skillFills = $$('.skill-fill');
  skillFills.forEach((fill) => {
    const level = Math.max(0, Math.min(100, Number(fill.dataset.level) || 0));
    fill.style.setProperty('--skill-level', `${level}%`);
    const percentLabel = fill.closest('.skill-item')?.querySelector('.skill-percent');
    if (percentLabel) percentLabel.textContent = `${level}%`;
  });
  const skillsBlock = $('.skills-block');
  function animateSkills() { skillFills.forEach((fill) => fill.classList.add('animated')); }
  if (skillsBlock && 'IntersectionObserver' in window) {
    const skillObserver = new IntersectionObserver((entries, observer) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        animateSkills();
        observer.disconnect();
      }
    }, { threshold: 0.25 });
    skillObserver.observe(skillsBlock);
  } else {
    animateSkills();
  }

  // ---------- FOTO PROFIL: tampilkan fallback jika file tidak bisa dibaca ----------
  const profilePhoto = $('#profile-photo');
  const profileFallback = $('#profile-fallback');
  function showProfileFallback() {
    profilePhoto.style.display = 'none';
    profileFallback.style.display = 'flex';
  }
  function showProfileImage() {
    profilePhoto.style.display = 'block';
    profileFallback.style.display = 'none';
  }
  profilePhoto.addEventListener('error', showProfileFallback);
  profilePhoto.addEventListener('load', showProfileImage);
  if (profilePhoto.complete && profilePhoto.naturalWidth > 0) showProfileImage();
  else if (profilePhoto.complete && profilePhoto.naturalWidth === 0) showProfileFallback();

  // ---------- SEGEL FOTO PROFIL: tekan untuk membuka atau menutup foto ----------
  const profileFrame = $('.profile-frame');
  const profileSealTrigger = $('#profile-seal-trigger');
  if (profileFrame && profileSealTrigger) {
    let sealAnimationTimer = 0;
    profileSealTrigger.addEventListener('click', () => {
      const isUnsealed = profileFrame.classList.toggle('is-unsealed');

      // Gerakan segel dibuat ulang setiap kali dibuka/ditutup, tanpa mengganggu audio yang sudah ada.
      profileFrame.classList.remove('seal-opening', 'seal-closing');
      window.clearTimeout(sealAnimationTimer);
      void profileFrame.offsetWidth; // Paksa reflow supaya animasi dapat dimainkan ulang pada klik berikutnya.
      profileFrame.classList.add(isUnsealed ? 'seal-opening' : 'seal-closing');
      sealAnimationTimer = window.setTimeout(() => {
        profileFrame.classList.remove('seal-opening', 'seal-closing');
      }, reducedMotion ? 80 : 1050);

      profileSealTrigger.setAttribute('aria-expanded', String(isUnsealed));
      profileSealTrigger.setAttribute('aria-label', isUnsealed ? 'Tutup segel foto profil' : 'Buka segel foto profil');
      const sealTitle = $('.profile-seal-copy strong', profileSealTrigger);
      const sealHint = $('.profile-seal-copy small', profileSealTrigger);
      if (sealTitle) sealTitle.textContent = isUnsealed ? 'IDENTITAS TERBUKA' : 'SEGEL IDENTITAS';
      if (sealHint) sealHint.textContent = isUnsealed ? 'TEKAN LAMBANG UNTUK MENUTUP' : 'TEKAN UNTUK MEMBUKA';

      // Gunakan efek audio pembuka saat segel dibuka dan audio penutup saat disegel kembali.
      playSound(isUnsealed ? galleryOpenAudio : galleryCloseAudio, true);
    });
  }

  // ---------- GALERI: suara buka/tutup terpisah dari suara masuk website ----------
  const galleryCards = $$('.gallery-card');
  const lightbox = $('#lightbox');
  const lightboxImage = $('#lightbox-image');
  const lightboxIndex = $('#lightbox-index');
  const lightboxTitle = $('#lightbox-title');
  const lightboxDescription = $('#lightbox-description');
  const lightboxClose = $('#lightbox-close');
  const lightboxPrev = $('#lightbox-prev');
  const lightboxNext = $('#lightbox-next');
  let currentGalleryIndex = 0;
  let previousFocus = null;

  function updateLightbox(index) {
    if (!galleryCards.length) return;
    currentGalleryIndex = (index + galleryCards.length) % galleryCards.length;
    const card = galleryCards[currentGalleryIndex];
    const image = $('img', card);
    lightboxImage.classList.add('changing');
    lightboxImage.src = image.getAttribute('src');
    lightboxImage.alt = image.alt || card.dataset.title || 'Foto galeri';
    lightboxIndex.textContent = `${String(currentGalleryIndex + 1).padStart(2, '0')} / ${String(galleryCards.length).padStart(2, '0')}`;
    lightboxTitle.textContent = card.dataset.title || image.alt || `ARCHIVE ${currentGalleryIndex + 1}`;
    lightboxDescription.textContent = card.dataset.description || '';
    lightboxImage.onload = () => lightboxImage.classList.remove('changing');
    lightboxImage.onerror = () => lightboxImage.classList.remove('changing');
    if (lightboxImage.complete) window.setTimeout(() => lightboxImage.classList.remove('changing'), 80);
  }

  function openLightbox(index) {
    if (lightbox.classList.contains('is-open')) {
      updateLightbox(index);
      return;
    }
    previousFocus = document.activeElement;
    updateLightbox(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    body.classList.add('lightbox-open');
    lightboxClose.focus({ preventScroll: true });
    playSound(galleryOpenAudio, true); // Hanya suara buka galeri.
  }

  function closeLightbox() {
    if (!lightbox.classList.contains('is-open')) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    body.classList.remove('lightbox-open');
    playSound(galleryCloseAudio, true); // Hanya suara tutup galeri.
    if (previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus({ preventScroll: true });
    }
  }

  galleryCards.forEach((card, index) => card.addEventListener('click', () => openLightbox(index)));
  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => {
    updateLightbox(currentGalleryIndex - 1);
    playSound(clickAudio, true);
  });
  lightboxNext.addEventListener('click', () => {
    updateLightbox(currentGalleryIndex + 1);
    playSound(clickAudio, true);
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (!lightbox.classList.contains('is-open')) {
      if (event.key === 'Escape' && mainNav.classList.contains('is-open')) closeMenu();
      return;
    }
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowRight') updateLightbox(currentGalleryIndex + 1);
    if (event.key === 'ArrowLeft') updateLightbox(currentGalleryIndex - 1);
  });

  // ---------- FORM KONTAK: kirim pesan ke email melalui FormSubmit AJAX ----------
  const contactForm = $('#contact-form');
  const formFeedback = $('#form-feedback');
  const contactSubmitButton = $('.form-submit', contactForm);
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;

    const honeypot = $('[name="_honey"]', contactForm);
    if (honeypot && honeypot.value.trim()) return;

    const originalButtonHtml = contactSubmitButton.innerHTML;
    contactSubmitButton.disabled = true;
    contactSubmitButton.setAttribute('aria-busy', 'true');
    contactSubmitButton.innerHTML = '<span>MENGIRIM SINYAL...</span><i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i>';
    formFeedback.textContent = 'Menghubungkan ke layanan email dan mengirim pesan...';
    formFeedback.classList.add('feedback-active');

    try {
      const formData = new FormData(contactForm);
      const payload = {
        name: String(formData.get('name') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        message: String(formData.get('message') || '').trim(),
        _subject: 'Pesan baru dari website Ahmad Kelvin Nugraha',
        _template: 'table'
      };

      const response = await fetch('https://formsubmit.co/ajax/ahmadkelvin43@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      const success = response.ok && (result.success === true || result.success === 'true' || result.success === 1);

      if (!success) {
        throw new Error(result.message || 'Layanan email belum menerima pesan ini.');
      }

      formFeedback.textContent = 'Pesan berhasil dikirim ke layanan email. Jika ini pengiriman pertama, buka email konfirmasi FormSubmit di ahmadkelvin43@gmail.com dan klik tautan aktivasi agar pesan dapat diteruskan ke inbox.';
      contactForm.reset();
    } catch (error) {
      console.error('Gagal mengirim formulir kontak:', error);
      formFeedback.textContent = 'Pesan belum berhasil dikirim. Periksa koneksi internet, lalu coba kembali. Jika baru pertama kali memakai formulir ini, pastikan email sudah diaktifkan melalui FormSubmit.';
    } finally {
      contactSubmitButton.disabled = false;
      contactSubmitButton.removeAttribute('aria-busy');
      contactSubmitButton.innerHTML = originalButtonHtml;
    }
  });

  // ---------- EFEK SUARA KLIK DAN HOVER ----------
  document.addEventListener('click', (event) => {
    const clickable = event.target.closest('a, button');
    if (!clickable || clickable === enterButton || clickable === audioToggle) return;
    if (clickable.classList.contains('lightbox-arrow') || clickable.classList.contains('gallery-card')) return;
    if (clickable.closest('.lightbox')) return;
    playSound(clickAudio, true);
  });

  let lastHoverSoundAt = 0;
  document.addEventListener('pointerover', (event) => {
    const selector = '.nav-link, .button, .contact-link, .gallery-card, .audio-toggle';
    const item = event.target.closest(selector);
    if (!item || event.relatedTarget?.closest?.(selector) === item) return;
    const now = Date.now();
    if (now - lastHoverSoundAt > 180) {
      playSound(hoverAudio, true);
      lastHoverSoundAt = now;
    }
  });

  // ---------- KURSOR KHUSUS: hanya perangkat dengan pointer presisi ----------
  const cursor = $('.custom-cursor');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (finePointer.matches && cursor) {
    window.addEventListener('mousemove', (event) => {
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
      cursor.classList.add('cursor-visible');
    }, { passive: true });
    document.addEventListener('mouseleave', () => cursor.classList.remove('cursor-visible'));
    document.addEventListener('pointerover', (event) => {
      if (event.target.closest('a, button, input, textarea')) cursor.classList.add('cursor-hover');
    });
    document.addEventListener('pointerout', (event) => {
      if (event.target.closest('a, button, input, textarea')) cursor.classList.remove('cursor-hover');
    });
  } else {
    body.classList.add('touch-device');
  }

  // ---------- BACKGROUND AKATSUKI: kabut chakra, awan merah, dan parallax halus ----------
  // Lapisan ini dibuat lewat JavaScript agar HTML dan struktur komponen yang ada tidak perlu diubah.
  const akatsukiAtmosphere = document.createElement('div');
  akatsukiAtmosphere.className = 'akatsuki-atmosphere';
  akatsukiAtmosphere.setAttribute('aria-hidden', 'true');

  const akatsukiCloudSvg = '<svg viewBox="0 0 160 86" aria-hidden="true" focusable="false"><path d="M31 65 C16 65 8 56 11 44 C13 33 23 28 36 29 C29 15 42 5 56 10 C67 -1 84 1 92 15 C108 6 126 17 123 34 C138 35 147 45 144 55 C142 63 134 67 122 67 L34 67 C33 67 32 66 31 65 Z"/></svg>';
  akatsukiAtmosphere.innerHTML = `
    <span class="akatsuki-smoke akatsuki-smoke-one"></span>
    <span class="akatsuki-smoke akatsuki-smoke-two"></span>
    <span class="akatsuki-smoke akatsuki-smoke-three"></span>
    <span class="akatsuki-chakra-ring"></span>
    <span class="akatsuki-bg-cloud akatsuki-cloud-one">${akatsukiCloudSvg}</span>
    <span class="akatsuki-bg-cloud akatsuki-cloud-two">${akatsukiCloudSvg}</span>
    <span class="akatsuki-bg-cloud akatsuki-cloud-three">${akatsukiCloudSvg}</span>
    <span class="akatsuki-bg-cloud akatsuki-cloud-four">${akatsukiCloudSvg}</span>
    <span class="akatsuki-bg-cloud akatsuki-cloud-five">${akatsukiCloudSvg}</span>
    <span class="akatsuki-rune-field"></span>
    <span class="akatsuki-energy-stream akatsuki-energy-stream-one"></span>
    <span class="akatsuki-energy-stream akatsuki-energy-stream-two"></span>
    <span class="akatsuki-energy-vortex"></span>
    <span class="akatsuki-energy-flash"></span>
  `;

  const particleCanvasForBackground = $('#particle-canvas');
  body.insertBefore(akatsukiAtmosphere, particleCanvasForBackground || body.firstChild);

  // Efek parallax kecil mengikuti kursor di desktop; dinonaktifkan jika pengguna memilih reduced motion.
  const akatsukiFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!reducedMotion && akatsukiFinePointer.matches) {
    let akatsukiPointerFrame = 0;
    window.addEventListener('pointermove', (event) => {
      if (akatsukiPointerFrame) return;
      akatsukiPointerFrame = window.requestAnimationFrame(() => {
        const offsetX = ((event.clientX / Math.max(window.innerWidth, 1)) - 0.5) * -18;
        const offsetY = ((event.clientY / Math.max(window.innerHeight, 1)) - 0.5) * -14;
        akatsukiAtmosphere.style.setProperty('--akatsuki-pointer-x', `${offsetX.toFixed(2)}px`);
        akatsukiAtmosphere.style.setProperty('--akatsuki-pointer-y', `${offsetY.toFixed(2)}px`);
        akatsukiPointerFrame = 0;
      });
    }, { passive: true });
  }

  // ---------- PARTIKEL: abu dan kelopak merah bergerak di canvas ----------
  const canvas = $('#particle-canvas');
  const context = canvas.getContext('2d');
  let canvasWidth = 0;
  let canvasHeight = 0;
  let particles = [];
  let particleCount = reducedMotion ? 14 : (window.innerWidth < 600 ? 30 : 56);

  function makeParticle(randomY = false) {
    const size = Math.random() * 3.1 + 0.8;
    return {
      x: Math.random() * canvasWidth,
      y: randomY ? Math.random() * canvasHeight : -12,
      size,
      speedY: Math.random() * 0.65 + 0.2,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      opacity: Math.random() * 0.5 + 0.15,
      shape: Math.random() > 0.42 ? 'petal' : 'ash'
    };
  }

  function resizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = Math.floor(canvasWidth * ratio);
    canvas.height = Math.floor(canvasHeight * ratio);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particleCount = reducedMotion ? 14 : (window.innerWidth < 600 ? 30 : 56);
    particles = Array.from({ length: particleCount }, () => makeParticle(true));
  }

  function drawParticles() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    particles.forEach((particle, index) => {
      if (!reducedMotion) {
        particle.x += particle.speedX + Math.sin(particle.y * 0.008) * 0.18;
        particle.y += particle.speedY;
        particle.rotation += particle.rotationSpeed;
      }
      if (particle.y > canvasHeight + 18 || particle.x < -20 || particle.x > canvasWidth + 20) {
        particles[index] = makeParticle(false);
        return;
      }
      context.save();
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.globalAlpha = particle.opacity;
      if (particle.shape === 'petal') {
        context.fillStyle = index % 3 === 0 ? '#e62b3b' : '#8e1821';
        context.beginPath();
        context.ellipse(0, 0, particle.size * 1.8, particle.size * 0.8, 0, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillStyle = '#b4a7a7';
        context.fillRect(0, 0, particle.size * 0.7, particle.size * 0.7);
      }
      context.restore();
    });
    if (!reducedMotion) window.requestAnimationFrame(drawParticles);
  }

  resizeCanvas();
  if (reducedMotion) drawParticles();
  else window.requestAnimationFrame(drawParticles);
  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ---------- GLITCH BERKALA PADA NAMA ----------
  const heroContent = $('.hero-content');
  if (!reducedMotion && heroContent) {
    window.setInterval(() => {
      if (!document.hidden && !body.classList.contains('is-loading')) {
        heroContent.classList.add('glitching');
        window.setTimeout(() => heroContent.classList.remove('glitching'), 520);
      }
    }, 4800);
  }

  // Tahun footer otomatis.
  const yearElement = $('#current-year');
  if (yearElement) yearElement.textContent = String(new Date().getFullYear());
});
