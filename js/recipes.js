/**
 * Svādotsava - Interactive Artisanal Recipe Guide System
 * ------------------------------------------------------------------
 * Renders rich, interactive master baking guides & recipe modals.
 */

(() => {
  'use strict';

  document.addEventListener('DOMContentLoaded', initRecipesSystem);

  function initRecipesSystem() {
    const RECIPES_DATA = window.SVADOTSAVA_DATA_RECIPES || {};
    let currentRecipe = null;
    let currentVariantId = null;
    let activeTab = 'formula';
    let modalReturnFocus = null;

    // Create Modal HTML Structure in DOM if not present
    let modalOverlay = document.getElementById('recipe-modal-overlay');
    if (!modalOverlay) {
      modalOverlay = document.createElement('div');
      modalOverlay.id = 'recipe-modal-overlay';
      modalOverlay.className = 'recipe-modal-overlay';
      modalOverlay.setAttribute('role', 'dialog');
      modalOverlay.setAttribute('aria-modal', 'true');
      modalOverlay.setAttribute('aria-labelledby', 'recipe-modal-title');
      document.body.appendChild(modalOverlay);
    }

    // Delegate clicks for Recipe Trigger Buttons
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('.btn-recipe-trigger');
      if (btn) {
        event.preventDefault();
        const recipeId = btn.getAttribute('data-recipe-id');
        const variantId = btn.getAttribute('data-variant-id');
        openRecipeModal(recipeId, variantId, btn);
      }
    });

    // Public API
    window.SvadotsavaRecipes = {
      open: (recipeId, variantId) => openRecipeModal(recipeId, variantId, document.activeElement)
    };

    function openRecipeModal(recipeId, variantId, triggerElement) {
      const data = RECIPES_DATA[recipeId || 'sourdough-pizza'];
      if (!data) {
        console.warn(`Recipe "${recipeId}" not found.`);
        return;
      }

      currentRecipe = data;
      currentVariantId = variantId || 'm27';
      activeTab = 'formula';
      modalReturnFocus = triggerElement || document.activeElement;

      buildRecipeModalDOM();
      modalOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      const closeBtn = modalOverlay.querySelector('#recipe-modal-close');
      closeBtn?.focus();

      // Keyboard Trap & Escape Listener
      document.addEventListener('keydown', handleRecipeModalKeydown);
    }

    function closeRecipeModal() {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleRecipeModalKeydown);

      if (modalReturnFocus && typeof modalReturnFocus.focus === 'function') {
        modalReturnFocus.focus();
      }
      modalReturnFocus = null;
    }

    function handleRecipeModalKeydown(event) {
      if (event.key === 'Escape') {
        closeRecipeModal();
        return;
      }
      if (event.key === 'Tab') {
        const focusables = [...modalOverlay.querySelectorAll(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), a[href]'
        )].filter(el => el.offsetWidth > 0 || el.offsetHeight > 0);

        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    function switchTab(tabKey) {
      activeTab = tabKey;

      // Update Tab Buttons
      const tabButtons = modalOverlay.querySelectorAll('.recipe-tab-btn');
      tabButtons.forEach(btn => {
        const isSelected = btn.getAttribute('data-tab') === tabKey;
        btn.classList.toggle('active', isSelected);
        btn.setAttribute('aria-selected', String(isSelected));
        if (isSelected) {
          btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });

      // Update Tab Panes
      const tabPanes = modalOverlay.querySelectorAll('.recipe-tab-pane');
      tabPanes.forEach(pane => {
        const isActive = pane.getAttribute('data-pane') === tabKey;
        pane.classList.toggle('active', isActive);
      });

      // Scroll modal body to top on tab switch
      const modalBody = modalOverlay.querySelector('.recipe-modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    }

    function buildRecipeModalDOM() {
      if (!currentRecipe) return;

      const variant = currentRecipe.variantToppings[currentVariantId] || currentRecipe.variantToppings['m27'];

      modalOverlay.innerHTML = `
        <div class="recipe-modal-card">
          <!-- Modal Header Banner -->
          <div class="recipe-modal-header">
            <div class="recipe-modal-header-top">
              <div class="recipe-badges-row">
                <span class="badge badge-gold">✨ ${currentRecipe.meta.difficulty}</span>
                <span class="badge badge-forest">⏱️ ${currentRecipe.meta.totalTime}</span>
                <span class="badge badge-gold">🍕 ${currentRecipe.meta.yield}</span>
              </div>
              <button type="button" class="recipe-modal-close" id="recipe-modal-close" aria-label="Close Recipe Guide">✕</button>
            </div>

            <h2 class="recipe-modal-title" id="recipe-modal-title">${currentRecipe.title}</h2>
            <p class="recipe-modal-subtitle">${currentRecipe.tagline}</p>
            <div class="recipe-variant-tag" id="recipe-variant-indicator">
              📍 <strong>Selected Variant:</strong> ${variant.pizzaName}
            </div>
          </div>

          <!-- Recipe Navigation Tabs -->
          <div class="recipe-nav-tabs" role="tablist" aria-label="Recipe Navigation Tabs">
            <button type="button" class="recipe-tab-btn ${activeTab === 'formula' ? 'active' : ''}" data-tab="formula" role="tab" aria-selected="${activeTab === 'formula'}">
              <span class="tab-icon">📋</span> Formula & Prep
            </button>
            <button type="button" class="recipe-tab-btn ${activeTab === 'steps' ? 'active' : ''}" data-tab="steps" role="tab" aria-selected="${activeTab === 'steps'}">
              <span class="tab-icon">🍕</span> 16-Step Bake Guide
            </button>
            <button type="button" class="recipe-tab-btn ${activeTab === 'toppings' ? 'active' : ''}" data-tab="toppings" role="tab" aria-selected="${activeTab === 'toppings'}">
              <span class="tab-icon">🍅</span> Toppings & Assembly
            </button>
            <button type="button" class="recipe-tab-btn ${activeTab === 'troubleshooting' ? 'active' : ''}" data-tab="troubleshooting" role="tab" aria-selected="${activeTab === 'troubleshooting'}">
              <span class="tab-icon">🛠️</span> Troubleshooting & Schedule
            </button>
          </div>

          <!-- Modal Body Content with all 4 panes -->
          <div class="recipe-modal-body">
            <!-- Pane 1: Formula & Prep -->
            <div class="recipe-tab-pane ${activeTab === 'formula' ? 'active' : ''}" data-pane="formula">
              ${renderFormulaPane()}
            </div>

            <!-- Pane 2: 16-Step Bake Guide -->
            <div class="recipe-tab-pane ${activeTab === 'steps' ? 'active' : ''}" data-pane="steps">
              ${renderStepsPane()}
            </div>

            <!-- Pane 3: Toppings & Assembly -->
            <div class="recipe-tab-pane ${activeTab === 'toppings' ? 'active' : ''}" data-pane="toppings" id="pane-toppings">
              ${renderToppingsPane(variant)}
            </div>

            <!-- Pane 4: Troubleshooting & Timeline -->
            <div class="recipe-tab-pane ${activeTab === 'troubleshooting' ? 'active' : ''}" data-pane="troubleshooting">
              ${renderTroubleshootingPane()}
            </div>
          </div>

          <!-- Modal Footer Actions -->
          <div class="recipe-modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-copy-ingredients">
              📋 Copy Ingredients
            </button>
            <button type="button" class="btn btn-gold btn-sm" id="btn-print-recipe">
              🖨️ Print Master Recipe
            </button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-close-bottom">
              Done Baking
            </button>
          </div>
        </div>
      `;

      // Header Close Listeners
      modalOverlay.querySelector('#recipe-modal-close')?.addEventListener('click', closeRecipeModal);
      modalOverlay.querySelector('#btn-close-bottom')?.addEventListener('click', closeRecipeModal);
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeRecipeModal();
      });

      // Tab Switching Click Listeners
      modalOverlay.querySelectorAll('.recipe-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const tabKey = btn.getAttribute('data-tab');
          switchTab(tabKey);
        });
      });

      // Action Listeners
      modalOverlay.querySelector('#btn-copy-ingredients')?.addEventListener('click', () => {
        const v = currentRecipe.variantToppings[currentVariantId] || currentRecipe.variantToppings['m27'];
        copyIngredientsToClipboard(v);
      });

      modalOverlay.querySelector('#btn-print-recipe')?.addEventListener('click', () => {
        window.print();
      });

      // Step Checkboxes
      modalOverlay.querySelectorAll('.recipe-step-checkbox').forEach(chk => {
        chk.addEventListener('change', (e) => {
          const card = e.target.closest('.recipe-step-card');
          if (card) card.classList.toggle('step-completed', e.target.checked);
        });
      });
    }

    function renderFormulaPane() {
      return `
        <div class="pane-inner animated-fade-in">
          <p class="recipe-intro-text">${currentRecipe.intro}</p>

          <div class="recipe-grid-two-col">
            <!-- Formula Table -->
            <div class="recipe-box">
              <h3 class="recipe-box-title">⚖️ Baker's Dough Formula</h3>
              <p class="recipe-box-sub">Makes ${currentRecipe.meta.yield} (${currentRecipe.formula.totalWeight} total weight)</p>
              <div class="table-responsive">
                <table class="recipe-formula-table">
                  <thead>
                    <tr>
                      <th>Ingredient</th>
                      <th style="text-align: right;">Weight</th>
                      <th style="text-align: right;">Baker's %</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${currentRecipe.formula.rows.map(r => `
                      <tr>
                        <td><strong>${r.ingredient}</strong></td>
                        <td style="text-align: right;">${r.weight}</td>
                        <td style="text-align: right;"><span class="badge badge-gold-sm">${r.bakersPct}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Equipment Needed -->
            <div class="recipe-box">
              <h3 class="recipe-box-title">🥣 Recommended Equipment</h3>
              <ul class="recipe-checklist">
                ${currentRecipe.equipment.map(eq => `
                  <li><span class="chk-icon">✓</span> ${eq}</li>
                `).join('')}
              </ul>
            </div>
          </div>

          <!-- Starter Readiness Check -->
          <div class="recipe-box recipe-box-highlight" style="margin-top: 1.5rem;">
            <h3 class="recipe-box-title">${currentRecipe.beforeYouStart.title}</h3>
            <p style="font-size: 0.92rem; color: var(--text-medium); margin-bottom: 1rem;">
              ${currentRecipe.beforeYouStart.note}
            </p>
            <div class="recipe-grid-two-col">
              <div>
                <h4 style="color: var(--accent-forest-green); font-size: 0.95rem; margin-bottom: 0.5rem;">✅ Your Starter Should Be:</h4>
                <ul class="recipe-bullets">
                  ${currentRecipe.beforeYouStart.idealSigns.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>
              <div>
                <h4 style="color: var(--accent-burnt-orange); font-size: 0.95rem; margin-bottom: 0.5rem;">❌ Not:</h4>
                <ul class="recipe-bullets">
                  ${currentRecipe.beforeYouStart.avoidSigns.map(s => `<li>${s}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function renderStepsPane() {
      return `
        <div class="pane-inner animated-fade-in">
          <div class="recipe-steps-header">
            <h3>🍕 16-Step Master Baking Workflow</h3>
            <p>Check off steps as you bake to keep track of your progress!</p>
          </div>

          <div class="recipe-steps-list">
            ${currentRecipe.steps.map(step => `
              <div class="recipe-step-card">
                <div class="recipe-step-header">
                  <label class="recipe-step-label">
                    <input type="checkbox" class="recipe-step-checkbox" />
                    <span class="step-num-badge">Step ${step.number}</span>
                    <span class="step-title-text">${step.title}</span>
                  </label>
                </div>

                ${step.ingredients ? `
                  <div class="step-ingredients-pills">
                    ${step.ingredients.map(ing => `<span class="ing-pill">🔹 ${ing}</span>`).join('')}
                  </div>
                ` : ''}

                <p class="step-instructions">${step.instructions}</p>

                ${step.doughAppearance ? `
                  <div class="step-info-box step-info-appearance">
                    <strong>👀 Dough Appearance:</strong> ${step.doughAppearance}
                  </div>
                ` : ''}

                ${step.doughProgress ? `
                  <div class="step-info-box step-info-progress">
                    <strong>📈 Dough Progress:</strong> ${step.doughProgress}
                  </div>
                ` : ''}

                ${step.signsReady ? `
                  <div class="step-info-box step-info-ready">
                    <strong>✓ Signs it's Ready:</strong> ${Array.isArray(step.signsReady) ? step.signsReady.join(' • ') : step.signsReady}
                  </div>
                ` : ''}

                ${step.why ? `
                  <div class="step-info-box step-info-why">
                    <strong>💡 Why this works:</strong> ${step.why}
                  </div>
                ` : ''}

                ${step.test ? `
                  <div class="step-info-box step-info-test">
                    <strong>🧪 Test:</strong> ${step.test}
                  </div>
                ` : ''}

                ${step.warning ? `
                  <div class="step-info-box step-info-warning">
                    <strong>⚠️ Important Warning:</strong> ${step.warning}
                  </div>
                ` : ''}

                ${step.finishedCharacteristics ? `
                  <div class="step-info-box step-info-finish">
                    <strong>✨ Characteristics of Finished Crust:</strong>
                    <ul>${(Array.isArray(step.finishedCharacteristics) ? step.finishedCharacteristics : [step.finishedCharacteristics]).map(c => `<li>✓ ${c}</li>`).join('')}</ul>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    function renderToppingsPane(variant) {
      return `
        <div class="pane-inner animated-fade-in">
          <div class="recipe-box recipe-box-highlight">
            <h3 class="recipe-box-title">🍕 Selected Pizza: ${variant.pizzaName}</h3>
            <p style="font-size: 0.95rem; margin-bottom: 1.25rem; color: var(--text-medium);">
              Tailored topping distribution for optimum crust rise, crispness, and flavor balance.
            </p>

            <div class="recipe-grid-two-col">
              <div>
                <h4 style="color: var(--heading-color); font-size: 1rem; margin-bottom: 0.75rem;">🍅 Sauce & Base Cheese Ratio (Per Pizza):</h4>
                <ul class="recipe-bullets">
                  <li><strong>Tomato Sauce:</strong> ${variant.sauce}</li>
                  <li><strong>Cheese:</strong> ${variant.cheese}</li>
                  <li><strong>Olive Oil:</strong> 1 tsp Extra Virgin Olive Oil drizzle</li>
                </ul>
              </div>

              <div>
                <h4 style="color: var(--heading-color); font-size: 1rem; margin-bottom: 0.75rem;">🥗 Specific Toppings Assembly:</h4>
                <ul class="recipe-bullets">
                  ${variant.toppings.map(t => `<li><strong>${t}</strong></li>`).join('')}
                </ul>
              </div>
            </div>

            <div class="step-info-box step-info-why" style="margin-top: 1.25rem;">
              <strong>👨‍🍳 Master Chef Tip:</strong> ${variant.chefTip}
            </div>
          </div>

          <!-- Variant Switcher Card -->
          <div class="recipe-box" style="margin-top: 1.5rem;">
            <h3 class="recipe-box-title">🌿 Switch Pizza Toppings Variant</h3>
            <div class="recipe-variant-switcher">
              <button type="button" class="btn btn-secondary ${currentVariantId === 'm27' ? 'active-variant' : ''}" id="switch-veg">
                🌱 Garden Vegetable Pizza (Veg)
              </button>
              <button type="button" class="btn btn-secondary ${currentVariantId === 'm28' ? 'active-variant' : ''}" id="switch-nonveg">
                🍗 Tandoori Chicken Pizza (Non-Veg)
              </button>
            </div>
          </div>
        </div>
      `;
    }

    function renderTroubleshootingPane() {
      return `
        <div class="pane-inner animated-fade-in">
          <div class="recipe-box">
            <h3 class="recipe-box-title">🛠️ Common Problems & Fixes</h3>
            <p style="font-size: 0.9rem; color: var(--text-medium); margin-bottom: 1rem;">
              Troubleshoot any dough or bake issues with solutions tested by professional bakers.
            </p>
            <div class="table-responsive">
              <table class="recipe-trouble-table">
                <thead>
                  <tr>
                    <th>Problem</th>
                    <th>Likely Cause</th>
                    <th>Solution</th>
                  </tr>
                </thead>
                <tbody>
                  ${currentRecipe.troubleshooting.map(item => `
                    <tr>
                      <td style="font-weight: 700; color: var(--accent-burnt-orange);">${item.problem}</td>
                      <td style="color: var(--text-medium);">${item.cause}</td>
                      <td style="color: var(--heading-color); font-weight: 500;">${item.solution}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          </div>

          <!-- 48-Hour Sample Schedule -->
          <div class="recipe-box" style="margin-top: 1.5rem;">
            <h3 class="recipe-box-title">📅 ${currentRecipe.schedule.title}</h3>
            <div class="recipe-schedule-grid">
              ${currentRecipe.schedule.days.map(day => `
                <div class="schedule-day-card">
                  <h4 class="schedule-day-title">${day.day}</h4>
                  <ul class="schedule-timeline">
                    ${day.timeline.map(t => `
                      <li>
                        <span class="schedule-time">${t.time}</span>
                        <span class="schedule-task">${t.task}</span>
                      </li>
                    `).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    function copyIngredientsToClipboard(variant) {
      if (!currentRecipe) return;

      const lines = [
        `=== ${currentRecipe.title} ===`,
        `Formula (${currentRecipe.formula.totalWeight}):`,
        ...currentRecipe.formula.rows.map(r => `- ${r.ingredient}: ${r.weight} (${r.bakersPct})`),
        ``,
        `Selected Pizza Variant: ${variant.pizzaName}`,
        `- Sauce: ${variant.sauce}`,
        `- Cheese: ${variant.cheese}`,
        `Toppings:`,
        ...variant.toppings.map(t => `- ${t}`),
        ``,
        `Guide from Svādotsava Café`
      ];

      const text = lines.join('\n');
      navigator.clipboard.writeText(text).then(() => {
        const toast = document.getElementById('toast-msg');
        if (toast) {
          toast.textContent = "📋 Formula & ingredients copied to clipboard!";
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 3000);
        }
      }).catch(err => {
        console.error("Clipboard copy failed:", err);
      });
    }

    // Event Delegation for Variant Switcher inside toppings pane
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'switch-veg') {
        currentVariantId = 'm27';
        updateToppingPane();
      }
      if (e.target && e.target.id === 'switch-nonveg') {
        currentVariantId = 'm28';
        updateToppingPane();
      }
    });

    function updateToppingPane() {
      const variant = currentRecipe.variantToppings[currentVariantId] || currentRecipe.variantToppings['m27'];
      const indicator = modalOverlay.querySelector('#recipe-variant-indicator');
      if (indicator) {
        indicator.innerHTML = `📍 <strong>Selected Variant:</strong> ${variant.pizzaName}`;
      }
      const pane = modalOverlay.querySelector('#pane-toppings');
      if (pane) {
        pane.innerHTML = renderToppingsPane(variant);
      }
    }
  }
})();
