/* ============================================================
   IDEAGENSYS — script.js
============================================================ */

(function () {
  'use strict';

  /* ── LOAD HERO BACKGROUND IMAGES ──────────────────────── */
  document.querySelectorAll('.slide[data-bg]').forEach(function(slide) {
    var imgSrc = slide.getAttribute('data-bg');
    if (!imgSrc) return;
    var img = new Image();
    img.onload = function() { slide.style.backgroundImage = 'url("' + imgSrc + '")'; };
    img.onerror = function() { console.info('Hero image not found: ' + imgSrc); };
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

  function startAutoSlide() { slideInterval = setInterval(nextSlide, SLIDE_DELAY); }
  function resetAutoSlide()  { clearInterval(slideInterval); startAutoSlide(); }

  if (slides.length > 0) {
    if (prevBtn) prevBtn.addEventListener('click', function() { prevSlide(); resetAutoSlide(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { nextSlide(); resetAutoSlide(); });

    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() { goToSlide(i); resetAutoSlide(); });
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft')  { prevSlide(); resetAutoSlide(); }
      if (e.key === 'ArrowRight') { nextSlide(); resetAutoSlide(); }
    });

    var touchStartX = 0;
    var sliderEl = document.querySelector('.hero-slider');
    if (sliderEl) {
      sliderEl.addEventListener('touchstart', function(e) {
        touchStartX = e.touches[0].clientX;
      }, { passive: true });
      sliderEl.addEventListener('touchend', function(e) {
        var diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) { diff > 0 ? nextSlide() : prevSlide(); resetAutoSlide(); }
      }, { passive: true });
    }

    startAutoSlide();
  }

  /* ── NAVBAR SCROLL ────────────────────────────────────── */
  var navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 50) { navbar.classList.add('scrolled'); }
    else { navbar.classList.remove('scrolled'); }
  }
  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

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
        s.style.transform = ''; s.style.opacity = '';
      });
    });
  });

  /* ── SCROLL REVEAL ────────────────────────────────────── */
  var revealEls = document.querySelectorAll('.reveal');
  var revealObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var delay = entry.target.dataset.index ? (parseInt(entry.target.dataset.index) - 1) * 80 : 0;
        setTimeout(function() { entry.target.classList.add('visible'); }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(function(el) { revealObserver.observe(el); });

  /* ── COUNTER ANIMATION ────────────────────────────────── */
  var counters = document.querySelectorAll('.stat-number');

  function animateCounter(el) {
    var target = parseInt(el.dataset.target, 10);
    var suffix = el.dataset.suffix || '';
    var steps  = 1800 / 16;
    var current = 0;
    var timer = setInterval(function() {
      current += target / steps;
      if (current >= target) { current = target; clearInterval(timer); }
      el.textContent = Math.floor(current) + suffix;
    }, 16);
  }

  var statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.textContent = '0' + (entry.target.dataset.suffix || '');
        animateCounter(entry.target);
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
    var cards        = track.querySelectorAll('.testi-card');
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

    tPrev.addEventListener('click', function() { tGoTo(tCurrent === 0 ? totalSlides - 1 : tCurrent - 1); tResetAuto(); });
    tNext.addEventListener('click', function() { tGoTo(tCurrent === totalSlides - 1 ? 0 : tCurrent + 1); tResetAuto(); });

    function tStartAuto() { tAutoTimer = setInterval(function() { tGoTo(tCurrent === totalSlides - 1 ? 0 : tCurrent + 1); }, 5000); }
    function tResetAuto() { clearInterval(tAutoTimer); tStartAuto(); }

    window.addEventListener('resize', function() { cardsVisible = getCardsVisible(); buildDots(); tGoTo(0); });
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
        navItems.forEach(function(a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
      }
    });
  }, { threshold: 0.35 });
  sections.forEach(function(s) { spyObserver.observe(s); });

  /* ── CONTACT FORM — Web3Forms ─────────────────────────── */
  var form = document.getElementById('contactForm');

  if (form) {
    form.addEventListener('submit', async function(e) {
      e.preventDefault();

      var btn  = form.querySelector('button[type="submit"]');
      var note = form.querySelector('.form-note');

      btn.textContent = 'Sending…';
      btn.disabled    = true;

      var payload = {
        access_key:  '88e06458-e1c6-499b-bfbd-7140f961b7d3',
        subject:     'New Enquiry from IdeaGenSys Website',
        from_name:   'IdeaGenSys Website',
        name:        form.querySelector('input[type="text"]').value.trim(),
        email:       form.querySelector('input[type="email"]').value.trim(),
        phone:       form.querySelector('input[type="tel"]').value.trim() || 'Not provided',
        budget:      form.querySelector('select').value || 'Not specified',
        message:     form.querySelector('textarea').value.trim() || 'No description provided'
      };

      try {
        var res  = await fetch('https://api.web3forms.com/submit', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload)
        });
        var data = await res.json();

        if (data.success) {
          btn.textContent       = '✅ Message Sent!';
          btn.style.background  = '#22c55e';
          note.textContent      = "We'll get back to you within 10 minutes.";
          note.style.color      = '#22c55e';
          form.reset();
        } else {
          throw new Error('Failed');
        }
      } catch (err) {
        btn.textContent      = '❌ Failed. Try again.';
        btn.style.background = '#ef4444';
        note.textContent     = 'Something went wrong. Email us at ananyabganu@gmail.com';
        note.style.color     = '#ef4444';
      }

      setTimeout(function() {
        btn.textContent      = 'Send Message ↗';
        btn.style.background = '';
        btn.disabled         = false;
        note.textContent     = '✅ In just 10 min you will get a response.';
        note.style.color     = '';
      }, 4000);
    });
  }

  /* ── SMOOTH SCROLL ────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function(e) {
      var target = document.querySelector(anchor.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  /* ── DETAIL MODAL ─────────────────────────────────────── */
  var detailContent = {
    'cs-amphenol': {
      tag: 'Automation', date: '2024', client: 'Client: Digitus',
      title: 'Operational Efficiency at Amphenol FCI',
      body: `<p>Amphenol FCI's quality team was logging thousands of component barcodes by hand every shift, leading to slow turnaround and frequent transcription errors. IdeaGenSys built a secure Flutter application with native Zebra scanner integration to remove manual entry entirely.</p>
      <p>The app auto-fills product and batch fields the moment a barcode is scanned, supports role-based admin login, and exports more than 4 lakh records to Excel in a single click for audit and reporting.</p>
      <ul><li>Native Zebra hardware scanner integration</li><li>Auto-filled, validated data entry fields</li><li>Secure admin login with role management</li><li>One-click export of 4L+ records to Excel</li></ul>`
    },
    'cs-sgebiz': {
      tag: 'Integration', date: '2024', client: 'Client: SGeBIZ',
      title: 'C5 Integration for SGeBIZ',
      body: `<p>SGeBIZ needed its procurement platform to communicate reliably with the C5 system used by its enterprise customers, without disrupting existing workflows or data integrity.</p>
      <p>IdeaGenSys designed and delivered a seamless C5 integration layer that synchronizes purchase orders, supplier records, and approval workflows in near real time.</p>
      <ul><li>Real-time data sync between SGeBIZ and C5</li><li>Improved procurement compliance and audit trails</li><li>Reduced manual reconciliation effort</li><li>Stable, monitored integration pipeline</li></ul>`
    },
    'cs-iav': {
      tag: 'App Modernization', date: '2023', client: 'Client: IAV',
      title: 'App Conversion & Platform Upgrade',
      body: `<p>IAV's existing application was built on an aging framework that limited new feature development and made cross-platform support difficult.</p>
      <p>The IdeaGenSys team rebuilt the application on a modern framework, restructured the codebase for maintainability, and upgraded the underlying platform — delivering the project at a highly competitive price point.</p>
      <ul><li>Full migration to a modern application framework</li><li>Improved performance and maintainability</li><li>Zero data loss during conversion</li><li>Delivered ahead of budget expectations</li></ul>`
    },
    'cs-tbil': {
      tag: 'Platform Revamp', date: '2024', client: 'Client: Taylor Business Institute',
      title: 'TBIL Platform Revamp',
      body: `<p>Taylor Business Institute's online platform needed a structural overhaul to support more students and a smoother experience for staff and faculty.</p>
      <p>IdeaGenSys carried out a complete platform revamp — modernizing the UI, optimizing backend performance, and reworking core user journeys.</p>
      <ul><li>Modernized UI/UX across the platform</li><li>Faster page loads and backend performance</li><li>Streamlined student and staff workflows</li><li>Measurable increase in engagement</li></ul>`
    },
    'cs-warehousity': {
      tag: 'Warehouse Tech', date: '2024', client: 'Client: Warehousity',
      title: 'Warehouse Management System',
      body: `<p>Warehousity needed a single system to track inventory across multiple sites, reduce picking errors, and give managers real-time visibility into stock movement.</p>
      <p>IdeaGenSys built a custom WMS combining barcode scanning, automated inventory tracking, and live analytics dashboards — cutting warehouse errors by over 40%.</p>
      <ul><li>Multi-site inventory tracking</li><li>Barcode-based stock movement logging</li><li>Real-time analytics dashboards</li><li>40%+ reduction in warehouse errors</li></ul>`
    },
    'blog-ai': { tag: 'AI', date: 'Jun 02, 2026', title: 'The Rise of AI in Custom Software Development', body: `<p>AI is no longer a bolt-on feature — it's becoming part of how software gets designed, built, and maintained. Teams are using AI-assisted tools for code generation, automated testing, and even early-stage product ideation, compressing timelines that used to take weeks into days.</p><p>For businesses commissioning custom software, this shift means faster prototypes, more iterations within the same budget, and the ability to bake intelligent features directly into the core product.</p>` },
    'blog-digital': { tag: 'Strategy', date: 'May 28, 2026', title: 'Why Digital Transformation Is No Longer Optional', body: `<p>Legacy systems that once felt "good enough" are now the biggest source of friction for growing businesses — slow integrations, manual workarounds, and rising maintenance costs quietly eat into margins every quarter.</p><p>Digital transformation isn't about replacing everything at once. It's about identifying the systems causing the most drag and modernizing them in stages.</p>` },
    'blog-cloud': { tag: 'Cloud', date: 'May 20, 2026', title: 'Cloud Migration: A Step-by-Step Guide for Enterprises', body: `<p>A successful cloud migration starts long before any data moves — with an honest audit of current workloads, dependencies, and compliance requirements.</p><p>A phased approach works best: migrate low-risk workloads first, validate performance, then move critical systems with a tested rollback plan in place.</p>` },
    'blog-mobile': { tag: 'Mobile', date: 'May 12, 2026', title: 'Mobile App Trends to Watch in 2026', body: `<p>Mobile apps in 2026 are leaning heavily into on-device AI assistants, hyper-personalized experiences, and super-app ecosystems where a single app handles payments, messaging, bookings, and more.</p><p>For businesses planning a new app, this means designing an architecture that can support AI-driven personalization as user expectations continue to shift.</p>` },
    'blog-microservices': { tag: 'Architecture', date: 'Apr 30, 2026', title: 'Building Scalable Microservices Architecture', body: `<p>Breaking a monolith into microservices solves some problems and creates new ones — service-to-service communication, data consistency, and deployment complexity all need deliberate design from day one.</p><p>The teams that succeed start small: extract one well-bounded service at a time and invest early in observability and API contracts.</p>` },
    'blog-devops': { tag: 'DevOps', date: 'Apr 18, 2026', title: 'DevOps Best Practices for Faster, Safer Releases', body: `<p>Teams that release weekly without increasing risk share a common thread: heavy investment in automated testing and CI/CD pipelines that catch problems before they reach production.</p><p>Combining automated builds, staged deployments, and rollback-ready infrastructure turns releases from high-stress events into routine parts of the development cycle.</p>` },
    'blog-itconsulting': { tag: 'Consulting', date: 'Apr 05, 2026', title: 'How IT Consulting Drives Business Growth', body: `<p>The most expensive technology decisions are often the ones made without outside input — a platform choice that doesn't scale, an integration that locks a business into a single vendor.</p><p>Bringing in experienced IT consultants early prevents months of rework that come from decisions made without a full picture of where the business is headed.</p>` },
    'blog-flutter': { tag: 'Mobile', date: 'Mar 22, 2026', title: 'Flutter vs React Native: Which Should You Choose?', body: `<p>Both frameworks let you ship a single codebase to iOS and Android but make different trade-offs. Flutter renders its own UI layer, giving pixel-perfect consistency and strong performance for animation-heavy apps.</p><p>React Native leans on native components and a huge JavaScript ecosystem. The right choice usually comes down to your team's skills and how custom your UI needs to be.</p>` },
    'blog-cyber': { tag: 'Security', date: 'Feb 25, 2026', title: 'Top Cybersecurity Practices for Growing Businesses', body: `<p>Most breaches at growing companies come from basic gaps: unpatched dependencies, shared credentials, and overly broad access permissions that nobody revisits.</p><p>A handful of foundational practices go a long way: enforce MFA everywhere, automate patch updates, run regular access reviews, and encrypt sensitive data at rest and in transit.</p>` }
  };

  var detailModal      = document.getElementById('detailModal');
  var detailModalClose = document.getElementById('detailModalClose');
  var detailModalTag   = document.getElementById('detailModalTag');
  var detailModalDate  = document.getElementById('detailModalDate');
  var detailModalTitle = document.getElementById('detailModalTitle');
  var detailModalClient= document.getElementById('detailModalClient');
  var detailModalBody  = document.getElementById('detailModalBody');

  function openDetailModal(key) {
    var data = detailContent[key];
    if (!data || !detailModal) return;
    detailModalTag.textContent    = data.tag;
    detailModalDate.textContent   = data.date;
    detailModalTitle.textContent  = data.title;
    detailModalClient.textContent = data.client || '';
    detailModalClient.style.display = data.client ? '' : 'none';
    detailModalBody.innerHTML     = data.body;
    detailModal.classList.add('open');
    document.body.classList.add('modal-open');
  }

  function closeDetailModal() {
    detailModal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  document.querySelectorAll('[data-detail]').forEach(function(link) {
    link.addEventListener('click', function(e) { e.preventDefault(); openDetailModal(this.dataset.detail); });
  });

  if (detailModalClose) detailModalClose.addEventListener('click', closeDetailModal);

  var detailModalCta = document.querySelector('.detail-modal-cta');
  if (detailModalCta) detailModalCta.addEventListener('click', closeDetailModal);

  if (detailModal) detailModal.addEventListener('click', function(e) { if (e.target === detailModal) closeDetailModal(); });

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && detailModal && detailModal.classList.contains('open')) closeDetailModal();
  });

})();