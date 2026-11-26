(() => {
  'use strict';

  /* 1. Sticky Navbar Elevation */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* 2. Mobile Navigation Drawer */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if (navToggle && mobileMenu) {
    const setMenuOpen = (open) => {
      mobileMenu.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    };

    navToggle.addEventListener('click', () => {
      const open = !mobileMenu.classList.contains('is-open');
      setMenuOpen(open);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMenuOpen(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        setMenuOpen(false);
        navToggle.focus();
      }
    });
  }

  /* 3. Hero Atmosphere Loop Video Control */
  const heroVideo = document.getElementById('heroAtmosphereVideo');
  const videoToggle = document.getElementById('videoToggle');
  if (heroVideo && videoToggle) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toggleLabel = videoToggle.querySelector('[data-label]');
    const iconPause = videoToggle.querySelector('[data-icon="pause"]');
    const iconPlay = videoToggle.querySelector('[data-icon="play"]');

    const syncToggleUI = (isPaused) => {
      if (toggleLabel) toggleLabel.textContent = isPaused ? 'Play' : 'Pause';
      if (iconPause) iconPause.style.display = isPaused ? 'none' : 'block';
      if (iconPlay) iconPlay.style.display = isPaused ? 'block' : 'none';
      videoToggle.setAttribute('aria-pressed', String(isPaused));
      videoToggle.setAttribute('aria-label', isPaused ? 'Play campus atmosphere preview' : 'Pause campus atmosphere preview');
    };

    if (reduceMotion) {
      heroVideo.pause();
      syncToggleUI(true);
    } else {
      heroVideo.play().catch(() => {
        syncToggleUI(true);
      });
    }

    videoToggle.addEventListener('click', () => {
      if (heroVideo.paused) {
        heroVideo.play().then(() => syncToggleUI(false)).catch(() => {});
      } else {
        heroVideo.pause();
        syncToggleUI(true);
      }
    });
  }

  /* 4. Click-to-Copy Finals Gift Code */
  const copyBtn = document.getElementById('copyGiftCode');
  if (copyBtn) {
    const codeText = copyBtn.getAttribute('data-code') || 'FINALS2026';
    const labelEl = copyBtn.querySelector('[data-code-label]');
    let resetTimer = null;

    copyBtn.addEventListener('click', async () => {
      let copied = false;
      try {
        await navigator.clipboard.writeText(codeText);
        copied = true;
      } catch {
        const tmp = document.createElement('textarea');
        tmp.value = codeText;
        tmp.setAttribute('readonly', '');
        tmp.style.position = 'fixed';
        tmp.style.opacity = '0';
        document.body.appendChild(tmp);
        tmp.select();
        copied = document.execCommand('copy');
        document.body.removeChild(tmp);
      }

      if (copied && labelEl) {
        copyBtn.classList.add('is-copied');
        labelEl.textContent = 'Copied!';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
          copyBtn.classList.remove('is-copied');
          labelEl.textContent = codeText;
        }, 2000);
      }
    });
  }

  /* 5. Screenshot Gallery Lightbox */
  const triggers = Array.from(document.querySelectorAll('[data-lightbox-index]'));
  const lightbox = document.getElementById('lightbox');
  if (triggers.length && lightbox) {
    const lbImg = document.getElementById('lightboxImg');
    const lbCaption = document.getElementById('lightboxCaption');
    const lbCounter = document.getElementById('lightboxCounter');
    const lbClose = document.getElementById('lightboxClose');
    const lbPrev = document.getElementById('lightboxPrev');
    const lbNext = document.getElementById('lightboxNext');

    const slides = triggers.map((btn) => ({
      src: btn.getAttribute('data-full') || '',
      alt: btn.getAttribute('data-alt') || '',
      caption: btn.getAttribute('data-caption') || ''
    }));

    let currentIndex = 0;
    let lastFocused = null;
    let touchStartX = 0;

    const renderSlide = (index) => {
      currentIndex = (index + slides.length) % slides.length;
      const item = slides[currentIndex];
      lbImg.src = item.src;
      lbImg.alt = item.alt;
      lbCaption.textContent = item.caption;
      lbCounter.textContent = `${currentIndex + 1} / ${slides.length}`;
    };

    const openLightbox = (index, triggerEl) => {
      lastFocused = triggerEl || document.activeElement;
      renderSlide(index);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lbClose.focus();
    };

    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
    };

    triggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-lightbox-index') || '0', 10);
        openLightbox(idx, btn);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => renderSlide(currentIndex - 1));
    lbNext.addEventListener('click', () => renderSlide(currentIndex + 1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(dx) > 48) {
        renderSlide(dx > 0 ? currentIndex - 1 : currentIndex + 1);
      }
    }, { passive: true });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') renderSlide(currentIndex - 1);
      else if (e.key === 'ArrowRight') renderSlide(currentIndex + 1);
    });
  }
})();
