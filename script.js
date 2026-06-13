/* ============================================================
   IDEAGENSYS — script.js  (FIXED)
   Key fix: hero background images loaded via JS from data-bg
   so they display correctly regardless of CSS specificity.
============================================================ */

(function () {
  'use strict';

  /* ── LOAD HERO BACKGROUND IMAGES ──────────────────────── */
  // Images are set via data-bg attribute on each .slide
  // This approach ensures CSS gradient fallbacks work when
  // images are missing, and images load correctly when present.
  document.querySelectorAll('.slide[data-bg]').forEach(function(slide) {
    var imgSrc = slide.getAttribute('data-bg');
    if (!imgSrc) return;

    var img = new Image();
    img.onload = function() {
      // Image loaded successfully — apply as background
      slide.style.backgroundImage = 'url("' + imgSrc + '")';
    };
    img.onerror = function() {
      // Image not found — gradient fallback already in CSS, nothing to do
      console.info('Hero image not found: ' + imgSrc + ' — using gradient fallback.');
    };
    img.src = imgSrc;
  });

  /* ── HERO SLIDER ──────────────────────────────────────── */
  var slides       = document.querySelectorAll('.slide');
  var dots         = document.querySelectorAll('.slide-dot');
  var prevBtn      = document.getElementById('slidePrev');
  var nextBtn      = document.getElementById('slideNext');
  var currentSlide = 0;
  var slideInterval;
  var SLIDE_DELAY  = 5500;

  function goToSlide(index) {
    index = ((index % slides.length) + slides.length) % slides.length;
    slides[currentSlide].classList.remove('active');
    dots[currentSlide].classList.remove('active');
    currentSlide = index;
    slides[currentSlide].classList.add('active');
    dots[currentSlide].classList.add('active');
  }

  function nextSlide() { goToSlide(currentSlide + 1); }
  function prevSlide() { goToSlide(currentSlide - 1); }

  function startAutoSlide() {
    slideInterval = setInterval(nextSlide, SLIDE_DELAY);
  }

  function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
  }

  if (slides.length > 0) {
    if (prevBtn) {
      prevBtn.addEventListener('click', function() { prevSlide(); resetAutoSlide(); });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function() { nextSlide(); resetAutoSlide(); });
    }

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() { goToSlide(i); resetAutoSlide(); });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft')  { prevSlide(); resetAutoSlide(); }
      if (e.key === 'ArrowRight') { nextSlide(); resetAutoSlide(); }
    });

    // Touch / swipe support
    var touchStartX = 0;
    var sliderEl = document.querySelector('.hero-slider');
    if (sliderEl) {
      sliderEl.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });

      sliderEl.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
          diff > 0 ? nextSlide() : prevSlide();
          resetAutoSlide();
        }
      }, { passive: true });
    }

    startAutoSlide();
  }

  /* ── NAVBAR SCROLL + HERO TRANSPARENCY ───────────────── */
  var navbar      = document.getElementById('navbar');
  var heroSection = document.getElementById('home');

  // ✅ FIXED — only toggles .scrolled, matches new CSS logic
function handleNavScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll(); // Run immediately on page load

  /* ── MOBILE MENU ──────────────────────────────────────── */
  var hamburger = document.getElementById('hamburger');
  var navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', function() {
    navLinks.classList.toggle('open');
    var open = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', open);
    var spans = hamburger.querySelectorAll('span');
    if (open) {
      spans[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(function(s) { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  navLinks.querySelectorAll('.nav-link').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(function(s) {
        s.style.transform = '';
        s.style.opacity   = '';
      });
    });
  });

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var delay = entry.target.dataset.index
          ? (parseInt(entry.target.dataset.index) - 1) * 80
          : 0;
        setTimeout(function() {
          entry.target.classList.add('visible');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(function(el) { revealObserver.observe(el); });

  /* ── COUNTER ANIMATION ────────────────────────────────── */
  var counters = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    var target   = parseInt(el.dataset.target, 10);
    var suffix   = el.dataset.suffix || '';
    var duration = 1800;
    var step     = 16;
    var steps    = duration / step;
    var current  = 0;

    var timer = setInterval(function() {
      current += target / steps;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current) + suffix;
    }, step);
  }

  var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.textContent = '0' + (entry.target.dataset.suffix || '');
        animateCounter(entry.target);
        // unobserve line REMOVED — so it triggers every scroll
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(function(c) { statsObserver.observe(c); });

  /* ── TECH TABS ────────────────────────────────────────── */
  var techTabs   = document.querySelectorAll('.tech-tab');
  var techPanels = document.querySelectorAll('.tech-panel');

  techTabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;
      techTabs.forEach(function(t) { t.classList.remove('active'); });
      techPanels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.querySelector('.tech-panel[data-panel="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  /* ── TESTIMONIAL SLIDER ───────────────────────────────── */
  var track    = document.getElementById('testiTrack');
  var dotsWrap = document.getElementById('testiDots');
  var tPrev    = document.getElementById('testiPrev');
  var tNext    = document.getElementById('testiNext');

  if (track) {
    var cards      = track.querySelectorAll('.testi-card');
    var cardsVisible = getCardsVisible();
    var totalSlides  = Math.ceil(cards.length / cardsVisible);
    var tCurrent     = 0;
    var tAutoTimer;

    function getCardsVisible() {
      if (window.innerWidth <= 700)  return 1;
      if (window.innerWidth <= 1100) return 2;
      return 3;
    }

    function buildDots() {
      dotsWrap.innerHTML = '';
      totalSlides = Math.ceil(cards.length / cardsVisible);
      for (var i = 0; i < totalSlides; i++) {
        (function(idx) {
          var dot = document.createElement('div');
          dot.classList.add('testi-dot');
          if (idx === 0) dot.classList.add('active');
          dot.addEventListener('click', function() { tGoTo(idx); });
          dotsWrap.appendChild(dot);
        })(i);
      }
    }

    function updateDots() {
      dotsWrap.querySelectorAll('.testi-dot').forEach(function(d, i) {
        d.classList.toggle('active', i === tCurrent);
      });
    }

    function tGoTo(index) {
      tCurrent = Math.max(0, Math.min(index, totalSlides - 1));
      var cardWidth = cards[0].offsetWidth + 24;
      track.style.transform = 'translateX(-' + (tCurrent * cardsVisible * cardWidth) + 'px)';
      updateDots();
    }

    tPrev.addEventListener('click', function() {
      tGoTo(tCurrent === 0 ? totalSlides - 1 : tCurrent - 1);
      tResetAuto();
    });

    tNext.addEventListener('click', function() {
      tGoTo(tCurrent === totalSlides - 1 ? 0 : tCurrent + 1);
      tResetAuto();
    });

    function tStartAuto() {
      tAutoTimer = setInterval(function() {
        tGoTo(tCurrent === totalSlides - 1 ? 0 : tCurrent + 1);
      }, 5000);
    }

    function tResetAuto() {
      clearInterval(tAutoTimer);
      tStartAuto();
    }

    window.addEventListener('resize', function() {
      cardsVisible = getCardsVisible();
      buildDots();
      tGoTo(0);
    });

    buildDots();
    tStartAuto();
  }

  /* ── ACTIVE NAV LINK (scroll spy) ────────────────────── */
  var sections = document.querySelectorAll('section[id]');
  var navItems = document.querySelectorAll('.nav-link');

  var spyObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.id;
        navItems.forEach(function(a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(function(s) { spyObserver.observe(s); });

  /* ── CONTACT FORM ─────────────────────────────────────── */
  var form = document.getElementById('contactForm');

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn  = form.querySelector('button[type="submit"]');
      var note = form.querySelector('.form-note');

      btn.textContent = 'Sending…';
      btn.disabled    = true;

      setTimeout(function() {
        btn.textContent  = '✅ Message Sent!';
        note.textContent = "We'll get back to you within 10 minutes.";
        form.reset();

        setTimeout(function() {
          btn.textContent  = 'Send Message ↗';
          btn.disabled     = false;
          note.textContent = '✅ In just 10 min you will get a response.';
        }, 4000);
      }, 1500);
    });
  }

  /* ── SMOOTH SCROLL ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

})();