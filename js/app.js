/**
 * Svādotsava - Core Application Logic & Interactive Features
 * ------------------------------------------------------------------
 * Renders the café experience, menu, story, gallery, opening list,
 * mobile navigation, form validation, and accessible interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
  const DATA = window.SVADOTSAVA_DATA;
  if (!DATA) {
    console.error("Svādotsava data not found. Ensure data.js is loaded first.");
    return;
  }

  // Application State
  const state = {
    activeCategory: 'all',
    currentGalleryIndex: 0
  };
  let lightboxReturnFocus = null;
  let modalReturnFocus = null;
  let modalKeydownHandler = null;

  // Initialization
  initHeader();
  renderHero(DATA.hero);
  renderAnnouncement(DATA.announcement);
  renderExperiences(DATA.experiences);
  renderStory(DATA.story);
  renderMenu(DATA.menuCategories, DATA.menuItems);
  renderMilletMarvels(DATA.milletMarvels);
  renderGallery(DATA.gallery);
  renderInnerCircle(DATA.innerCircle);
  renderContact(DATA.business);
  renderFooter(DATA.business);
  
  initScrollAnimations();
  initLightbox(DATA.gallery);
  initFormValidation();
  initThemeSwitcher();

  /* ==========================================================================
     Theme Switcher & Light/Dark Mode Logic
     ========================================================================== */
  function initThemeSwitcher() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const currentTheme = localStorage.getItem('svadotsava_theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(toggleBtn, currentTheme);

    toggleBtn?.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('svadotsava_theme', newTheme);
      updateThemeIcon(toggleBtn, newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }

  function updateThemeIcon(btn, theme) {
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️' : '🌙';
      btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`);
    }
  }

  /* ==========================================================================
     1. Navigation & Header Handlers
     ========================================================================== */
  function initHeader() {
    const header = document.querySelector('.site-header');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileNavDrawer = document.querySelector('.mobile-nav-drawer');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    // Sticky scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
      highlightActiveNavLink();
    });

    // Mobile Hamburger Toggle
    hamburgerBtn?.addEventListener('click', () => {
      const isOpen = mobileNavDrawer?.classList.contains('open');
      if (isOpen) {
        mobileNavDrawer?.classList.remove('open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
      } else {
        mobileNavDrawer?.classList.add('open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavDrawer?.classList.remove('open');
        hamburgerBtn?.setAttribute('aria-expanded', 'false');
      });
    });
  }

  function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  /* ==========================================================================
     2. Hero & Announcement Rendering
     ========================================================================== */
  function renderHero(heroData) {
    const container = document.getElementById('hero-content');
    if (!container) return;

    container.innerHTML = `
      <div class="hero-grid">
        <div class="hero-text-wrap reveal-on-scroll">
          <div class="hero-badge-wrap">
            <span class="badge badge-gold">${heroData.badge}</span>
          </div>
          <h1 class="hero-title">${heroData.title}</h1>
          <p class="hero-tagline-text">${heroData.tagline}</p>
          <h2 class="section-title" style="font-size: clamp(1.5rem, 3vw, 2.2rem); margin-bottom: 1rem;">
            ${heroData.headline}
          </h2>
          <p class="hero-intro">${heroData.intro}</p>
          <div class="hero-ctas">
            <a href="#menu" class="btn btn-primary">${heroData.primaryBtn}</a>
            <a href="#inner-circle" class="btn btn-secondary">${heroData.secondaryBtn}</a>
          </div>
        </div>
        <div class="hero-image-wrap reveal-on-scroll">
          <div class="hero-image-frame">
            <img src="${heroData.heroImage}" alt="${heroData.heroImageAlt}" loading="eager" />
          </div>
          <div class="hero-floating-card">
            <div class="hero-floating-title">Warm Café Hospitality</div>
            <div class="hero-floating-desc">Coffee, Tea, Bakes & Café Plates</div>
          </div>
        </div>
      </div>
    `;
  }

  function renderAnnouncement(annData) {
    const container = document.getElementById('announcement-wrap');
    if (!container) return;

    container.innerHTML = `
      <div class="announcement-card reveal-on-scroll">
        <div class="announcement-header">
          <div>
            <span class="badge badge-gold" style="margin-bottom: 0.5rem;">${annData.badge}</span>
            <h2 class="announcement-title">${annData.title}</h2>
          </div>
          <a href="#inner-circle" class="btn btn-gold">Join Opening Guest List</a>
        </div>
        <p style="font-size: 1.1rem; opacity: 0.9; max-width: 680px;">${annData.subtitle}</p>
        <div class="announcement-grid">
          <div class="announcement-item">
            <div class="announcement-icon">📍</div>
            <div>
              <div class="announcement-label">Location</div>
              <div class="announcement-val">${annData.locationText}</div>
            </div>
          </div>
          <div class="announcement-item">
            <div class="announcement-icon">📅</div>
            <div>
              <div class="announcement-label">Opening Timeline</div>
              <div class="announcement-val">${annData.dateText}</div>
            </div>
          </div>
          <div class="announcement-item">
            <div class="announcement-icon">✉️</div>
            <div>
              <div class="announcement-label">Inquiries</div>
              <div class="announcement-val">${annData.emailText}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     3. Experience Categories & Story
     ========================================================================== */
  function renderExperiences(experiences) {
    const grid = document.getElementById('experience-grid');
    if (!grid) return;

    grid.innerHTML = experiences.map(item => `
      <div class="experience-card reveal-on-scroll">
        <div class="experience-img-wrap">
          <img src="${item.image}" alt="${item.imageAlt}" loading="lazy" />
        </div>
        <div class="experience-content">
          <h3 class="experience-title">${item.title}</h3>
          <div class="experience-subtitle">${item.subtitle}</div>
          <p class="experience-desc">${item.description}</p>
        </div>
      </div>
    `).join('');
  }

  function renderStory(storyData) {
    const container = document.getElementById('story-content');
    if (!container) return;

    container.innerHTML = `
      <div class="story-grid">
        <div class="story-text-wrap reveal-on-scroll">
          <div class="section-tag">Philosophy & Vision</div>
          <h2 class="section-title">${storyData.title}</h2>
          <div class="story-subtitle" style="font-size: 1.25rem; font-weight: 600; color: var(--accent-muted-gold); margin-bottom: 1.25rem;">
            ${storyData.subtitle}
          </div>
          <blockquote class="story-quote">${storyData.quote}</blockquote>
          ${storyData.paragraphs.map(p => `<p class="story-text">${p}</p>`).join('')}
          <ul class="story-highlights">
            ${storyData.highlightPoints.map(pt => `
              <li class="story-highlight-item">
                <span class="story-highlight-icon">✓</span>
                <span>${pt}</span>
              </li>
            `).join('')}
          </ul>
        </div>
        <div class="story-image-wrap reveal-on-scroll">
          <div class="story-img-frame">
            <img src="${storyData.image}" alt="${storyData.imageAlt}" loading="lazy" />
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     4. Café Menu Filters
     ========================================================================== */
  function renderMenu(categories, items) {
    const filterBar = document.getElementById('menu-filter-bar');
    const menuGrid = document.getElementById('menu-grid');
    if (!filterBar || !menuGrid) return;

    filterBar.innerHTML = categories.map(cat => `
      <button
        type="button"
        role="tab"
        id="menu-tab-${cat.id}"
        class="menu-filter-btn ${cat.id === state.activeCategory ? 'active' : ''}"
        data-category="${cat.id}"
        aria-controls="menu-grid"
        aria-selected="${cat.id === state.activeCategory}"
        tabindex="${cat.id === state.activeCategory ? '0' : '-1'}">
        ${cat.label}
      </button>
    `).join('');

    const filterButtons = [...filterBar.querySelectorAll('.menu-filter-btn')];
    const activateFilter = (btn) => {
      const catId = btn.getAttribute('data-category');
      state.activeCategory = catId;

      filterButtons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
        b.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      renderMenuItems(items, catId);
    };

    filterButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => activateFilter(btn));
      btn.addEventListener('keydown', (e) => {
        let targetIndex = index;
        if (e.key === 'ArrowRight') targetIndex = (index + 1) % filterButtons.length;
        else if (e.key === 'ArrowLeft') targetIndex = (index - 1 + filterButtons.length) % filterButtons.length;
        else if (e.key === 'Home') targetIndex = 0;
        else if (e.key === 'End') targetIndex = filterButtons.length - 1;
        else return;

        e.preventDefault();
        filterButtons[targetIndex].focus();
        activateFilter(filterButtons[targetIndex]);
      });
    });

    renderMenuItems(items, 'all');
  }
  function renderMenuItems(items, categoryId) {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;
    menuGrid.setAttribute('aria-labelledby', `menu-tab-${categoryId}`);

    const categoryPriority = { coffee: 0, tea: 1, cafe: 2, desserts: 3 };
    const filteredItems = (categoryId === 'all'
      ? [...items].sort((a, b) => categoryPriority[a.category] - categoryPriority[b.category])
      : items.filter(item => item.category === categoryId));

    menuGrid.innerHTML = filteredItems.map(item => `
      <div class="menu-card reveal-on-scroll">
        <div class="menu-card-img-wrap">
          <img src="${item.image}" alt="${item.imageAlt}" loading="lazy" />
        </div>
        <div class="menu-card-body">
          <div class="menu-card-header">
            <h3 class="menu-card-title">${item.name}</h3>
            <span class="menu-card-price">${item.priceDisplay}</span>
          </div>
          <p class="menu-card-desc">${item.description}</p>
          <div class="menu-card-badges">
            ${(item.badges || []).map(b => `<span class="badge badge-forest">${b}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Trigger scroll reveal update for newly rendered menu items
    initScrollAnimations();
  }

  /* ==========================================================================
     5. Millet Café Collection
     ========================================================================== */
  function renderMilletMarvels(milletData) {
    const container = document.getElementById('millet-content');
    if (!container) return;

    container.innerHTML = `
      <div class="millet-heading">
        <div>
          <div class="section-tag">Café Grain Collection</div>
          <h2 class="section-title">${milletData.heading}</h2>
          <p class="section-subtitle">${milletData.subheading}</p>
          <p class="millet-intro">${milletData.intro}</p>
        </div>
        <img class="millet-hero-image" src="${milletData.image}" alt="${milletData.imageAlt}" loading="lazy" />
      </div>
      <div class="millet-cards-grid">
        ${milletData.cards.map(card => `
          <article class="millet-card reveal-on-scroll">
            <img class="millet-card-image" src="${card.image}" alt="${card.imageAlt}" loading="lazy" />
            <div class="millet-card-body">
              <div class="millet-card-icon" aria-hidden="true">${card.icon}</div>
              <h3 class="millet-card-title">${card.grain}</h3>
              <p class="millet-card-benefit">${card.benefit}</p>
              <span class="millet-card-dish">${card.dishPreview}</span>
            </div>
          </article>
        `).join('')}
      </div>
      <div class="millet-sourcing-banner reveal-on-scroll">${milletData.sourcingNote}</div>
    `;
  }

  /* ==========================================================================
     6. Café Gallery & Fullscreen Lightbox
     ========================================================================== */
  function renderGallery(galleryData) {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    grid.innerHTML = galleryData.map((item, index) => `
      <div class="gallery-item reveal-on-scroll" data-index="${index}" tabindex="0" role="button" aria-label="View ${item.title}">
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
        <div class="gallery-overlay">
          <span class="gallery-category">${item.category}</span>
          <h3 class="gallery-title">${item.title}</h3>
        </div>
      </div>
    `).join('');

    grid.querySelectorAll('.gallery-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
        openLightbox(idx, galleryData);
      });
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const idx = parseInt(e.currentTarget.getAttribute('data-index'), 10);
          openLightbox(idx, galleryData);
        }
      });
    });
  }

  function initLightbox(galleryData) {
    const modal = document.getElementById('lightbox-modal');
    const closeBtn = document.getElementById('lightbox-close-btn');
    const prevBtn = document.getElementById('lightbox-prev-btn');
    const nextBtn = document.getElementById('lightbox-next-btn');

    closeBtn?.addEventListener('click', closeLightbox);
    prevBtn?.addEventListener('click', () => {
      state.currentGalleryIndex = (state.currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
      updateLightboxContent(galleryData);
    });

    nextBtn?.addEventListener('click', () => {
      state.currentGalleryIndex = (state.currentGalleryIndex + 1) % galleryData.length;
      updateLightboxContent(galleryData);
    });

    modal?.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (!modal?.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'Tab') trapFocus(e, modal);
      if (e.key === 'ArrowLeft') {
        state.currentGalleryIndex = (state.currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
        updateLightboxContent(galleryData);
      }
      if (e.key === 'ArrowRight') {
        state.currentGalleryIndex = (state.currentGalleryIndex + 1) % galleryData.length;
        updateLightboxContent(galleryData);
      }
    });
  }

  function openLightbox(index, galleryData) {
    state.currentGalleryIndex = index;
    const modal = document.getElementById('lightbox-modal');
    lightboxReturnFocus = document.activeElement;
    updateLightboxContent(galleryData);
    modal?.classList.add('open');
    document.getElementById('lightbox-close-btn')?.focus();
  }

  function updateLightboxContent(galleryData) {
    const item = galleryData[state.currentGalleryIndex];
    const img = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');

    if (img) {
      img.src = item.image;
      img.alt = item.title;
    }
    if (caption) {
      caption.innerHTML = `<strong>${item.title}</strong> — ${item.caption}`;
    }
  }

  function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    modal?.classList.remove('open');
    if (lightboxReturnFocus instanceof HTMLElement) lightboxReturnFocus.focus();
    lightboxReturnFocus = null;
  }

  /* ==========================================================================
     10. Inner Circle Form & Validation
     ========================================================================== */
  function renderInnerCircle(circleData) {
    const container = document.getElementById('inner-circle-content');
    if (!container) return;

    container.innerHTML = `
      <div class="inner-circle-card reveal-on-scroll">
        <div style="text-align: center;">
          <span class="badge badge-gold" style="margin-bottom: 0.75rem;">Exclusive Preview Access</span>
          <h2 class="section-title" style="margin-bottom: 0.5rem;">${circleData.title}</h2>
          <p class="section-subtitle" style="margin: 0 auto 2rem; max-width: 580px;">${circleData.subtitle}</p>
        </div>

        <form id="inner-circle-form" novalidate>
          <div class="form-grid">
            <div class="form-group">
              <label for="ic-name" class="form-label">Full Name *</label>
              <input type="text" id="ic-name" class="form-input" placeholder="e.g. Dhruthi Reddy" required />
              <div class="form-error-msg" id="err-ic-name">Please enter your full name.</div>
            </div>

            <div class="form-group">
              <label for="ic-email" class="form-label">Email Address *</label>
              <input type="email" id="ic-email" class="form-input" placeholder="name@example.com" required />
              <div class="form-error-msg" id="err-ic-email">Please enter a valid email address.</div>
            </div>

            <div class="form-group full-width">
              <label for="ic-city" class="form-label">Your Area or City *</label>
              <input type="text" id="ic-city" class="form-input" placeholder="e.g. Bengaluru, Singapore, Chennai" required />
              <div class="form-error-msg" id="err-ic-city">Please provide your location.</div>
            </div>

            <div class="form-group full-width">
              <label class="form-label">What interests you most? (Select all that apply)</label>
              <div class="checkbox-group">
                ${circleData.foodInterests.map(interest => `
                  <label class="checkbox-label">
                    <input type="checkbox" name="interests" value="${interest.id}" />
                    <span>${interest.label}</span>
                  </label>
                `).join('')}
              </div>
            </div>

            <div class="form-group full-width">
              <label class="checkbox-label" style="align-items: flex-start;">
                <input type="checkbox" id="ic-consent" required style="margin-top: 4px;" />
                <span>I agree to receive opening updates, event invitations, and story letters from Svādotsava. I understand I can unsubscribe anytime.</span>
              </label>
              <div class="form-error-msg" id="err-ic-consent">Please accept the consent terms to proceed.</div>
            </div>

            <div class="form-group full-width" style="margin-top: 1rem; text-align: center;">
              <button type="submit" class="btn btn-primary" style="width: 100%; max-width: 320px; margin: 0 auto;">
                Check My Opening Request
              </button>
            </div>
          </div>
        </form>
      </div>
    `;
  }

  function initFormValidation() {
    const form = document.getElementById('inner-circle-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;

      const nameInput = document.getElementById('ic-name');
      const emailInput = document.getElementById('ic-email');
      const cityInput = document.getElementById('ic-city');
      const consentInput = document.getElementById('ic-consent');

      // Reset errors
      document.querySelectorAll('.form-error-msg').forEach(el => el.style.display = 'none');

      if (!nameInput.value.trim()) {
        document.getElementById('err-ic-name').style.display = 'block';
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        document.getElementById('err-ic-email').style.display = 'block';
        isValid = false;
      }

      if (!cityInput.value.trim()) {
        document.getElementById('err-ic-city').style.display = 'block';
        isValid = false;
      }

      if (!consentInput.checked) {
        document.getElementById('err-ic-consent').style.display = 'block';
        isValid = false;
      }

      if (isValid) {
        showModal(
          "Your request is ready",
          `Thank you, ${nameInput.value.trim()}! This GitHub Pages preview does not save submissions yet. Please email ${DATA.business.email} to join the opening list.`,
          "✉️"
        );
      }
    });
  }

  /* ==========================================================================
     11. Contact & Footer Rendering
     ========================================================================== */
  function renderContact(biz) {
    const grid = document.getElementById('contact-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="contact-card reveal-on-scroll">
        <div class="contact-card-icon">📍</div>
        <h3 class="contact-card-title">Location</h3>
        <div class="contact-card-val">${biz.location}</div>
        <div class="contact-card-sub">${biz.address}</div>
      </div>

      <div class="contact-card reveal-on-scroll">
        <div class="contact-card-icon">📅</div>
        <h3 class="contact-card-title">Opening Status</h3>
        <div class="contact-card-val">${biz.openingStatus}</div>
        <div class="contact-card-sub">${biz.exactDate}</div>
      </div>

      <div class="contact-card reveal-on-scroll">
        <div class="contact-card-icon">✉️</div>
        <h3 class="contact-card-title">Email Inquiries</h3>
        <div class="contact-card-val"><a href="mailto:${biz.email}">${biz.email}</a></div>
        <div class="contact-card-sub">General & media inquiries</div>
      </div>

      <div class="contact-card reveal-on-scroll">
        <div class="contact-card-icon">📷</div>
        <h3 class="contact-card-title">Instagram</h3>
        <div class="contact-card-val">
          <a href="${biz.instagramUrl}" target="_blank" rel="noopener noreferrer">${biz.instagramHandle}</a>
        </div>
        <div class="contact-card-sub">Follow our opening journey</div>
      </div>
    `;
  }

  function renderFooter(biz) {
    const container = document.getElementById('footer-content');
    if (!container) return;

    container.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand-title">${biz.name}</div>
          <div class="brand-tagline">${biz.tagline}</div>
          <p class="footer-brand-desc">
            A celebration of handcrafted coffee, fragrant tea, fresh bakes, café plates, and warm hospitality.
          </p>
        </div>

        <div>
          <h4 class="footer-title">Navigation</h4>
          <ul class="footer-links">
            <li><a href="#hero" class="footer-link">Home</a></li>
            <li><a href="#experience" class="footer-link">Experiences</a></li>
            <li><a href="#story" class="footer-link">Our Story</a></li>
            <li><a href="#menu" class="footer-link">Café Menu</a></li>
            <li><a href="#millet-marvels" class="footer-link">Millet Marvels</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-title">Café</h4>
          <ul class="footer-links">
            <li><a href="#gallery" class="footer-link">Gallery</a></li>
            <li><a href="#inner-circle" class="footer-link">Inner Circle</a></li>
            <li><button type="button" class="footer-link footer-tree-link" id="footer-community-tree-link">Community Tree</button></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-title">Connect & Visit</h4>
          <ul class="footer-links">
            <li><a href="mailto:${biz.email}" class="footer-link">${biz.email}</a></li>
            <li><a href="${biz.instagramUrl}" target="_blank" rel="noopener" class="footer-link">${biz.instagramHandle}</a></li>
            <li><span class="footer-link">${biz.location} — ${biz.openingStatus}</span></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <div>
          © ${new Date().getFullYear()} ${biz.name}. All rights reserved. •
          <a href="#" class="footer-link" id="privacy-link" style="margin-left: 0.5rem;">Privacy Policy</a> •
          <a href="#" class="footer-link" id="terms-link" style="margin-left: 0.5rem;">Terms & Conditions</a>
        </div>
        <button class="back-to-top-btn" id="back-to-top-btn">
          <span>Back to top</span> ↑
        </button>
      </div>
    `;

    document.getElementById('back-to-top-btn')?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.getElementById('footer-community-tree-link')?.addEventListener('click', () => {
      window.SvadotsavaCommunityTree?.open();
    });

    document.getElementById('privacy-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      showModal("Privacy Policy Notice", "Svādotsava uses no personal tracking cookies. This GitHub Pages preview does not store opening-list submissions or Community Tree order data; all tree names shown are fictional samples.", "🔒");
    });

    document.getElementById('terms-link')?.addEventListener('click', (e) => {
      e.preventDefault();
      showModal("Terms & Conditions Notice", "Website content, menus, and timelines represent draft preview details prior to our Summer 2027 opening.", "📜");
    });
  }

  /* ==========================================================================
     12. Helpers (Modal, Toast, Scroll Animations)
     ========================================================================== */
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
  }

  function showModal(title, desc, icon = '✨') {
    const overlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalIcon = document.getElementById('modal-icon');
    const closeBtn = document.getElementById('modal-close-btn');

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalIcon) modalIcon.textContent = icon;

    modalReturnFocus = document.activeElement;
    overlay?.classList.add('open');
    closeBtn?.focus();

    const closeModal = () => {
      overlay?.classList.remove('open');
      if (modalKeydownHandler) document.removeEventListener('keydown', modalKeydownHandler);
      if (modalReturnFocus instanceof HTMLElement) modalReturnFocus.focus();
      modalReturnFocus = null;
      modalKeydownHandler = null;
    };

    if (modalKeydownHandler) document.removeEventListener('keydown', modalKeydownHandler);
    modalKeydownHandler = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab' && overlay) trapFocus(e, overlay);
    };
    document.addEventListener('keydown', modalKeydownHandler);

    if (closeBtn) closeBtn.onclick = closeModal;
    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
      };
    }
  }

  function trapFocus(event, container) {
    const focusable = [...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.hasAttribute('hidden'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
  function showToast(message) {
    const toast = document.getElementById('toast-msg');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }
});
