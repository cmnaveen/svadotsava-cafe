/**
 * Svādotsava - Core Application Logic & Interactive Features
 * ------------------------------------------------------------------
 * Renders the café and restaurant experience:
 * 1. Hero Introduction
 * 2. The Café Menu (Beverages, Sourdough Pizzas, Artisanal Toasts & Bakes)
 * 3. The Millet Menu (Heritage Dosas, Chutney Trinity & Ancient Grain Laddus)
 * 4. Our Story, Living Craft & Sanctuary Spaces
 * 5. Atmosphere & Gallery
 * 6. Visit Sanctuary, Opening Status & Opening Guest List
 */

document.addEventListener('DOMContentLoaded', () => {
  const DATA = window.SVADOTSAVA_DATA;
  if (!DATA) {
    console.error("Svādotsava data not found. Ensure data files are loaded first.");
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
  renderMenu(DATA.menuCategories, DATA.menuItems);
  renderMilletMarvels(DATA.milletMarvels);
  renderStory(DATA.story, DATA.signatureSpotlight, DATA.craftProcess, DATA.experiences);
  renderGallery(DATA.gallery);
  renderVisitSanctuary(DATA.visitSanctuary, DATA.announcement, DATA.innerCircle, DATA.business);
  renderFooter(DATA.business);
  
  initScrollAnimations();
  initLightbox(DATA.gallery);
  initFormValidation();
  initThemeSwitcher();
  initHashHandling();

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

    const openDrawer = () => {
      mobileNavDrawer?.classList.add('open');
      hamburgerBtn?.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      const firstLink = mobileNavDrawer?.querySelector('a');
      firstLink?.focus();
    };

    const closeDrawer = () => {
      if (!mobileNavDrawer?.classList.contains('open')) return;
      mobileNavDrawer.classList.remove('open');
      hamburgerBtn?.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburgerBtn?.focus();
    };

    // Sticky scroll effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
      highlightActiveNavLink();
    }, { passive: true });

    // Initial check on load
    highlightActiveNavLink();

    // Mobile Hamburger Toggle
    hamburgerBtn?.addEventListener('click', () => {
      if (mobileNavDrawer?.classList.contains('open')) {
        closeDrawer();
      } else {
        openDrawer();
      }
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeDrawer();
      });
    });

    // Close on Escape or trap focus inside mobile drawer
    document.addEventListener('keydown', (e) => {
      if (mobileNavDrawer?.classList.contains('open')) {
        if (e.key === 'Escape') closeDrawer();
        if (e.key === 'Tab') trapFocus(e, mobileNavDrawer);
      }
    });
  }

  function highlightActiveNavLink() {
    const scrollPos = (window.scrollY || window.pageYOffset || 0) + 160;
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    const sectionIds = ['hero', 'menu', 'millet-marvels', 'story', 'gallery', 'visit'];
    const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return;

    let currentSectionId = '';
    for (const section of sections) {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
        break;
      }
    }

    if (window.scrollY < 80) {
      currentSectionId = 'hero';
    } else if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 50)) {
      currentSectionId = 'visit';
    }

    if (!currentSectionId) return;

    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === `#${currentSectionId}`;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });

    mobileLinks.forEach(link => {
      const href = link.getAttribute('href');
      const isMobileActive = href === `#${currentSectionId}`;
      link.classList.toggle('active', isMobileActive);
    });
  }

  /* ==========================================================================
     2. Hero Rendering
     ========================================================================== */
  function renderHero(heroData) {
    const container = document.getElementById('hero-content');
    if (!container || !heroData) return;

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
            <a href="#menu" class="btn btn-primary">${heroData.primaryBtn || 'Explore Café Menu'}</a>
            <a href="#millet-marvels" class="btn btn-secondary">Millet Menu</a>
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
      <a class="scroll-cue" href="#menu" aria-label="Scroll to café menu">
        <span class="scroll-cue-dot" aria-hidden="true"></span>
      </a>
    `;
  }

  /* ==========================================================================
     3. Café Menu Rendering (Coffee, Tea, Pizzas, Toasts, Bowls & Bakes)
     ========================================================================== */
  function renderMenu(categories, items) {
    const container = document.getElementById('menu-content-wrap');
    if (!container) return;

    // Filter categories to relevant café offerings
    const cafeCategories = categories.filter(c => c.id !== 'millets');

    container.innerHTML = `
      <div style="text-align: center;">
        <div class="section-tag" style="justify-content: center;">Opening Café Collection</div>
        <h2 class="section-title">The Café Menu</h2>
        <p class="section-subtitle" style="margin: 0 auto 2rem; max-width: 650px;">
          Specialty coffee, fragrant estate teas, sourdough pizzas, artisanal toasts, and thoughtful café plates.
        </p>
      </div>

      <!-- Live Search Bar -->
      <div class="menu-search-wrap">
        <span class="menu-search-icon" aria-hidden="true">🔍</span>
        <input type="search" id="menu-search-input" class="menu-search-input" placeholder="Search coffee, tea, pizzas, toasts, bowls..." aria-label="Search café menu items" />
        <button type="button" id="menu-search-clear" class="menu-search-clear" aria-label="Clear search" style="display: none;">✕</button>
      </div>

      <!-- Category Filter Pills -->
      <div class="menu-filter-bar" id="menu-filter-bar" role="tablist" aria-label="Café Menu Category Filters">
        ${cafeCategories.map(cat => `
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
        `).join('')}
      </div>

      <!-- Menu Items Grid -->
      <div class="menu-grid" id="menu-grid" role="tabpanel" aria-live="polite" aria-labelledby="menu-tab-all" tabindex="0">
        <!-- Rendered dynamically -->
      </div>

      <div class="menu-notice-box">
        ☕ <strong>Opening Menu:</strong> Final café prices will be announced closer to our Summer 2029 opening and listed in Indian Rupees (₹).
      </div>
    `;

    const filterBar = document.getElementById('menu-filter-bar');
    const searchInput = document.getElementById('menu-search-input');
    const searchClear = document.getElementById('menu-search-clear');
    const filterButtons = [...filterBar.querySelectorAll('.menu-filter-btn')];

    let currentSearchQuery = '';

    const applyFilters = () => {
      renderMenuItems(items, state.activeCategory, currentSearchQuery);
      if (searchClear) {
        searchClear.style.display = currentSearchQuery.trim() ? 'block' : 'none';
      }
    };

    const activateFilter = (btn) => {
      const catId = btn.getAttribute('data-category');
      state.activeCategory = catId;

      filterButtons.forEach(b => {
        const isActive = b === btn;
        b.classList.toggle('active', isActive);
        b.setAttribute('aria-selected', String(isActive));
        b.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      applyFilters();
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

    searchInput?.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });

    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      currentSearchQuery = '';
      applyFilters();
      searchInput.focus();
    });

    renderMenuItems(items, state.activeCategory, '');
  }

  function renderMenuItems(items, categoryId, query = '') {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;
    menuGrid.setAttribute('aria-labelledby', `menu-tab-${categoryId}`);

    const categoryPriority = { coffee: 0, tea: 1, cafe: 2, desserts: 3 };

    // Filter out millet items so they remain exclusively featured in the Millet Menu section
    let cafeItems = items.filter(it => it.category !== 'millets');

    let filtered = (categoryId === 'all'
      ? [...cafeItems].sort((a, b) => (categoryPriority[a.category] ?? 9) - (categoryPriority[b.category] ?? 9))
      : cafeItems.filter(item => item.category === categoryId));

    if (query) {
      filtered = filtered.filter(item => {
        const nameMatch = item.name.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const badgeMatch = (item.badges || []).some(b => b.toLowerCase().includes(query));
        return nameMatch || descMatch || badgeMatch;
      });
    }

    if (filtered.length === 0) {
      menuGrid.innerHTML = `
        <div class="menu-empty-state" style="grid-column: 1 / -1;">
          <div class="menu-empty-icon" aria-hidden="true">🍽️</div>
          <h3>No dishes found</h3>
          <p>We couldn't find any café items matching "${query}". Try searching for another item or clear the filter.</p>
          <button type="button" class="btn btn-secondary btn-sm" id="btn-clear-search-empty">
            Clear Search Filter
          </button>
        </div>
      `;
      document.getElementById('btn-clear-search-empty')?.addEventListener('click', () => {
        const input = document.getElementById('menu-search-input');
        if (input) input.value = '';
        const searchClear = document.getElementById('menu-search-clear');
        if (searchClear) searchClear.style.display = 'none';
        renderMenuItems(items, categoryId, '');
      });
      return;
    }

    menuGrid.innerHTML = filtered.map(item => `
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
          ${item.hasRecipe ? `
            <button type="button" class="btn-recipe-trigger" data-recipe-id="${item.recipeId}" data-variant-id="${item.id}">
              View Recipe 📖
            </button>
          ` : ''}
        </div>
      </div>
    `).join('');

    initScrollAnimations();
  }

  /* ==========================================================================
     4. Millet Menu Rendering (Dosa Collection, Chutney Trinity & Laddus)
     ========================================================================== */
  function renderMilletMarvels(milletData) {
    const container = document.getElementById('millet-content');
    if (!container || !milletData) return;

    const dosaFeat = milletData.dosaFeature;

    container.innerHTML = `
      <div class="millet-heading">
        <div>
          <div class="section-tag">Heritage Grain Collection</div>
          <h2 class="section-title">The Millet Menu</h2>
          <p class="section-subtitle">${milletData.subheading || 'Cast-Iron Dosas, Stone-Ground Chutney Trinity & Heritage Treats'}</p>
          <p class="millet-intro">${milletData.intro}</p>
        </div>
        <img class="millet-hero-image" src="${milletData.image}" alt="${milletData.imageAlt}" loading="lazy" />
      </div>

      ${dosaFeat ? `
        <div class="millet-dosa-showcase reveal-on-scroll">
          <div class="millet-dosa-grid">
            <div class="millet-dosa-media">
              <figure class="millet-dosa-figure">
                <img src="${dosaFeat.image}" alt="${dosaFeat.imageAlt}" loading="lazy" />
                <figcaption class="millet-dosa-badge">${dosaFeat.badge}</figcaption>
              </figure>

              <!-- The Chutney Trinity Card -->
              <div class="chutney-trinity-card">
                <div class="chutney-trinity-header">
                  <span class="chutney-header-icon" aria-hidden="true">🥣</span>
                  <div>
                    <h4 class="chutney-trinity-title">${dosaFeat.chutneysTitle || 'The Chutney Trinity'}</h4>
                    <p class="chutney-trinity-sub">Ground fresh daily in small stone batches</p>
                  </div>
                </div>
                <div class="chutney-trinity-grid">
                  ${(dosaFeat.chutneys || []).map(ch => `
                    <div class="chutney-item">
                      <div class="chutney-icon-wrap" aria-hidden="true">${ch.icon}</div>
                      <div class="chutney-text">
                        <strong class="chutney-name">${ch.name}</strong>
                        <span class="chutney-label">${ch.label}</span>
                        <p class="chutney-desc">${ch.description}</p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="millet-dosa-content">
              <div class="section-kicker">Cast-Iron Heritage Crepes</div>
              <h3 class="millet-dosa-title">${dosaFeat.title}</h3>
              <p class="millet-dosa-subtitle">${dosaFeat.subtitle}</p>
              <p class="millet-dosa-desc">${dosaFeat.description}</p>

              <div class="dosa-varieties-list">
                ${(dosaFeat.dosas || []).map(dosa => `
                  <div class="dosa-variety-card">
                    ${dosa.image ? `
                      <div class="dosa-variety-thumb-wrap">
                        <img src="${dosa.image}" alt="${dosa.name}" class="dosa-variety-thumb" loading="lazy" />
                      </div>
                    ` : ''}
                    <div class="dosa-variety-info">
                      <div class="dosa-variety-header">
                        <div>
                          <h4 class="dosa-variety-name">${dosa.name}</h4>
                          <span class="dosa-grains-tag">🌾 ${dosa.grains}</span>
                        </div>
                        <span class="badge badge-gold-sm">${dosa.type}</span>
                      </div>
                      <p class="dosa-variety-desc">${dosa.description}</p>
                      <div class="dosa-accompaniment">
                        <span class="dosa-acc-icon">✨</span>
                        <span><strong>Accompaniment:</strong> ${dosa.servedWith}</span>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Traditional Heritage Laddus -->
      <div class="millet-sub-heading reveal-on-scroll" style="margin-top: 4.5rem;">
        <div class="section-tag" style="justify-content: center;">Traditional Heritage Confections</div>
        <h3 class="section-title" style="font-size: clamp(1.4rem, 2.5vw, 2rem); margin-bottom: 0.5rem; text-align: center;">
          Heritage Millet Laddus & Treats
        </h3>
        <p class="section-subtitle" style="margin: 0 auto 2.5rem; text-align: center; max-width: 600px;">
          Wholesome palm jaggery laddus and traditional confectionery hand-rolled with pure desi ghee and heirloom grains.
        </p>
      </div>

      <div class="millet-cards-grid">
        ${(milletData.cards || []).filter(c => !c.grain.toLowerCase().includes('dosa') && !c.grain.toLowerCase().includes('cookie') && !c.grain.toLowerCase().includes('biscuit')).map(card => `
          <article class="millet-card reveal-on-scroll">
            <img class="millet-card-image" src="${card.image}" alt="${card.imageAlt}" loading="lazy" />
            <div class="millet-card-body">
              <div class="millet-card-header">
                <span class="millet-card-icon" aria-hidden="true">${card.icon}</span>
                <span class="millet-dish-tag">${card.dishPreview}</span>
              </div>
              <h4 class="millet-card-title">${card.grain}</h4>
              <p class="millet-card-desc">${card.benefit}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  /* ==========================================================================
     5. Our Story, Living Craft & Spaces
     ========================================================================== */
  function renderStory(storyData, spotlightData, processData, experiences) {
    const container = document.getElementById('story-content');
    if (!container || !storyData) return;

    container.innerHTML = `
      <div class="story-wrapper">
        <!-- 1. Philosophy & Vision -->
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

        <!-- 2. Signature Craft Coffee Spotlight -->
        ${spotlightData ? `
          <div class="story-sub-block" id="signature-spotlight-block">
            <div class="signature-spotlight-grid">
              <div class="signature-image-col reveal-on-scroll">
                <figure class="signature-figure">
                  <img src="${spotlightData.image}" alt="${spotlightData.imageAlt}" loading="lazy" />
                  <figcaption class="signature-badge">Craft Pour · Brass Filter</figcaption>
                </figure>
              </div>
              <div class="signature-copy-col reveal-on-scroll">
                <div class="section-kicker">${spotlightData.kicker}</div>
                <h3 class="section-title signature-title">${spotlightData.title}</h3>
                <p class="signature-desc">${spotlightData.description}</p>
                <dl class="tasting-notes-grid" aria-label="Signature coffee tasting notes">
                  ${(spotlightData.tastingNotes || []).map(note => `
                    <div class="tasting-note-item">
                      <dt class="tasting-note-label">${note.dt}</dt>
                      <dd class="tasting-note-val">${note.dd}</dd>
                    </div>
                  `).join('')}
                </dl>
                <div class="signature-actions">
                  <a href="#menu" class="btn btn-primary">${spotlightData.primaryBtn || 'Explore Café Menu'}</a>
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 3. Our 4-Step Heritage Craft Process -->
        ${processData ? `
          <div class="story-sub-block" id="craft-process-block">
            <div class="craft-process-grid">
              <div class="craft-process-art-col reveal-on-scroll">
                <div class="craft-process-art-frame">
                  <img src="${processData.image}" alt="${processData.imageAlt}" loading="lazy" />
                </div>
                <div class="craft-process-quote">
                  “Patience turns shade-grown beans and heirloom grains into celebrated everyday rituals.”
                </div>
              </div>
              <div class="craft-process-copy-col reveal-on-scroll">
                <div class="section-kicker">${processData.kicker}</div>
                <h3 class="section-title craft-process-title">${processData.title}</h3>
                <ol class="craft-process-steps">
                  ${(processData.steps || []).map(st => `
                    <li class="craft-step-item">
                      <span class="craft-step-number" aria-hidden="true">${st.step}</span>
                      <div class="craft-step-body">
                        <h4 class="craft-step-title">${st.title}</h4>
                        <p class="craft-step-desc">${st.description}</p>
                      </div>
                    </li>
                  `).join('')}
                </ol>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 4. Sanctuary Spaces & Experience -->
        ${experiences && experiences.length ? `
          <div class="story-sub-block" id="experience-block">
            <div style="text-align: center; margin-bottom: 3rem;">
              <div class="section-tag" style="justify-content: center;">Atmosphere & Spaces</div>
              <h3 class="section-title">The Svādotsava Experience</h3>
              <p class="section-subtitle" style="margin: 0 auto; max-width: 600px;">
                Spaces crafted with living flora, natural light, terracotta warmth, and quiet community connection.
              </p>
            </div>
            <div class="experience-grid">
              ${experiences.map(item => `
                <div class="experience-card reveal-on-scroll">
                  <div class="experience-img-wrap">
                    <img src="${item.image}" alt="${item.imageAlt}" loading="lazy" />
                  </div>
                  <div class="experience-content">
                    <h4 class="experience-title">${item.title}</h4>
                    <div class="experience-subtitle">${item.subtitle}</div>
                    <p class="experience-desc">${item.description}</p>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /* ==========================================================================
     6. Gallery Rendering & Lightbox
     ========================================================================== */
  function renderGallery(galleryData) {
    const grid = document.getElementById('gallery-grid');
    if (!grid || !galleryData) return;

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
     7. Visit Us, Opening Status & Guest List RSVP
     ========================================================================== */
  function renderVisitSanctuary(visitData, annData, circleData, bizData) {
    const container = document.getElementById('visit-content');
    if (!container || !visitData) return;

    container.innerHTML = `
      <div class="visit-wrapper">
        <!-- Opening Status Banner -->
        ${annData ? `
          <div class="announcement-card reveal-on-scroll" style="margin-bottom: 3.5rem;">
            <div class="announcement-header">
              <div>
                <span class="badge badge-gold" style="margin-bottom: 0.5rem;">${annData.badge}</span>
                <h2 class="announcement-title">${annData.title}</h2>
              </div>
              <a href="#visit-rsvp" class="btn btn-gold">Join Opening Guest List</a>
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
        ` : ''}

        <!-- Main Visit & RSVP Split Grid -->
        <div class="visit-split-grid">
          <!-- Left Column: Sanctuary & Visit Details -->
          <div class="visit-info-card reveal-on-scroll">
            <div class="section-tag">Sanctuary & Hours</div>
            <h3 class="section-title" style="font-size: clamp(1.4rem, 2.5vw, 1.95rem); margin-bottom: 1rem;">
              Plan Your Sanctuary Visit
            </h3>
            <p style="color: var(--text-medium); margin-bottom: 1.5rem; line-height: 1.6;">
              Designed as an urban sanctuary filled with endemic flora, terracotta warmth, and quiet natural light, Svādotsava welcomes you for leisurely filter coffee, crisp millet dosas, and nourishing plates.
            </p>

            <div class="visit-detail-list">
              <div class="visit-detail-item">
                <span class="visit-detail-icon">📍</span>
                <div>
                  <strong>Location & Region</strong>
                  <p>${bizData.location} · ${bizData.address}</p>
                </div>
              </div>
              <div class="visit-detail-item">
                <span class="visit-detail-icon">⏱️</span>
                <div>
                  <strong>Projected Café Hours</strong>
                  <p>Tuesday – Sunday: 7:00 AM – 10:30 PM (Mondays closed for Roastery craft)</p>
                </div>
              </div>
              <div class="visit-detail-item">
                <span class="visit-detail-icon">✉️</span>
                <div>
                  <strong>General & Media Inquiries</strong>
                  <p><a href="mailto:${bizData.email}">${bizData.email}</a></p>
                </div>
              </div>
              <div class="visit-detail-item">
                <span class="visit-detail-icon">📷</span>
                <div>
                  <strong>Opening Journey & Stories</strong>
                  <p><a href="${bizData.instagramUrl}" target="_blank" rel="noopener noreferrer">${bizData.instagramHandle}</a></p>
                </div>
              </div>
            </div>

            <div class="sanctuary-highlights-chips">
              <span class="chip">🌿 Pet-Friendly Courtyard</span>
              <span class="chip">🚲 Bicycle Parking</span>
              <span class="chip">⚡ High-Speed Wi-Fi Workspaces</span>
              <span class="chip">🌱 100% Organic Waste Composted</span>
            </div>
          </div>

          <!-- Right Column: Opening Guest List (Inner Circle) Form -->
          <div class="inner-circle-card reveal-on-scroll" id="visit-rsvp">
            <div>
              <span class="badge badge-gold" style="margin-bottom: 0.75rem;">Exclusive Preview Access</span>
              <h3 class="section-title" style="font-size: clamp(1.35rem, 2.3vw, 1.85rem); margin-bottom: 0.5rem;">${circleData.title}</h3>
              <p class="section-subtitle" style="margin: 0 0 1.5rem; max-width: 500px;">${circleData.subtitle}</p>
            </div>

            <form id="inner-circle-form" novalidate>
              <div class="form-grid">
                <div class="form-group">
                  <label for="ic-name" class="form-label">Full Name *</label>
                  <input type="text" id="ic-name" class="form-input" placeholder="e.g. Dhruthi Reddy" required aria-required="true" aria-describedby="err-ic-name" />
                  <div class="form-error-msg" id="err-ic-name" role="alert">Please enter your full name.</div>
                </div>

                <div class="form-group">
                  <label for="ic-email" class="form-label">Email Address *</label>
                  <input type="email" id="ic-email" class="form-input" placeholder="name@example.com" required aria-required="true" aria-describedby="err-ic-email" />
                  <div class="form-error-msg" id="err-ic-email" role="alert">Please enter a valid email address.</div>
                </div>

                <div class="form-group full-width">
                  <label for="ic-city" class="form-label">Your Area or City *</label>
                  <input type="text" id="ic-city" class="form-input" placeholder="e.g. Bengaluru, Singapore, Chennai" required aria-required="true" aria-describedby="err-ic-city" />
                  <div class="form-error-msg" id="err-ic-city" role="alert">Please provide your location.</div>
                </div>

                <div class="form-group full-width">
                  <label class="form-label">What interests you most? (Select all that apply)</label>
                  <div class="checkbox-group">
                    ${(circleData.foodInterests || []).map(interest => `
                      <label class="checkbox-label">
                        <input type="checkbox" name="interests" value="${interest.id}" />
                        <span>${interest.label}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>

                <div class="form-group full-width">
                  <label class="checkbox-label" style="align-items: flex-start;">
                    <input type="checkbox" id="ic-consent" required aria-required="true" aria-describedby="err-ic-consent" style="margin-top: 4px;" />
                    <span>I agree to receive opening updates, preview invitations, and story letters from Svādotsava. I can unsubscribe anytime.</span>
                  </label>
                  <div class="form-error-msg" id="err-ic-consent" role="alert">Please accept the consent terms to proceed.</div>
                </div>

                <div class="form-group full-width" style="margin-top: 1rem; text-align: center;">
                  <button type="submit" class="btn btn-primary" style="width: 100%;">
                    Join Opening Guest List
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  /* ==========================================================================
     8. Form Validation & Inner Circle Mailto Action
     ========================================================================== */
  function initFormValidation() {
    const form = document.getElementById('inner-circle-form');
    if (!form) return;

    const nameInput = document.getElementById('ic-name');
    const emailInput = document.getElementById('ic-email');
    const cityInput = document.getElementById('ic-city');
    const consentInput = document.getElementById('ic-consent');

    const clearError = (input, errId) => {
      input.setAttribute('aria-invalid', 'false');
      const errEl = document.getElementById(errId);
      if (errEl) errEl.style.display = 'none';
    };

    nameInput?.addEventListener('input', () => clearError(nameInput, 'err-ic-name'));
    emailInput?.addEventListener('input', () => clearError(emailInput, 'err-ic-email'));
    cityInput?.addEventListener('input', () => clearError(cityInput, 'err-ic-city'));
    consentInput?.addEventListener('change', () => clearError(consentInput, 'err-ic-consent'));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      let firstErrorEl = null;

      // Reset errors
      document.querySelectorAll('.form-error-msg').forEach(el => el.style.display = 'none');
      [nameInput, emailInput, cityInput, consentInput].forEach(inp => inp?.setAttribute('aria-invalid', 'false'));

      if (!nameInput.value.trim()) {
        document.getElementById('err-ic-name').style.display = 'block';
        nameInput.setAttribute('aria-invalid', 'true');
        isValid = false;
        if (!firstErrorEl) firstErrorEl = nameInput;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        document.getElementById('err-ic-email').style.display = 'block';
        emailInput.setAttribute('aria-invalid', 'true');
        isValid = false;
        if (!firstErrorEl) firstErrorEl = emailInput;
      }

      if (!cityInput.value.trim()) {
        document.getElementById('err-ic-city').style.display = 'block';
        cityInput.setAttribute('aria-invalid', 'true');
        isValid = false;
        if (!firstErrorEl) firstErrorEl = cityInput;
      }

      if (!consentInput.checked) {
        document.getElementById('err-ic-consent').style.display = 'block';
        consentInput.setAttribute('aria-invalid', 'true');
        isValid = false;
        if (!firstErrorEl) firstErrorEl = consentInput;
      }

      if (!isValid) {
        firstErrorEl?.focus();
        return;
      }

      const selectedInterests = Array.from(
        form.querySelectorAll('input[name="interests"]:checked')
      ).map(cb => {
        const label = cb.closest('label')?.textContent?.trim();
        return label || cb.value;
      });

      const userName = nameInput.value.trim();
      const userEmail = emailInput.value.trim();
      const userCity = cityInput.value.trim();
      const interestList = selectedInterests.length > 0 ? selectedInterests.join(', ') : 'All Offerings';

      const emailSubject = encodeURIComponent(`Svādotsava Opening Guest List — ${userName}`);
      const emailBody = encodeURIComponent(
`Hi Svādotsava Team,

I would love to join the opening guest-list for your Summer 2029 café opening!

• Full Name: ${userName}
• Email: ${userEmail}
• Area / City: ${userCity}
• Interested In: ${interestList}

Looking forward to hearing your opening updates and tasting announcements.

Warm regards,
${userName}`
      );

      const mailtoUrl = `mailto:${DATA.business.email}?subject=${emailSubject}&body=${emailBody}`;

      showModal(
        "Your Invitation Request is Ready",
        `Thank you, ${userName}! We have prepared your opening guest-list request for ${userCity}. Click "Send Email Now" below to send your pre-filled request directly to ${DATA.business.email}.`,
        "✨",
        {
          text: "✉️ Send Email Now",
          url: mailtoUrl
        }
      );
    });
  }

  /* ==========================================================================
     9. Footer Rendering
     ========================================================================== */
  function renderFooter(biz) {
    const container = document.getElementById('footer-content');
    if (!container || !biz) return;

    container.innerHTML = `
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="brand-title">${biz.name}</div>
          <div class="brand-tagline">${biz.tagline}</div>
          <p class="footer-brand-desc">
            A celebration of handcrafted coffee, fragrant tea, cast-iron millet dosas, fresh stone chutneys, and warm hospitality.
          </p>
        </div>

        <div>
          <h4 class="footer-title">Navigation</h4>
          <ul class="footer-links">
            <li><a href="#hero" class="footer-link">Home</a></li>
            <li><a href="#menu" class="footer-link">Café Menu</a></li>
            <li><a href="#millet-marvels" class="footer-link">Millet Menu</a></li>
            <li><a href="#story" class="footer-link">Our Story & Craft</a></li>
            <li><a href="#gallery" class="footer-link">Atmosphere & Gallery</a></li>
            <li><a href="#visit" class="footer-link">Visit & Hours</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-title">Sanctuary</h4>
          <ul class="footer-links">
            <li><a href="#visit-rsvp" class="footer-link">Join Opening List</a></li>
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
      showModal("Terms & Conditions Notice", "Website content, menus, and timelines represent draft preview details prior to our Summer 2029 opening.", "📜");
    });
  }

  /* ==========================================================================
     10. Backwards-Compatible Hash Navigation Handling
     ========================================================================== */
  function initHashHandling() {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#millet-marvels' || hash === '#millet-menu') {
        document.getElementById('millet-marvels')?.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#menu' || hash === '#cafe-menu') {
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
      } else if (hash === '#inner-circle' || hash === '#contact' || hash === '#visit-rsvp') {
        document.getElementById('visit')?.scrollIntoView({ behavior: 'smooth' });
        if (hash === '#visit-rsvp') {
          document.getElementById('ic-name')?.focus();
        }
      } else if (hash === '#signature-spotlight' || hash === '#craft-process' || hash === '#experience') {
        document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    if (window.location.hash) {
      setTimeout(handleHash, 250);
    }
    window.addEventListener('hashchange', handleHash);
  }

  /* ==========================================================================
     11. Helpers (Modal, Toast, Scroll Animations)
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

  function showModal(title, desc, icon = '✨', action = null) {
    const overlay = document.getElementById('modal-overlay');
    const modalTitle = document.getElementById('modal-title');
    const modalDesc = document.getElementById('modal-desc');
    const modalIcon = document.getElementById('modal-icon');
    const closeBtn = document.getElementById('modal-close-btn');
    const actionBtn = document.getElementById('modal-action-btn');

    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalIcon) modalIcon.textContent = icon;

    const closeModal = () => {
      overlay?.classList.remove('open');
      if (modalKeydownHandler) document.removeEventListener('keydown', modalKeydownHandler);
      if (modalReturnFocus instanceof HTMLElement) modalReturnFocus.focus();
      modalReturnFocus = null;
      modalKeydownHandler = null;
    };

    if (action && action.text && action.url) {
      if (actionBtn) {
        actionBtn.style.display = 'inline-block';
        actionBtn.textContent = action.text;
        actionBtn.href = action.url;
        actionBtn.onclick = () => {
          closeModal();
        };
      }
    } else {
      if (actionBtn) actionBtn.style.display = 'none';
    }

    if (closeBtn) {
      closeBtn.onclick = closeModal;
    }

    modalReturnFocus = document.activeElement;
    overlay?.classList.add('open');
    closeBtn?.focus();

    if (overlay) {
      overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
      };
    }

    modalKeydownHandler = (e) => {
      if (!overlay?.classList.contains('open')) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'Tab') trapFocus(e, overlay);
    };
    document.addEventListener('keydown', modalKeydownHandler);
  }

  function trapFocus(e, container) {
    const focusables = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function showToast(message) {
    const toast = document.getElementById('toast-msg');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('visible');

    clearTimeout(toast.timeoutId);
    toast.timeoutId = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }
});
