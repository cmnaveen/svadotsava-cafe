/**
 * Svādotsava - Interactive Community Digital Tree
 * ------------------------------------------------------------------
 * Symmetrical, fantasy-vector Canvas 2D visualization matching the reference design.
 * Renders a lush circular canopy dome, sculpted organic wood trunk with cyan rim glow,
 * bright neon-green leaves, 5-petal pink cherry blossoms, and plump rose-red coffee cherries.
 */

(() => {
  'use strict';

  const SLOT_COORDINATES = [
    [0.26, 0.28], [0.38, 0.18], [0.50, 0.12], [0.62, 0.18],
    [0.74, 0.28], [0.18, 0.40], [0.32, 0.36], [0.68, 0.36],
    [0.82, 0.40], [0.44, 0.26], [0.28, 0.50], [0.72, 0.50],
    [0.56, 0.26], [0.14, 0.28], [0.86, 0.28], [0.34, 0.22],
    [0.66, 0.22], [0.50, 0.38], [0.22, 0.34], [0.78, 0.34],
    [0.40, 0.44], [0.60, 0.44], [0.22, 0.20], [0.78, 0.20],
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
      sparkles: createSparkleParticles(50),
      foliageClusters: generateFoliageClusters()
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

    function generateFoliageClusters() {
      // Generate dense leaf cluster positions that form the lush circular canopy dome
      const clusters = [];
      const count = 160;
      for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 0.05 + Math.sqrt(Math.random()) * 0.35;
        const xRel = 0.50 + Math.cos(angle) * dist * 1.05;
        const yRel = 0.32 + Math.sin(angle) * dist * 0.74;
        clusters.push({
          x: xRel,
          y: yRel,
          angle: angle + (Math.random() - 0.5) * 1.2,
          scale: 0.65 + Math.random() * 0.55,
          colorType: i % 4 // 0: dark forest, 1: rich green, 2: vibrant green, 3: neon highlight
        });
      }
      return clusters;
    }

    function drawTree(time) {
      const width = state.width;
      const height = state.height;
      const darkMode = document.documentElement.getAttribute('data-theme') === 'dark';
      context.clearRect(0, 0, width, height);

      const seconds = time / 1000;

      // 1. Dark charcoal presentation background & soft cyan radial glow
      drawAtmosphere(width, height, seconds);

      // 2. Base canopy background silhouette glow
      drawCanopyAura(width, height);

      // 3. Sculpted flared root base with cyan rim glow
      drawRoots(width, height, seconds);

      // 4. Central organic wood trunk with rich bark texture and cyan rim
      drawTrunk(width, height, seconds);

      // 5. Radial branching network forming the circular crown
      drawBranches(width, height, seconds);

      // 6. Lush dense canopy leaf clusters covering the dome
      drawLushCanopy(width, height, seconds);

      // 7. Interactive Community Elements (leaves, cherry blossoms, coffee cherries)
      state.orders.forEach((order, index) => {
        const phase = hashString(order.id) * 0.0001;
        const swayX = state.reducedMotion ? 0 : Math.sin(seconds * 0.7 + phase) * (1.8 + (index % 3) * 0.35);
        const swayY = state.reducedMotion ? 0 : Math.cos(seconds * 0.55 + phase) * 0.9;
        const x = order.x * width + swayX;
        const y = order.y * height + swayY;
        const interactive = order.id === state.hoveredId || order.id === state.selectedId;
        const searched = Boolean(state.searchQuery && order.displayName.toLocaleLowerCase().includes(state.searchQuery));
        const growth = getGrowthScale(order, time);
        const scale = growth * (interactive ? 1.35 : searched ? 1.22 : 1);

        order.screenX = x;
        order.screenY = y;
        order.hitRadius = 26 * Math.max(scale, 0.75);

        // Highlight ring if selected or searched
        if (searched || order.id === state.selectedId) {
          drawHighlight(x, y, order.type, darkMode, time);
        }

        // Render Community Element
        drawTreeElement(order, x, y, scale, darkMode);
      });

      if (state.hoveredId || state.selectedId) {
        showSelectedTooltip();
      }
    }

    function createSparkleParticles(count) {
      const particles = [];
      for (let i = 0; i < count; i += 1) {
        particles.push({
          xRel: 0.12 + Math.random() * 0.76,
          yRel: 0.12 + Math.random() * 0.76,
          speed: 0.05 + Math.random() * 0.12,
          size: 0.8 + Math.random() * 1.5,
          phase: Math.random() * Math.PI * 2,
          colorType: i % 3
        });
      }
      return particles;
    }

    function drawAtmosphere(width, height, seconds) {
      // Dark Charcoal Background
      const bgGrad = context.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#11141a');
      bgGrad.addColorStop(0.5, '#171b23');
      bgGrad.addColorStop(1, '#0e1014');
      context.fillStyle = bgGrad;
      context.fillRect(0, 0, width, height);

      // Central Soft Cyan/Teal Glow
      const centerX = width * 0.50;
      const centerY = height * 0.36;
      const aura = context.createRadialGradient(centerX, centerY, width * 0.02, centerX, centerY, width * 0.46);
      aura.addColorStop(0, 'rgba(0, 229, 255, 0.14)');
      aura.addColorStop(0.38, 'rgba(60, 240, 190, 0.07)');
      aura.addColorStop(0.75, 'rgba(255, 215, 0, 0.03)');
      aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = aura;
      context.fillRect(0, 0, width, height);

      // Outer Vignette
      const vignette = context.createRadialGradient(centerX, height * 0.5, width * 0.28, centerX, height * 0.5, width * 0.70);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.68)');
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);

      // Ground Base Shadow
      const groundY = height * 0.90;
      context.beginPath();
      context.ellipse(centerX, groundY + 4, width * 0.26, height * 0.035, 0, 0, Math.PI * 2);
      context.fillStyle = 'rgba(0, 0, 0, 0.65)';
      context.fill();

      // Floating Stardust Particles
      context.save();
      context.globalCompositeOperation = 'screen';
      state.sparkles.forEach((p) => {
        const floatY = state.reducedMotion ? 0 : Math.sin(seconds * p.speed * 1.5 + p.phase) * 8;
        const floatX = state.reducedMotion ? 0 : Math.cos(seconds * p.speed * 1.2 + p.phase) * 5;
        const px = width * p.xRel + floatX;
        const py = height * p.yRel + floatY;

        const twinkle = state.reducedMotion ? 0.6 : 0.25 + (Math.sin(seconds * 2.2 + p.phase) + 1) * 0.35;
        let colorStr = `rgba(0, 229, 255, ${twinkle})`;
        if (p.colorType === 1) colorStr = `rgba(255, 215, 0, ${twinkle * 0.9})`;
        else if (p.colorType === 2) colorStr = `rgba(100, 255, 218, ${twinkle})`;

        context.shadowColor = p.colorType === 1 ? '#ffd700' : '#00e5ff';
        context.shadowBlur = 6 + p.size * 2;
        context.fillStyle = colorStr;
        context.beginPath();
        context.arc(px, py, p.size, 0, Math.PI * 2);
        context.fill();
      });
      context.restore();
    }

    function drawCanopyAura(width, height) {
      // Soft green glow aura behind the entire circular canopy dome
      const centerX = width * 0.50;
      const centerY = height * 0.32;
      const canopyGlow = context.createRadialGradient(centerX, centerY, width * 0.05, centerX, centerY, width * 0.38);
      canopyGlow.addColorStop(0, 'rgba(57, 255, 20, 0.12)');
      canopyGlow.addColorStop(0.60, 'rgba(16, 185, 129, 0.06)');
      canopyGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      context.fillStyle = canopyGlow;
      context.beginPath();
      context.ellipse(centerX, centerY, width * 0.38, height * 0.28, 0, 0, Math.PI * 2);
      context.fill();
    }

    function drawRoots(width, height, seconds) {
      const rootList = [
        // Symmetrical left roots
        [[0.47, 0.86], [0.38, 0.90], [0.26, 0.93], [0.12, 0.93], 9.5, '#00e5ff'],
        [[0.48, 0.88], [0.42, 0.92], [0.34, 0.95], [0.24, 0.96], 6.5, '#64ffda'],
        [[0.49, 0.88], [0.46, 0.93], [0.41, 0.96], [0.36, 0.97], 4.5, '#ffd700'],
        // Symmetrical right roots
        [[0.53, 0.86], [0.62, 0.90], [0.74, 0.93], [0.88, 0.93], 9.5, '#00e5ff'],
        [[0.52, 0.88], [0.58, 0.92], [0.66, 0.95], [0.76, 0.96], 6.5, '#64ffda'],
        [[0.51, 0.88], [0.54, 0.93], [0.59, 0.96], [0.64, 0.97], 4.5, '#ffd700']
      ];

      context.save();
      context.lineCap = 'round';
      context.lineJoin = 'round';

      rootList.forEach(([start, cA, cB, end, w, glowColor]) => {
        // Cyan bioluminescent shadow glow
        context.shadowColor = glowColor;
        context.shadowBlur = 10;
        context.beginPath();
        context.moveTo(width * start[0], height * start[1]);
        context.bezierCurveTo(width * cA[0], height * cA[1], width * cB[0], height * cB[1], width * end[0], height * end[1]);
        context.strokeStyle = 'rgba(0, 229, 255, 0.35)';
        context.lineWidth = w + 4;
        context.stroke();
        context.shadowBlur = 0;

        // Dark Wood Core
        context.beginPath();
        context.moveTo(width * start[0], height * start[1]);
        context.bezierCurveTo(width * cA[0], height * cA[1], width * cB[0], height * cB[1], width * end[0], height * end[1]);
        context.strokeStyle = '#221915';
        context.lineWidth = w;
        context.stroke();

        // Cyan Edge Thread
        context.beginPath();
        context.moveTo(width * start[0], height * start[1]);
        context.bezierCurveTo(width * cA[0], height * cA[1], width * cB[0], height * cB[1], width * end[0], height * end[1]);
        context.strokeStyle = 'rgba(100, 255, 218, 0.8)';
        context.lineWidth = Math.max(1, w * 0.22);
        context.stroke();
      });

      context.restore();
    }

    function drawTrunk(width, height, seconds) {
      context.save();

      // Organic Mahogany Bark Fill
      const trunkGrad = context.createLinearGradient(width * 0.40, 0, width * 0.60, 0);
      trunkGrad.addColorStop(0, '#1c1411');
      trunkGrad.addColorStop(0.20, '#3d2a1d');
      trunkGrad.addColorStop(0.50, '#69482e');
      trunkGrad.addColorStop(0.80, '#3d2a1d');
      trunkGrad.addColorStop(1, '#1c1411');

      // Trunk Body with Soft Cyan Rim Glow
      context.shadowColor = '#00e5ff';
      context.shadowBlur = 14;

      context.beginPath();
      context.moveTo(width * 0.43, height * 0.88);
      context.bezierCurveTo(width * 0.455, height * 0.78, width * 0.468, height * 0.66, width * 0.476, height * 0.52);
      context.bezierCurveTo(width * 0.485, height * 0.36, width * 0.492, height * 0.24, width * 0.50, height * 0.10);
      context.bezierCurveTo(width * 0.508, height * 0.24, width * 0.515, height * 0.36, width * 0.524, height * 0.52);
      context.bezierCurveTo(width * 0.532, height * 0.66, width * 0.545, height * 0.78, width * 0.57, height * 0.88);
      context.bezierCurveTo(width * 0.52, height * 0.865, width * 0.48, height * 0.865, width * 0.43, height * 0.88);
      context.closePath();
      context.fillStyle = trunkGrad;
      context.fill();

      // Cyan Bioluminescent Rim Lines along Trunk Silhouette
      context.strokeStyle = 'rgba(0, 229, 255, 0.65)';
      context.lineWidth = 1.8;
      context.stroke();
      context.shadowBlur = 0;

      // Inner Glowing Stardust Threads
      const trunkVeins = [
        [[0.46, 0.84], [0.478, 0.70], [0.482, 0.54], [0.492, 0.28]],
        [[0.50, 0.86], [0.50, 0.68], [0.50, 0.50], [0.50, 0.14]],
        [[0.54, 0.84], [0.522, 0.70], [0.518, 0.54], [0.508, 0.28]]
      ];

      trunkVeins.forEach(([start, cA, cB, end], idx) => {
        context.beginPath();
        context.moveTo(width * start[0], height * start[1]);
        context.bezierCurveTo(width * cA[0], height * cA[1], width * cB[0], height * cB[1], width * end[0], height * end[1]);
        const isGold = idx === 1;
        context.shadowColor = isGold ? '#ffd700' : '#00e5ff';
        context.shadowBlur = 8;
        context.strokeStyle = isGold ? 'rgba(255, 230, 130, 0.65)' : 'rgba(100, 255, 218, 0.7)';
        context.lineWidth = isGold ? 1.8 : 1.4;
        context.stroke();
      });

      context.restore();
    }

    function drawBranches(width, height, seconds) {
      // Symmetrical Radial Branching Architecture
      const branchPairs = [
        // Primary Symmetrical Dome Canopy Split (Left & Right)
        [[0.50, 0.52], [0.38, 0.42], [0.26, 0.32], [0.14, 0.26], 10.5, '#00e5ff'],
        [[0.50, 0.52], [0.62, 0.42], [0.74, 0.32], [0.86, 0.26], 10.5, '#00e5ff'],

        // Primary Upper Crown Split (Left & Right)
        [[0.50, 0.52], [0.44, 0.36], [0.34, 0.22], [0.22, 0.16], 8.5, '#64ffda'],
        [[0.50, 0.52], [0.56, 0.36], [0.66, 0.22], [0.78, 0.16], 8.5, '#64ffda'],

        // Top Leader Crown (Left & Right)
        [[0.50, 0.45], [0.48, 0.28], [0.44, 0.18], [0.38, 0.10], 6.5, '#ffd700'],
        [[0.50, 0.45], [0.52, 0.28], [0.56, 0.18], [0.62, 0.10], 6.5, '#ffd700'],
        [[0.50, 0.35], [0.50, 0.22], [0.50, 0.14], [0.50, 0.08], 6.0, '#00e5ff'],

        // Mid-Lower Outer Arc Branches (Left & Right)
        [[0.50, 0.58], [0.36, 0.52], [0.24, 0.48], [0.12, 0.42], 8.0, '#00e5ff'],
        [[0.50, 0.58], [0.64, 0.52], [0.76, 0.48], [0.88, 0.42], 8.0, '#00e5ff'],

        // Sub-twigs filling out canopy structure
        [[0.38, 0.42], [0.30, 0.38], [0.24, 0.34], [0.18, 0.38], 5.0, '#64ffda'],
        [[0.62, 0.42], [0.70, 0.38], [0.76, 0.34], [0.82, 0.38], 5.0, '#64ffda'],

        [[0.44, 0.36], [0.38, 0.28], [0.32, 0.24], [0.26, 0.26], 4.5, '#00e5ff'],
        [[0.56, 0.36], [0.62, 0.28], [0.68, 0.24], [0.74, 0.26], 4.5, '#00e5ff'],

        [[0.36, 0.52], [0.30, 0.50], [0.26, 0.46], [0.22, 0.48], 4.0, '#ffd700'],
        [[0.64, 0.52], [0.70, 0.50], [0.74, 0.46], [0.78, 0.48], 4.0, '#ffd700']
      ];

      context.save();
      context.lineCap = 'round';
      context.lineJoin = 'round';

      branchPairs.forEach(([start, cA, cB, end, w, glowColor]) => {
        drawGlowBranch(width, height, start, cA, cB, end, w, glowColor);
      });

      context.restore();
    }

    function drawGlowBranch(width, height, start, cA, cB, end, lineWidth, glowColor) {
      const trace = () => {
        context.beginPath();
        context.moveTo(width * start[0], height * start[1]);
        context.bezierCurveTo(width * cA[0], height * cA[1], width * cB[0], height * cB[1], width * end[0], height * end[1]);
      };

      // Outer Cyan Glow
      context.save();
      context.shadowColor = glowColor;
      context.shadowBlur = 9;
      trace();
      context.strokeStyle = 'rgba(0, 229, 255, 0.22)';
      context.lineWidth = lineWidth + 3.5;
      context.stroke();
      context.shadowBlur = 0;

      // Dark Wood Core
      const branchGrad = context.createLinearGradient(width * start[0], height * start[1], width * end[0], height * end[1]);
      branchGrad.addColorStop(0, '#54371f');
      branchGrad.addColorStop(0.5, '#754d2a');
      branchGrad.addColorStop(1, '#362313');
      trace();
      context.strokeStyle = branchGrad;
      context.lineWidth = lineWidth;
      context.stroke();

      // Cyan Rim Line
      trace();
      context.strokeStyle = 'rgba(100, 255, 218, 0.70)';
      context.lineWidth = Math.max(0.7, lineWidth * 0.18);
      context.stroke();
      context.restore();
    }

    function drawLushCanopy(width, height, seconds) {
      // Render overlapping leaf clusters forming a lush circular foliage dome
      context.save();

      state.foliageClusters.forEach((c, idx) => {
        const sway = state.reducedMotion ? 0 : Math.sin(seconds * 0.65 + idx) * 1.2;
        const x = c.x * width + sway;
        const y = c.y * height;

        context.save();
        context.translate(x, y);
        context.rotate(c.angle);
        context.scale(c.scale, c.scale);

        context.shadowColor = '#39ff14';
        context.shadowBlur = 6;

        const leafGrad = context.createLinearGradient(-14, -9, 14, 9);
        if (c.colorType === 0) {
          leafGrad.addColorStop(0, '#2d8a4e');
          leafGrad.addColorStop(0.5, '#165b30');
          leafGrad.addColorStop(1, '#0b3d1f');
        } else if (c.colorType === 1) {
          leafGrad.addColorStop(0, '#46cb74');
          leafGrad.addColorStop(0.5, '#229e50');
          leafGrad.addColorStop(1, '#0e6430');
        } else if (c.colorType === 2) {
          leafGrad.addColorStop(0, '#75f09b');
          leafGrad.addColorStop(0.5, '#34d468');
          leafGrad.addColorStop(1, '#158c40');
        } else {
          leafGrad.addColorStop(0, '#a6ff73');
          leafGrad.addColorStop(0.5, '#39ff14');
          leafGrad.addColorStop(1, '#10b981');
        }

        context.beginPath();
        context.moveTo(-14, 0);
        context.bezierCurveTo(-8, -12, 8, -13, 15, -1);
        context.bezierCurveTo(8, 11, -8, 12, -14, 0);
        context.fillStyle = leafGrad;
        context.fill();

        context.strokeStyle = 'rgba(215, 255, 210, 0.55)';
        context.lineWidth = 0.75;
        context.stroke();

        context.restore();
      });

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
      // Bright neon-green leaf matching reference image
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
      // Leaf central vein & side veins
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
      // Glowing 5-petal pink cherry blossom matching reference image
      context.save();
      context.shadowColor = '#ff69b4';
      context.shadowBlur = 18;

      // 5 Rounded Pink Petals
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

      // Bright Yellow Stamen Center
      const centerGrad = context.createRadialGradient(-2, -2, 1, 0, 0, 8);
      centerGrad.addColorStop(0, '#ffeb3b');
      centerGrad.addColorStop(0.6, '#f57c00');
      centerGrad.addColorStop(1, '#e65100');

      context.beginPath();
      context.arc(0, 0, 7.5, 0, Math.PI * 2);
      context.fillStyle = centerGrad;
      context.fill();

      // Yellow Stamen Anthers
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
      // Oval rose-red coffee cherry matching reference image
      context.save();
      context.shadowColor = '#e60039';
      context.shadowBlur = 18;

      // Small 10px Green Stem connecting cherry to twig
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
      // Specular Glossy White Crescent Highlight Arc
      context.beginPath();
      context.ellipse(-4.5, -2, 2.5, 6, -0.40, 0, Math.PI * 2);
      context.fillStyle = 'rgba(255, 255, 255, 0.85)';
      context.fill();

      // Dark Bottom Calyx Tip
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
      context.shadowColor = '#00e5ff';
      context.shadowBlur = 18;
      context.beginPath();
      context.arc(x, y, baseRadius + pulse, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(0, 229, 255, 0.95)';
      context.lineWidth = 2.8;
      context.stroke();

      context.beginPath();
      context.arc(x, y, baseRadius + 7 + pulse * 0.45, 0, Math.PI * 2);
      context.strokeStyle = 'rgba(100, 255, 218, 0.4)';
      context.lineWidth = 1.4;
      context.stroke();

      // Orbiting Sparkles
      for (let i = 0; i < 4; i += 1) {
        const angle = time / 800 + i * Math.PI / 2;
        const sparkleX = x + Math.cos(angle) * (baseRadius + 9.5);
        const sparkleY = y + Math.sin(angle) * (baseRadius + 9.5);
        context.fillStyle = '#e0f7fa';
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
      return Math.min(0.92, Math.max(0.08, number));
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
