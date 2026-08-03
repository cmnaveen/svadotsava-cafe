/**
 * Svādotsava - Interactive Community Digital Tree
 * ------------------------------------------------------------------
 * Interactive Canvas 2D visualization rendering the high-res coffee tree artwork.
 * Displays customer display names directly on targeted leaves/elements upon search, hover, or selection.
 */

(() => {
  'use strict';

  const SLOT_COORDINATES = [
    [0.26, 0.28], [0.38, 0.20], [0.50, 0.14], [0.62, 0.20],
    [0.74, 0.28], [0.18, 0.38], [0.32, 0.34], [0.68, 0.34],
    [0.82, 0.38], [0.44, 0.26], [0.28, 0.48], [0.72, 0.48],
    [0.56, 0.26], [0.14, 0.26], [0.86, 0.26], [0.34, 0.22],
    [0.66, 0.22], [0.50, 0.36], [0.22, 0.32], [0.78, 0.32],
    [0.40, 0.44], [0.60, 0.44], [0.22, 0.18], [0.78, 0.18],
    [0.46, 0.12], [0.54, 0.12], [0.12, 0.44], [0.88, 0.44]
  ];

  document.addEventListener('DOMContentLoaded', initCommunityTree);

  function initCommunityTree() {
    const config = window.SVADOTSAVA_COMMUNITY_TREE || {};
    const toggle = document.getElementById('community-tree-toggle');
    const panel = document.getElementById('community-tree-panel');
    const closeButton = document.getElementById('community-tree-close');
    const stage = document.getElementById('community-tree-stage');
    const canvas = document.getElementById('community-tree-canvas');
    const tooltip = document.getElementById('community-tree-tooltip');
    const detail = document.getElementById('community-tree-detail');
    const searchForm = document.getElementById('community-tree-search-form');
    const searchInput = document.getElementById('community-tree-search-input');
    const searchClear = document.getElementById('community-tree-search-clear');
    const results = document.getElementById('community-tree-results');

    if (!toggle || !panel || !stage || !canvas || !tooltip || !detail || !results) return;

    const context = canvas.getContext('2d');
    if (!context) return;

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
      imageLoaded: false,
      sparkles: createSparkleParticles(50)
    };

    state.treeImage.src = 'assets/images/brand/community_coffee_tree.png';
    state.treeImage.onload = () => {
      state.imageLoaded = true;
      requestDraw();
    };

    const seededOrders = Array.isArray(config.orders) ? config.orders : [];
    state.orders = seededOrders
      .map((order, index) => normalizeOrder(order, index, false))
      .filter(Boolean)
      .slice(-(Number(config.maxElements) || 120));

    renderSearchResults();

    toggle.addEventListener('click', () => {
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
      panel.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close Community Tree');
      document.body.classList.add('community-tree-is-open');

      requestAnimationFrame(() => {
        panel.classList.add('is-open');
        resizeCanvas();
        startAnimation();
      });

      window.setTimeout(() => closeButton?.focus(), 80);
    }

    function closePanel() {
      if (!state.isOpen) return;
      state.isOpen = false;
      panel.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.removeAttribute('aria-label');
      document.body.classList.remove('community-tree-is-open');
      hideTooltip();
      stopAnimation();

      window.setTimeout(() => {
        if (!state.isOpen) panel.hidden = true;
      }, state.reducedMotion ? 0 : 280);
      toggle.focus();
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
          xRel: 0.08 + Math.random() * 0.84,
          yRel: 0.10 + Math.random() * 0.80,
          speed: 0.05 + Math.random() * 0.12,
          size: 0.8 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
          colorType: i % 3
        });
      }
      return particles;
    }

    function drawTree(time) {
      const width = state.width;
      const height = state.height;
      const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      context.clearRect(0, 0, width, height);

      const seconds = time / 1000;

      // 1. Dark Charcoal Stage Fill
      context.fillStyle = '#121417';
      context.fillRect(0, 0, width, height);

      // 2. Render Tree Image Artwork
      if (state.imageLoaded) {
        const imgAspect = state.treeImage.naturalWidth / state.treeImage.naturalHeight;
        const stageAspect = width / height;
        let drawW = width;
        let drawH = height;
        let drawX = 0;
        let drawY = 0;

        if (stageAspect > imgAspect) {
          drawW = height * imgAspect;
          drawX = (width - drawW) / 2;
        } else {
          drawH = width / imgAspect;
          drawY = (height - drawH) / 2;
        }

        context.drawImage(state.treeImage, drawX, drawY, drawW, drawH);
      } else {
        // Fallback central aura while loading
        const aura = context.createRadialGradient(width * 0.5, height * 0.4, 10, width * 0.5, height * 0.4, width * 0.4);
        aura.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = aura;
        context.fillRect(0, 0, width, height);
      }

      // 3. Floating Stardust Particles over Artwork
      context.save();
      context.globalCompositeOperation = 'screen';
      state.sparkles.forEach((p) => {
        const floatY = state.reducedMotion ? 0 : Math.sin(seconds * p.speed * 1.5 + p.phase) * 8;
        const floatX = state.reducedMotion ? 0 : Math.cos(seconds * p.speed * 1.2 + p.phase) * 5;
        const px = width * p.xRel + floatX;
        const py = height * p.yRel + floatY;

        const twinkle = state.reducedMotion ? 0.6 : 0.25 + (Math.sin(seconds * 2.2 + p.phase) + 1) * 0.35;
        let colorStr = `rgba(255, 215, 0, ${twinkle})`;
        if (p.colorType === 1) colorStr = `rgba(255, 170, 50, ${twinkle * 0.9})`;
        else if (p.colorType === 2) colorStr = `rgba(255, 235, 140, ${twinkle})`;

        context.shadowColor = p.colorType === 1 ? '#ff9900' : '#ffd700';
        context.shadowBlur = 6 + p.size * 2;
        context.fillStyle = colorStr;
        context.beginPath();
        context.arc(px, py, p.size, 0, Math.PI * 2);
        context.fill();
      });
      context.restore();

      // 4. Render Community Order Elements & Name Tags on Leaves
      state.orders.forEach((order, index) => {
        const phase = hashString(order.id) * 0.0001;
        const swayX = state.reducedMotion ? 0 : Math.sin(seconds * 0.75 + phase) * (1.6 + (index % 3) * 0.3);
        const swayY = state.reducedMotion ? 0 : Math.cos(seconds * 0.60 + phase) * 0.8;
        const x = order.x * width + swayX;
        const y = order.y * height + swayY;
        const interactive = order.id === state.hoveredId || order.id === state.selectedId;
        const searched = Boolean(state.searchQuery && order.displayName.toLocaleLowerCase().includes(state.searchQuery));
        const growth = getGrowthScale(order, time);
        const scale = growth * (interactive ? 1.36 : searched ? 1.22 : 1);

        order.screenX = x;
        order.screenY = y;
        order.hitRadius = 26 * Math.max(scale, 0.75);

        // Highlight ring on searched or selected
        if (searched || order.id === state.selectedId) {
          drawHighlight(x, y, order.type, darkMode, time);
        }

        // Community Element (leaf, flower blossom, coffee cherry)
        drawTreeElement(order, x, y, scale, darkMode);

        // Display Name Tag directly on that particular leaf if searched, hovered, or selected!
        if (searched || interactive) {
          drawLeafNameTag(x, y, order, searched || order.id === state.selectedId);
        }
      });

      if (state.hoveredId || state.selectedId) {
        showSelectedTooltip();
      }
    }

    function drawLeafNameTag(x, y, order, isPrimary) {
      context.save();
      const text = `${symbolFor(order.type)} ${order.displayName}`;
      context.font = 'bold 12px "Plus Jakarta Sans", system-ui, -apple-system, sans-serif';
      const textMetrics = context.measureText(text);
      const textWidth = textMetrics.width;
      const paddingX = 10;
      const paddingY = 5;
      const boxWidth = textWidth + paddingX * 2;
      const boxHeight = 22;
      const boxX = x - boxWidth / 2;
      const boxY = y - 38;
      const radius = 11;

      // Outer Glow
      context.shadowColor = isPrimary ? '#ffd700' : '#4effd0';
      context.shadowBlur = isPrimary ? 12 : 6;

      // Dark Glossy Pill Background
      context.fillStyle = isPrimary ? 'rgba(18, 14, 12, 0.94)' : 'rgba(14, 20, 22, 0.90)';
      context.beginPath();
      context.roundRect(boxX, boxY, boxWidth, boxHeight, radius);
      context.fill();

      // Glowing Gold/Cyan Border
      context.strokeStyle = isPrimary ? '#ffd700' : 'rgba(100, 255, 218, 0.8)';
      context.lineWidth = isPrimary ? 1.5 : 1.0;
      context.stroke();

      context.shadowBlur = 0;

      // Text Label
      context.fillStyle = '#FFFFFF';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(text, x, boxY + boxHeight / 2 + 0.5);

      context.restore();
    }

    function drawTreeElement(order, x, y, scale, darkMode) {
      context.save();
      context.translate(x, y);
      context.scale(scale, scale);
      const tilt = ((hashString(order.id) % 25) - 12) * Math.PI / 180;
      context.rotate(tilt);

      if (order.type === 'leaf') drawLeaf();
      else if (order.type === 'flower') drawFlower();
      else drawFruit();

      context.restore();
    }

    function drawLeaf() {
      context.save();
      context.shadowColor = '#39ff14';
      context.shadowBlur = 15;

      const leafGrad = context.createLinearGradient(-18, -12, 18, 12);
      leafGrad.addColorStop(0, '#b6ff73');
      leafGrad.addColorStop(0.40, '#39ff14');
      leafGrad.addColorStop(0.80, '#10b981');
      leafGrad.addColorStop(1, '#036937');

      context.beginPath();
      context.moveTo(-18, 1);
      context.bezierCurveTo(-11, -16, 11, -17, 19, -2);
      context.bezierCurveTo(11, 15, -10, 16, -18, 1);
      context.fillStyle = leafGrad;
      context.fill();

      context.strokeStyle = '#d7ffc2';
      context.lineWidth = 1.2;
      context.stroke();

      context.shadowBlur = 0;
      context.beginPath();
      context.moveTo(-13, 2);
      context.quadraticCurveTo(0, -1, 14, -3);
      context.strokeStyle = 'rgba(240, 255, 240, 0.9)';
      context.lineWidth = 1.2;
      context.stroke();

      for (let i = -8; i <= 8; i += 5) {
        context.beginPath();
        context.moveTo(i, 0);
        context.lineTo(i + 3, -4);
        context.strokeStyle = 'rgba(210, 255, 210, 0.5)';
        context.lineWidth = 0.8;
        context.stroke();
      }

      context.restore();
    }

    function drawFlower() {
      context.save();
      context.shadowColor = '#ff69b4';
      context.shadowBlur = 18;

      for (let i = 0; i < 5; i += 1) {
        const angle = -Math.PI / 2 + (Math.PI * 2 * i) / 5;
        const petalGrad = context.createRadialGradient(
          Math.cos(angle) * 4, Math.sin(angle) * 4, 1,
          Math.cos(angle) * 11, Math.sin(angle) * 11, 14
        );
        petalGrad.addColorStop(0, '#ffe6f3');
        petalGrad.addColorStop(0.42, '#ff80c0');
        petalGrad.addColorStop(0.80, '#ff1493');
        petalGrad.addColorStop(1, '#b8005c');

        context.beginPath();
        context.ellipse(Math.cos(angle) * 11, Math.sin(angle) * 11, 9, 14, angle, 0, Math.PI * 2);
        context.fillStyle = petalGrad;
        context.fill();
        context.strokeStyle = 'rgba(255, 235, 245, 0.85)';
        context.lineWidth = 0.9;
        context.stroke();
      }

      const centerGrad = context.createRadialGradient(-2, -2, 1, 0, 0, 8);
      centerGrad.addColorStop(0, '#ffeb3b');
      centerGrad.addColorStop(0.6, '#f57c00');
      centerGrad.addColorStop(1, '#e65100');

      context.beginPath();
      context.arc(0, 0, 7.5, 0, Math.PI * 2);
      context.fillStyle = centerGrad;
      context.fill();

      context.fillStyle = '#fffde7';
      for (let i = 0; i < 5; i += 1) {
        const a = (Math.PI * 2 * i) / 5;
        context.beginPath();
        context.arc(Math.cos(a) * 4.2, Math.sin(a) * 4.2, 1.2, 0, Math.PI * 2);
        context.fill();
      }

      context.restore();
    }

    function drawFruit() {
      context.save();
      context.shadowColor = '#e60039';
      context.shadowBlur = 18;

      context.beginPath();
      context.moveTo(0, -14);
      context.lineTo(0, -3);
      context.strokeStyle = '#39ff14';
      context.lineWidth = 2.0;
      context.lineCap = 'round';
      context.stroke();

      const fruitGrad = context.createRadialGradient(-4, -5, 1, 1, 3, 18);
      fruitGrad.addColorStop(0, '#ffe5ea');
      fruitGrad.addColorStop(0.20, '#ff6b8b');
      fruitGrad.addColorStop(0.58, '#e60039');
      fruitGrad.addColorStop(0.86, '#990026');
      fruitGrad.addColorStop(1, '#4d0013');

      context.beginPath();
      context.ellipse(0, 5, 13.5, 18.5, 0.04, 0, Math.PI * 2);
      context.fillStyle = fruitGrad;
      context.fill();
      context.strokeStyle = '#ffb3c1';
      context.lineWidth = 1.1;
      context.stroke();

      context.shadowBlur = 0;
      context.beginPath();
      context.ellipse(-4.5, -2, 2.5, 6, -0.40, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 255, 255, 0.85)';
      context.fill();

      context.fillStyle = '#33000d';
      context.beginPath();
      context.arc(0, 22.5, 2.2, 0, Math.PI * 2);
      context.fill();

      context.restore();
    }

    function drawHighlight(x, y, type, darkMode, time) {
      const baseRadius = type === 'fruit' ? 33 : type === 'flower' ? 30 : 28;
      const pulse = state.reducedMotion ? 0 : Math.sin(time / 240) * 3;

      context.save();
      context.shadowColor = '#ffd700';
      context.shadowBlur = 18;
      context.beginPath();
      context.arc(x, y, baseRadius + pulse, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(255, 215, 0, 0.95)';
      context.lineWidth = 2.8;
      context.stroke();

      context.beginPath();
      context.arc(x, y, baseRadius + 7 + pulse * 0.45, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(255, 235, 140, 0.4)';
      context.lineWidth = 1.4;
      context.stroke();

      for (let i = 0; i < 4; i += 1) {
        const angle = time / 800 + i * Math.PI / 2;
        const sparkleX = x + Math.cos(angle) * (baseRadius + 9.5);
        const sparkleY = y + Math.sin(angle) * (baseRadius + 9.5);
        context.fillStyle = '#fffde7';
        context.beginPath();
        context.arc(sparkleX, sparkleY, 2.1, 0, Math.PI * 2);
        context.fill();
      }
      context.restore();
    }

    function getGrowthScale(order, time) {
      if (state.reducedMotion || !order.spawnedAt) return 1;
      const progress = Math.min(1, Math.max(0, (time - order.spawnedAt) / 760));
      if (progress >= 1) {
        order.spawnedAt = null;
        return 1;
      }
      const back = 1.70158;
      const shifted = progress - 1;
      return 1 + (back + 1) * shifted * shifted * shifted + back * shifted * shifted;
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
        ? `${symbolFor(order.type)} ${order.displayName} grows as a ${order.type}. ${tierText(order.type)}.`
        : 'Hover, tap, or choose a name to explore the tree.';
    }

    function showSelectedTooltip() {
      const order = state.orders.find((item) => item.id === (state.hoveredId || state.selectedId));
      if (order) showTooltip(order, order.screenX, order.screenY);
      else hideTooltip();
    }

    function showTooltip(order, x, y) {
      tooltip.textContent = `${symbolFor(order.type)} ${order.displayName} · ${capitalize(order.type)}`;
      tooltip.classList.add('is-visible');
      tooltip.setAttribute('aria-hidden', 'false');
      const maxLeft = Math.max(12, state.width - tooltip.offsetWidth - 12);
      const left = Math.min(maxLeft, Math.max(12, x - tooltip.offsetWidth / 2));
      const top = Math.max(12, y - 58);
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

      const id = String(order.orderId || order.id || `tree-${Date.now()}-${index}`);
      const fallback = getAvailableCoordinate(id, index);
      const x = clampCoordinate(order.x, fallback[0]);
      const y = clampCoordinate(order.y, fallback[1]);
      return {
        id,
        displayName,
        orderAmount: amount,
        timestamp: validTimestamp(order.timestamp),
        type: tierForAmount(amount),
        x,
        y,
        spawnedAt: animate && !state.reducedMotion ? performance.now() : null,
        screenX: 0,
        screenY: 0,
        hitRadius: 26
      };
    }

    function getAvailableCoordinate(id, index) {
      const base = (hashString(id) + index) % SLOT_COORDINATES.length;
      return SLOT_COORDINATES[base];
    }

    function clampCoordinate(value, fallback) {
      const number = Number(value);
      if (!Number.isFinite(number)) return fallback;
      return Math.min(0.94, Math.max(0.06, number));
    }
  }

  function tierForAmount(amount) {
    if (amount < 500) return 'leaf';
    if (amount <= 1000) return 'flower';
    return 'fruit';
  }

  function tierText(type) {
    if (type === 'leaf') return 'This tier represents orders below ₹500';
    if (type === 'flower') return 'This tier represents orders from ₹500 to ₹1,000';
    return 'This tier represents orders above ₹1,000';
  }

  function symbolFor(type) {
    if (type === 'leaf') return '🍃';
    if (type === 'flower') return '🌸';
    return '🍎';
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
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
