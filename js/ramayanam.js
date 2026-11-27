/**
 * Svādotsava — Valmiki Ramayanam Left 25% Sidebar & Illustrated Book Reader
 */
document.addEventListener('DOMContentLoaded', () => {
  const data = window.SVADOTSAVA_RAMAYANAM_DATA;
  if (!data) return;

  let activeKanda = 'All';
  let currentStory = null;
  let currentEventIndex = 0;
  let lastFocus = null;

  const sidebar = document.getElementById('ramayanam-sidebar');
  const mobileToggle = document.getElementById('ramayanam-mobile-toggle');
  const mobileClose = document.getElementById('ramayanam-close-mobile');
  const modalOverlay = document.getElementById('ramayanam-modal-overlay');
  const modalClose = document.getElementById('ramayanam-modal-close');
  const prevBtn = document.getElementById('ramayanam-book-prev');
  const nextBtn = document.getElementById('ramayanam-book-next');

  renderFilters();
  renderStories();
  initDrawerAndModal();

  function renderFilters() {
    const container = document.getElementById('ramayanam-filters');
    if (!container) return;

    container.innerHTML = data.kandas
      .map(kanda => {
        const isActive = kanda === activeKanda;
        return `<button type="button" class="ramayanam-filter-btn ${isActive ? 'active' : ''}" data-kanda="${escapeHtml(kanda)}" aria-pressed="${isActive}">${escapeHtml(kanda)}</button>`;
      })
      .join('');

    container.querySelectorAll('.ramayanam-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeKanda = btn.getAttribute('data-kanda') || 'All';
        renderFilters();
        renderStories();
      });
    });
  }

  function renderStories() {
    const list = document.getElementById('ramayanam-story-list');
    if (!list) return;

    const filtered = activeKanda === 'All'
      ? data.stories
      : data.stories.filter(s => s.kanda === activeKanda);

    list.innerHTML = filtered
      .map(story => {
        const badgeText = story.kanda;
        const events = story.events || [];
        const pointsHtml = events.length
          ? `<ul class="ramayanam-card-points">${events.map((ev, idx) => `<li><strong>${idx + 1}.</strong> ${escapeHtml(ev.title)}</li>`).join('')}</ul>`
          : '';
        return `
        <article class="ramayanam-story-card" tabindex="0" role="button" aria-label="Open book for ${escapeHtml(story.title)}" data-story-id="${escapeHtml(story.id)}">
          <div class="ramayanam-card-img-wrap">
            <span class="ramayanam-kanda-badge">${escapeHtml(badgeText)}</span>
            <img src="${escapeHtml(story.image)}" alt="${escapeHtml(story.imageAlt || story.title)}" loading="lazy">
          </div>
          <div class="ramayanam-card-body">
            <h3 class="ramayanam-card-title">${escapeHtml(story.title)}</h3>
            <p class="ramayanam-card-summary">${escapeHtml(story.summary)}</p>
            ${pointsHtml}
            <span class="ramayanam-read-cta">Open Illustrated Book (${events.length} Pages) →</span>
          </div>
        </article>
      `;
      })
      .join('');

    list.querySelectorAll('.ramayanam-story-card').forEach(card => {
      const id = card.getAttribute('data-story-id');
      card.addEventListener('click', () => openBookModal(id, 0, card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openBookModal(id, 0, card);
        }
      });
    });
  }

  function initDrawerAndModal() {
    mobileToggle?.addEventListener('click', () => {
      sidebar?.classList.add('open');
      mobileToggle.setAttribute('aria-expanded', 'true');
    });

    mobileClose?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      mobileToggle?.setAttribute('aria-expanded', 'false');
    });

    modalClose?.addEventListener('click', closeBookModal);
    modalOverlay?.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeBookModal();
    });

    prevBtn?.addEventListener('click', () => {
      if (currentStory && currentEventIndex > 0) {
        currentEventIndex -= 1;
        renderBookPage();
      }
    });

    nextBtn?.addEventListener('click', () => {
      if (currentStory && currentEventIndex < currentStory.events.length - 1) {
        currentEventIndex += 1;
        renderBookPage();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (modalOverlay?.classList.contains('open')) {
        if (e.key === 'Escape') {
          closeBookModal();
        } else if (e.key === 'ArrowLeft' && currentStory && currentEventIndex > 0) {
          currentEventIndex -= 1;
          renderBookPage();
        } else if (e.key === 'ArrowRight' && currentStory && currentEventIndex < currentStory.events.length - 1) {
          currentEventIndex += 1;
          renderBookPage();
        }
      } else if (e.key === 'Escape' && sidebar?.classList.contains('open')) {
        sidebar.classList.remove('open');
        mobileToggle?.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function openBookModal(storyId, startIndex, triggerEl) {
    const story = data.stories.find(s => s.id === storyId);
    if (!story || !modalOverlay || !story.events?.length) return;

    lastFocus = triggerEl || document.activeElement;
    currentStory = story;
    currentEventIndex = startIndex || 0;

    renderBookPage();
    modalOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose?.focus();
  }

  function renderBookPage() {
    if (!currentStory) return;
    const total = currentStory.events.length;
    const ev = currentStory.events[currentEventIndex];

    document.getElementById('ramayanam-book-kanda-label').textContent = currentStory.title;
    document.getElementById('ramayanam-book-page-pill').textContent = `Page ${currentEventIndex + 1} of ${total}`;

    const imgEl = document.getElementById('ramayanam-modal-img');
    imgEl.src = ev.image;
    imgEl.alt = ev.imageAlt || ev.title;

    document.getElementById('ramayanam-book-caption').textContent = `${ev.title} — ${ev.sarga}`;
    document.getElementById('ramayanam-modal-ref').textContent = `Event ${currentEventIndex + 1} • ${ev.sarga}`;
    document.getElementById('ramayanam-modal-title').textContent = ev.title;
    document.getElementById('ramayanam-modal-narrative').innerHTML = ev.narration
      .map(p => `<p>${escapeHtml(p)}</p>`)
      .join('');

    if (prevBtn) prevBtn.disabled = currentEventIndex === 0;
    if (nextBtn) nextBtn.disabled = currentEventIndex === total - 1;

    const dotsContainer = document.getElementById('ramayanam-book-dots');
    if (dotsContainer) {
      dotsContainer.innerHTML = currentStory.events
        .map((item, idx) => `
          <button
            type="button"
            class="ramayanam-book-dot ${idx === currentEventIndex ? 'active' : ''}"
            data-page-idx="${idx}"
            aria-label="Go to Page ${idx + 1}: ${escapeHtml(item.title)}"
            aria-current="${idx === currentEventIndex ? 'page' : 'false'}"
          >${idx + 1}</button>
        `)
        .join('');

      dotsContainer.querySelectorAll('.ramayanam-book-dot').forEach(dot => {
        dot.addEventListener('click', () => {
          currentEventIndex = Number(dot.getAttribute('data-page-idx'));
          renderBookPage();
        });
      });
    }
  }

  function closeBookModal() {
    modalOverlay?.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
});
