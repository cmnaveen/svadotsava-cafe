/**
 * Svādotsava - Interactive Community Digital Tree
 * ------------------------------------------------------------------
 * Painted botanical community tree inspired by traditional botanical illustration.
 * Features a textured wooden trunk, organic root mound, and painted order tiers:
 *   🍃 Leaf (Below ₹500)
 *   🌸 Blossom (₹500–₹1,000)
 *   🍒 Cherry (Above ₹1,000)
 *
 * Interactive on-tree name badges, targeted tier glowing auras, search filtering,
 * and accessible keyboard navigation.
 */

(() => {
  'use strict';

  /* Specific slot coordinates mapped to painted leaves, blossoms, and cherries */
  const LEAF_COORDINATES = [
    [0.16, 0.18], [0.945, 0.30], [0.035, 0.47], [0.965, 0.49],
    [0.525, 0.065], [0.365, 0.74], [0.635, 0.77], [0.84, 0.18],
    [0.05, 0.34], [0.95, 0.50], [0.18, 0.55], [0.82, 0.55]
  ];

  const BLOSSOM_COORDINATES = [
    [0.375, 0.125], [0.64, 0.125], [0.21, 0.23], [0.83, 0.235],
    [0.50, 0.21], [0.21, 0.375], [0.735, 0.505], [0.68, 0.14],
    [0.12, 0.28], [0.34, 0.33], [0.08, 0.49], [0.13, 0.59]
  ];

  const CHERRY_COORDINATES = [
    [0.39, 0.185], [0.68, 0.215], [0.298, 0.24], [0.778, 0.32],
    [0.922, 0.38], [0.545, 0.488], [0.22, 0.29], [0.08, 0.36],
    [0.14, 0.45], [0.09, 0.54], [0.12, 0.68], [0.26, 0.60]
  ];

  document.addEventListener('DOMContentLoaded', initCommunityTree);

  function initCommunityTree() {
    const config = window.SVADOTSAVA_COMMUNITY_TREE || {};
    const stage = document.getElementById('community-tree-stage');
    const canvas = document.getElementById('community-tree-canvas');
    if (!canvas || !stage) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const tooltip = document.getElementById('community-tree-tooltip');
    const detail = document.getElementById('community-tree-detail');
    const searchForm = document.getElementById('community-tree-search-form');
    const searchInput = document.getElementById('community-tree-search-input');
    const searchClear = document.getElementById('community-tree-search-clear');
    const results = document.getElementById('community-tree-results');

    /* Floating toggle & Modal panel */
    const toggle = document.getElementById('community-tree-toggle');
    const closeButton = document.getElementById('community-tree-close');
    const panel = document.getElementById('community-tree-panel') || document.getElementById('community-tree-modal') || document.getElementById('community-tree');

    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const state = {
      isOpen: false,
      width: 900,
      height: 560,
      orders: [],
      hoveredId: null,
      selectedId: null,
      searchQuery: '',
      animationFrame: null,
      lastPointer: null,
      reducedMotion: reducedMotionQuery.matches,
      resizeObserver: null,
      pollTimer: null,
      treeImage: new Image(),
      treeImageLoaded: false,
      treeBounds: { x: 0, y: 0, width: 900, height: 560 },
      sparkles: createSparkleParticles(45)
    };

    /* Load painted botanical tree asset */
    state.treeImage.src = 'assets/images/brand/community_tree_painted.webp';
    state.treeImage.onload = () => {
      state.treeImageLoaded = true;
      requestDraw();
    };
    state.treeImage.onerror = () => {
      if (!state.treeImage.src.endsWith('.png')) {
        state.treeImage.src = 'assets/images/brand/community_tree_painted.png';
      }
    };

    const seededOrders = Array.isArray(config.orders) ? config.orders : [];
    state.orders = seededOrders
      .map((order, index) => normalizeOrder(order, index, false))
      .filter(Boolean)
      .slice(-(Number(config.maxElements) || 120));

    renderSearchResults();

    toggle?.addEventListener('click', () => {
      if (state.isOpen) closePanel();
      else openPanel();
    });
    closeButton?.addEventListener('click', closePanel);

    document.addEventListener('keydown', (event) => {
      if (!state.isOpen) return;
      if (event.key === 'Escape') closePanel();
    });

    searchForm?.addEventListener('submit', (event) => {
      event.preventDefault();
      const firstMatch = getFilteredOrders()[0];
      if (firstMatch) selectOrder(firstMatch, true);
    });

    searchInput?.addEventListener('input', () => {
      state.searchQuery = searchInput.value.trim().toLocaleLowerCase();
      renderSearchResults();
      const matches = getFilteredOrders();
      if (state.searchQuery && matches.length === 1) selectOrder(matches[0], false);
      requestDraw();
    });

    searchClear?.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      state.searchQuery = '';
      state.selectedId = null;
      renderSearchResults();
      updateDetail(null);
      hideTooltip();
      requestDraw();
      searchInput?.focus();
    });

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', () => {
      state.hoveredId = null;
      state.lastPointer = null;
      showSelectedTooltip();
      requestDraw();
    });
    canvas.addEventListener('click', handleCanvasClick);
    canvas.addEventListener('keydown', handleCanvasKeyboard);

    if ('ResizeObserver' in window) {
      state.resizeObserver = new ResizeObserver(() => {
        if (state.isOpen) resizeCanvas();
      });
      state.resizeObserver.observe(stage);
    } else {
      window.addEventListener('resize', resizeCanvas);
    }

    reducedMotionQuery.addEventListener?.('change', (event) => {
      state.reducedMotion = event.matches;
      requestDraw();
    });

    const themeObserver = new MutationObserver(() => requestDraw());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    if (config.apiUrl) {
      syncFromApi();
      state.pollTimer = window.setInterval(syncFromApi, Math.max(15000, Number(config.pollIntervalMs) || 60000));
    }

    window.SvadotsavaCommunityTree = Object.freeze({
      open: openPanel,
      close: closePanel,
      refresh: syncFromApi,
      addOrder: (payload) => addOrder(payload, true)
    });

    function openPanel() {
      if (state.isOpen) return;
      state.isOpen = true;
      if (panel) panel.hidden = false;
      toggle?.setAttribute('aria-expanded', 'true');
      toggle?.setAttribute('aria-label', 'Close Community Tree');
      document.body.classList.add('community-tree-is-open');

      requestAnimationFrame(() => {
        panel?.classList.add('is-open');
        resizeCanvas();
        startAnimation();
      });

      window.setTimeout(() => closeButton?.focus(), 80);
    }

    function closePanel() {
      if (!state.isOpen) return;
      state.isOpen = false;
      panel?.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
      toggle?.removeAttribute('aria-label');
      document.body.classList.remove('community-tree-is-open');
      hideTooltip();
      stopAnimation();

      window.setTimeout(() => {
        if (!state.isOpen && panel) panel.hidden = true;
      }, state.reducedMotion ? 0 : 280);
      toggle?.focus();
    }

    function resizeCanvas() {
      if (!state.isOpen) return;
      const rect = stage.getBoundingClientRect();
      const width = Math.max(280, Math.floor(rect.width));
      const height = Math.max(290, Math.floor(rect.height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      state.width = width;
      state.height = height;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      drawTree(performance.now());
    }

    function startAnimation() {
      stopAnimation();
      const frame = (time) => {
        drawTree(time);
        if (state.isOpen && !state.reducedMotion) {
          state.animationFrame = requestAnimationFrame(frame);
        } else {
          state.animationFrame = null;
        }
      };
      state.animationFrame = requestAnimationFrame(frame);
    }

    function stopAnimation() {
      if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
      state.animationFrame = null;
    }

    function requestDraw() {
      if (!state.isOpen || state.animationFrame) return;
      state.animationFrame = requestAnimationFrame((time) => {
        state.animationFrame = null;
        drawTree(time);
      });
    }

    function createSparkleParticles(count) {
      const particles = [];
      for (let i = 0; i < count; i += 1) {
        particles.push({
          xRel: 0.06 + Math.random() * 0.88,
          yRel: 0.06 + Math.random() * 0.84,
          speed: 0.04 + Math.random() * 0.10,
          size: 0.8 + Math.random() * 1.6,
          phase: Math.random() * Math.PI * 2,
          colorType: i % 3
        });
      }
      return particles;
    }

    function getTreeBounds(width, height) {
      const naturalAspect = 1.0; // 1:1 square painted botanical tree
      const stageAspect = width / height;
      let drawW, drawH, drawX, drawY;

      if (stageAspect > naturalAspect) {
        drawH = height;
        drawW = height * naturalAspect;
        drawX = (width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = width;
        drawH = width / naturalAspect;
        drawX = 0;
        drawY = (height - drawH) / 2;
      }
      return { x: drawX, y: drawY, width: drawW, height: drawH };
    }

    function drawTree(time) {
      const width = state.width;
      const height = state.height;
      const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      context.clearRect(0, 0, width, height);

      const seconds = time / 1000;

      // 1. Stage fill
      context.fillStyle = '#111318';
      context.fillRect(0, 0, width, height);

      // 2. Render painted tree artwork
      state.treeBounds = getTreeBounds(width, height);
      const bounds = state.treeBounds;

      if (state.treeImageLoaded) {
        context.drawImage(state.treeImage, bounds.x, bounds.y, bounds.width, bounds.height);

        // Soft perimeter vignette to blend tree naturally with stage background
        const vignette = context.createRadialGradient(
          width * 0.5, height * 0.5, Math.min(width, height) * 0.38,
          width * 0.5, height * 0.5, Math.max(width, height) * 0.68
        );
        vignette.addColorStop(0, 'rgba(17, 19, 24, 0)');
        vignette.addColorStop(0.75, 'rgba(17, 19, 24, 0.20)');
        vignette.addColorStop(1, 'rgba(17, 19, 24, 0.90)');
        context.fillStyle = vignette;
        context.fillRect(0, 0, width, height);

        // Warm ambient sunbeam through crown canopy
        const sunbeam = context.createRadialGradient(
          width * 0.5, bounds.y + bounds.height * 0.24, 20,
          width * 0.5, bounds.y + bounds.height * 0.35, bounds.width * 0.45
        );
        sunbeam.addColorStop(0, 'rgba(255, 220, 140, 0.10)');
        sunbeam.addColorStop(0.6, 'rgba(255, 190, 80, 0.03)');
        sunbeam.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = sunbeam;
        context.fillRect(0, 0, width, height);
      } else {
        // Warm golden radial glow while asset loads
        const aura = context.createRadialGradient(width * 0.5, height * 0.42, 10, width * 0.5, height * 0.42, width * 0.38);
        aura.addColorStop(0, 'rgba(255, 215, 0, 0.20)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = aura;
        context.fillRect(0, 0, width, height);
      }

      // 3. Floating dappled sunlight & golden pollen motes
      context.save();
      context.globalCompositeOperation = 'screen';
      state.sparkles.forEach((p) => {
        const floatY = state.reducedMotion ? 0 : Math.sin(seconds * p.speed * 1.5 + p.phase) * 9;
        const floatX = state.reducedMotion ? 0 : Math.cos(seconds * p.speed * 1.2 + p.phase) * 6;
        const px = width * p.xRel + floatX;
        const py = height * p.yRel + floatY;

        const twinkle = state.reducedMotion ? 0.6 : 0.25 + (Math.sin(seconds * 2.2 + p.phase) + 1) * 0.35;
        let colorStr = `rgba(255, 225, 120, ${twinkle * 0.75})`;
        if (p.colorType === 1) colorStr = `rgba(255, 185, 70, ${twinkle * 0.65})`;
        else if (p.colorType === 2) colorStr = `rgba(255, 245, 190, ${twinkle * 0.85})`;

        context.shadowColor = '#f59e0b';
        context.shadowBlur = 4 + p.size * 2;
        context.fillStyle = colorStr;
        context.beginPath();
        context.arc(px, py, p.size, 0, Math.PI * 2);
        context.fill();
      });
      context.restore();

      // 4. Interactive community botanical elements (Leaves, Blossoms, Cherries)
      const searchedOrders = [];
      const interactiveOrders = [];

      state.orders.forEach((order, index) => {
        const phase = hashString(order.id) * 0.0001;
        const swayX = state.reducedMotion ? 0 : Math.sin(seconds * 0.85 + phase) * 0.8;
        const swayY = state.reducedMotion ? 0 : Math.cos(seconds * 0.65 + phase) * 0.5;
        const x = bounds.x + order.x * bounds.width + swayX;
        const y = bounds.y + order.y * bounds.height + swayY;
        const interactive = order.id === state.hoveredId || order.id === state.selectedId;
        const searched = Boolean(state.searchQuery && order.displayName.toLocaleLowerCase().includes(state.searchQuery));

        order.screenX = x;
        order.screenY = y;
        order.hitRadius = 24;

        // Draw interactive highlight aura when searched, hovered, or selected
        if (searched || interactive) {
          drawOrderHighlight(x, y, order.type, darkMode, time, interactive);
        } else {
          // Subtle idle indicator ring so users know where orders are planted
          drawIdleIndicator(x, y, order.type, time, index);
        }

        if (interactive) interactiveOrders.push(order);
        else if (searched) searchedOrders.push(order);
      });

      // 5. Render on-tree customer name badges (searched & hovered/selected)
      searchedOrders.slice(0, 6).forEach((order) => {
        drawLeafNameTag(order.screenX, order.screenY, order, false);
      });
      interactiveOrders.forEach((order) => {
        drawLeafNameTag(order.screenX, order.screenY, order, true);
      });

      if (state.hoveredId || state.selectedId) {
        showSelectedTooltip();
      }
    }

    function drawIdleIndicator(x, y, type, time, index) {
      // Subtle organic breathing dot over the element
      const pulse = state.reducedMotion ? 0 : Math.sin(time / 600 + index) * 1.5;
      const radius = 6 + pulse;
      context.save();

      let color = 'rgba(74, 222, 128, 0.55)'; // leaf green
      if (type === 'flower') color = 'rgba(254, 240, 138, 0.65)'; // blossom cream
      else if (type === 'fruit') color = 'rgba(244, 63, 94, 0.65)'; // cherry ruby

      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = color;
      context.shadowColor = color;
      context.shadowBlur = 6;
      context.fill();

      context.beginPath();
      context.arc(x, y, 2, 0, Math.PI * 2);
      context.fillStyle = '#ffffff';
      context.fill();

      context.restore();
    }

    function drawOrderHighlight(x, y, type, darkMode, time, isPrimary) {
      const baseRadius = type === 'fruit' ? 22 : type === 'flower' ? 20 : 18;
      const pulse = state.reducedMotion ? 0 : Math.sin(time / 200) * 3;

      context.save();
      let glowColor = '#ffd700';
      if (type === 'leaf') glowColor = '#4ade80';
      else if (type === 'flower') glowColor = '#fef08a';
      else if (type === 'fruit') glowColor = '#fb7185';

      context.shadowColor = glowColor;
      context.shadowBlur = isPrimary ? 22 : 14;

      // Outer glowing ring
      context.beginPath();
      context.arc(x, y, baseRadius + pulse, 0, Math.PI * 2);
      context.strokeStyle = isPrimary ? '#ffd700' : glowColor;
      context.lineWidth = isPrimary ? 2.5 : 1.8;
      context.stroke();

      // Secondary halo ring
      context.beginPath();
      context.arc(x, y, baseRadius + 6 + pulse * 0.45, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(255, 235, 140, 0.45)';
      context.lineWidth = 1.2;
      context.stroke();

      // Sparkling orbiting particles
      for (let i = 0; i < 4; i += 1) {
        const angle = time / 800 + i * Math.PI / 2;
        const sparkleX = x + Math.cos(angle) * (baseRadius + 8.5);
        const sparkleY = y + Math.sin(angle) * (baseRadius + 8.5);
        context.fillStyle = '#fffde7';
        context.beginPath();
        context.arc(sparkleX, sparkleY, 2.0, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }

    function drawLeafNameTag(x, y, order, isPrimary) {
      context.save();
      const amountText = `₹${order.orderAmount.toLocaleString('en-IN')}`;
      const text = `${symbolFor(order.type)} ${order.displayName} · ${amountText}`;
      context.font = '600 12px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
      const textMetrics = context.measureText(text);
      const textWidth = textMetrics.width;
      const paddingX = 10;
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = 24;
      const badgeY = Math.max(8, y - 42);
      const badgeX = Math.min(state.width - boxWidth - 8, Math.max(8, x - boxWidth / 2));
      const radius = 12;

      // Connecting pointer line from badge to element
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x, badgeY + boxHeight);
      context.strokeStyle = isPrimary ? '#ffd700' : 'rgba(255, 215, 0, 0.65)';
      context.lineWidth = 1.4;
      context.stroke();

      // Center anchor dot on element
      context.beginPath();
      context.arc(x, y, 3, 0, Math.PI * 2);
      context.fillStyle = '#ffd700';
      context.fill();

      // Badge drop shadow
      context.shadowColor = 'rgba(0, 0, 0, 0.70)';
      context.shadowBlur = 10;
      context.shadowOffsetY = 4;

      // Badge pill background
      context.beginPath();
      context.roundRect(badgeX, badgeY, boxWidth, boxHeight, radius);
      context.fillStyle = isPrimary ? 'rgba(24, 20, 16, 0.96)' : 'rgba(30, 26, 22, 0.90)';
      context.fill();

      // Golden badge border
      context.strokeStyle = isPrimary ? '#ffd700' : 'rgba(255, 215, 0, 0.55)';
      context.lineWidth = isPrimary ? 1.5 : 1.0;
      context.stroke();
      context.shadowBlur = 0;

      // Badge typography
      context.fillStyle = isPrimary ? '#fff7ed' : '#fef08a';
      context.textBaseline = 'middle';
      context.textAlign = 'left';
      context.fillText(text, badgeX + paddingX, badgeY + boxHeight / 2);

      context.restore();
    }

    function handlePointerMove(event) {
      const pointer = getPointerPosition(event);
      const hit = findOrderAt(pointer.x, pointer.y);
      const nextId = hit?.id || null;
      state.lastPointer = pointer;
      canvas.style.cursor = hit ? 'pointer' : 'default';
      if (nextId === state.hoveredId) return;
      state.hoveredId = nextId;
      if (hit) {
        updateDetail(hit);
        showTooltip(hit, hit.screenX, hit.screenY);
      } else {
        showSelectedTooltip();
      }
      requestDraw();
    }

    function handleCanvasClick(event) {
      const pointer = getPointerPosition(event);
      const hit = findOrderAt(pointer.x, pointer.y);
      if (hit) selectOrder(hit, false);
      else {
        state.selectedId = null;
        updateDetail(null);
        hideTooltip();
        renderSearchResults();
        requestDraw();
      }
    }

    function handleCanvasKeyboard(event) {
      if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
      event.preventDefault();
      if (!state.orders.length) return;

      const currentIndex = Math.max(0, state.orders.findIndex((order) => order.id === state.selectedId));
      let nextIndex = currentIndex;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % state.orders.length;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + state.orders.length) % state.orders.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = state.orders.length - 1;
      selectOrder(state.orders[nextIndex], false);
    }

    function getPointerPosition(event) {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    function findOrderAt(x, y) {
      let nearest = null;
      let nearestDistance = Infinity;
      state.orders.forEach((order) => {
        const distance = Math.hypot(x - order.screenX, y - order.screenY);
        if (distance <= order.hitRadius && distance < nearestDistance) {
          nearest = order;
          nearestDistance = distance;
        }
      });
      return nearest;
    }

    function selectOrder(order, focusCanvas) {
      state.selectedId = order.id;
      updateDetail(order);
      renderSearchResults();
      showTooltip(order, order.screenX, order.screenY);
      requestDraw();
      if (focusCanvas) canvas.focus();
    }

    function updateDetail(order) {
      detail.textContent = order
        ? `${symbolFor(order.type)} ${order.displayName} grows as a ${tierName(order.type)}. ${tierText(order.type)}.`
        : 'Hover, tap, or choose a name to explore the tree.';
    }

    function showSelectedTooltip() {
      const order = state.orders.find((item) => item.id === (state.hoveredId || state.selectedId));
      if (order) showTooltip(order, order.screenX, order.screenY);
      else hideTooltip();
    }

    function showTooltip(order, x, y) {
      const amountText = `₹${order.orderAmount.toLocaleString('en-IN')}`;
      tooltip.textContent = `${symbolFor(order.type)} ${order.displayName} · ${tierName(order.type)} (${amountText})`;
      tooltip.classList.add('is-visible');
      tooltip.setAttribute('aria-hidden', 'false');
      const maxLeft = Math.max(12, state.width - tooltip.offsetWidth - 12);
      const left = Math.min(maxLeft, Math.max(12, x - tooltip.offsetWidth / 2));
      const top = Math.max(12, y - 56);
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
    }

    function hideTooltip() {
      tooltip.classList.remove('is-visible');
      tooltip.setAttribute('aria-hidden', 'true');
    }

    function renderSearchResults() {
      const matches = getFilteredOrders();
      results.replaceChildren();
      const visibleMatches = matches.slice(0, state.searchQuery ? 10 : 8);

      if (!visibleMatches.length) {
        const empty = document.createElement('p');
        empty.className = 'community-tree-empty';
        empty.textContent = `No sample name matches “${searchInput?.value.trim() || ''}”.`;
        results.appendChild(empty);
        return;
      }

      visibleMatches.forEach((order) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'community-tree-result';
        button.setAttribute('aria-pressed', String(order.id === state.selectedId));
        button.textContent = `${symbolFor(order.type)} ${order.displayName}`;
        button.addEventListener('click', () => selectOrder(order, true));
        results.appendChild(button);
      });

      if (matches.length > visibleMatches.length) {
        const remaining = document.createElement('div');
        remaining.className = 'community-tree-result-count';
        remaining.textContent = `+${matches.length - visibleMatches.length} more sample names`;
        results.appendChild(remaining);
      }
    }

    function getFilteredOrders() {
      if (!state.searchQuery) return state.orders;
      return state.orders.filter((order) => order.displayName.toLocaleLowerCase().includes(state.searchQuery));
    }

    function addOrder(payload, animate) {
      const normalized = normalizeOrder(payload, state.orders.length, animate);
      if (!normalized) return false;
      const existingIndex = state.orders.findIndex((order) => order.id === normalized.id);
      if (existingIndex >= 0) state.orders.splice(existingIndex, 1, normalized);
      else state.orders.push(normalized);
      state.orders = state.orders.slice(-(Number(config.maxElements) || 120));
      state.selectedId = normalized.id;
      renderSearchResults();
      updateDetail(normalized);
      if (!state.isOpen) openPanel();
      startAnimation();
      return true;
    }

    async function syncFromApi() {
      if (!config.apiUrl) return { status: 'preview', count: state.orders.length };
      try {
        const response = await fetch(config.apiUrl, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          credentials: 'omit'
        });
        if (!response.ok) throw new Error(`Community Tree API returned ${response.status}`);
        const body = await response.json();
        const payloadOrders = Array.isArray(body) ? body : body.orders;
        if (!Array.isArray(payloadOrders)) throw new Error('Community Tree API response must contain an orders array.');

        const previousIds = new Set(state.orders.map((order) => order.id));
        state.orders = payloadOrders
          .filter((order) => order.publicOptIn !== false)
          .map((order, index) => normalizeOrder(order, index, !previousIds.has(String(order.orderId || order.id))))
          .filter(Boolean)
          .slice(-(Number(config.maxElements) || 120));
        renderSearchResults();
        requestDraw();
        return { status: 'connected', count: state.orders.length };
      } catch (error) {
        console.warn('Community Tree could not refresh:', error.message);
        return { status: 'error', count: state.orders.length };
      }
    }

    function normalizeOrder(order, index, animate) {
      if (!order || typeof order !== 'object') return null;
      const displayName = String(order.displayName || order.customerName || '')
        .replace(/[<>]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 32);
      const amount = Number(order.orderAmount);
      if (!displayName || !Number.isFinite(amount) || amount < 0) return null;

      const type = tierForAmount(amount);
      const id = String(order.orderId || order.id || `tree-${Date.now()}-${index}`);
      const fallback = getCoordinateForTier(type, id, index);
      const x = clampCoordinate(order.x, fallback[0]);
      const y = clampCoordinate(order.y, fallback[1]);
      return {
        id,
        displayName,
        orderAmount: amount,
        timestamp: validTimestamp(order.timestamp),
        type,
        x,
        y,
        spawnedAt: animate && !state.reducedMotion ? performance.now() : null,
        screenX: 0,
        screenY: 0,
        hitRadius: 24
      };
    }

    function getCoordinateForTier(type, id, index) {
      let pool = LEAF_COORDINATES;
      if (type === 'flower') pool = BLOSSOM_COORDINATES;
      else if (type === 'fruit') pool = CHERRY_COORDINATES;
      const base = (hashString(id) + index) % pool.length;
      return pool[base];
    }

    function clampCoordinate(value, fallback) {
      const number = Number(value);
      if (!Number.isFinite(number)) return fallback;
      return Math.min(0.95, Math.max(0.05, number));
    }
  }

  function tierForAmount(amount) {
    if (amount < 500) return 'leaf';
    if (amount <= 1000) return 'flower';
    return 'fruit';
  }

  function tierName(type) {
    if (type === 'leaf') return 'Leaf';
    if (type === 'flower') return 'Blossom';
    return 'Cherry';
  }

  function tierText(type) {
    if (type === 'leaf') return 'This tier represents orders below ₹500 (🍃 Leaf)';
    if (type === 'flower') return 'This tier represents orders from ₹500 to ₹1,000 (🌸 Blossom)';
    return 'This tier represents orders above ₹1,000 (🍒 Cherry)';
  }

  function symbolFor(type) {
    if (type === 'leaf') return '🍃';
    if (type === 'flower') return '🌸';
    return '🍒';
  }

  function validTimestamp(value) {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }
})();
