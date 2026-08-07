/**
 * Svādotsava - Artisanal Recipe Data
 * ------------------------------------------------------------------
 * Complete step-by-step master guides for Svādotsava pizza recipes.
 */
window.SVADOTSAVA_DATA_RECIPES = {
  "sourdough-pizza": {
    "id": "sourdough-pizza",
    "title": "The Ultimate Sourdough Pizza Dough Guide",
    "tagline": "Master the art of artisan sourdough pizza at home",
    "meta": {
      "yield": "4 Pizzas (11–12 inches / 28–30 cm)",
      "totalTime": "48 Hours (Cold Fermented)",
      "difficulty": "Master Artisan",
      "author": "Svādotsava Baking Educators"
    },
    "intro": "Based on techniques consistently recommended by experienced sourdough bakers, pizza professionals, and baking educators, adapted for a home oven. This guide explains what to do, why you're doing it, what the dough should look like, common mistakes, and how to fix them.",
    "formula": {
      "totalWeight": "1135 g",
      "rows": [
        { "ingredient": "Bread Flour (12–13% protein)", "weight": "420 g", "bakersPct": "70%" },
        { "ingredient": "Tipo 00 Flour", "weight": "180 g", "bakersPct": "30%" },
        { "ingredient": "Water", "weight": "390 g", "bakersPct": "65%" },
        { "ingredient": "Active Starter (100% hydration)", "weight": "120 g", "bakersPct": "20%" },
        { "ingredient": "Fine Sea Salt", "weight": "15 g", "bakersPct": "2.5%" },
        { "ingredient": "Olive Oil (optional)", "weight": "10 g", "bakersPct": "1.7%" }
      ]
    },
    "equipment": [
      "Kitchen Scale", "Large Mixing Bowl", "Bench Scraper",
      "Dough Containers", "Pizza Steel or Pizza Stone", "Infrared Thermometer"
    ],
    "beforeYouStart": {
      "title": "Before You Start: Starter Health",
      "note": "The starter is the heart of the dough.",
      "idealSigns": ["Doubled or tripled in volume", "Bubbly and active throughout", "Airy, domed top", "Pleasant smelling, slightly sweet and milky"],
      "avoidSigns": ["Collapsed top", "Overly sour or harsh smelling", "Liquid/hooch forming on surface", "Smelling like pungent vinegar"]
    },
    "steps": [
      {
        "number": 1,
        "title": "Feed the Starter",
        "ingredients": ["30 g starter", "60 g water", "60 g bread flour"],
        "instructions": "Mix well in a clean jar. Cover loosely and leave at 24–26°C for 4–6 hours until peak is reached.",
        "signsReady": ["Doubled in volume", "Domed top with active bubbles", "Smells like fresh yogurt", "Passes float test in water"],
        "why": "Yeast activity is highest during peak rise. Using starter before peak causes slow fermentation; using after collapse yields weak dough."
      },
      {
        "number": 2,
        "title": "Prepare the Water",
        "ingredients": ["390 g water at 22–24°C"],
        "instructions": "Measure water carefully. Never use hot water (damages yeast) or very cold water (stalls fermentation).",
        "why": "Water temperature directly sets the dough's desired final temperature (24°C)."
      },
      {
        "number": 3,
        "title": "Mix Flour + Water (Autolyse)",
        "ingredients": ["600 g flour blend (420g Bread + 180g Tipo 00)", "360 g water"],
        "instructions": "Combine flour and 360g water (reserve 30g). Mix until no dry flour remains. Cover and rest for 30 minutes. Do NOT add starter, salt, or knead yet.",
        "doughAppearance": "Rough, shaggy, lumpy — that's perfect.",
        "why": "Flour absorbs water, proteins begin forming gluten naturally, and enzymes break starches into sugars without physical kneading."
      },
      {
        "number": 4,
        "title": "Add Starter",
        "ingredients": ["120 g active starter", "Remaining 30 g water"],
        "instructions": "Spread starter over autolysed dough, add remaining 30g water. Pinch, fold, stretch, and squeeze for 3–5 minutes until fully incorporated.",
        "doughAppearance": "Initially slimy, sticky, messy. After several minutes becomes smooth, elastic, and slightly sticky."
      },
      {
        "number": 5,
        "title": "Add Salt & Optional Olive Oil",
        "ingredients": ["15 g fine sea salt", "10 g olive oil (optional)"],
        "instructions": "Sprinkle salt over dough. Mix for 2–3 minutes. If using olive oil, incorporate after salt.",
        "why": "Salt strengthens gluten and regulates fermentation. Olive oil adds tenderness, richness, and aids home oven browning."
      },
      {
        "number": 6,
        "title": "Rest 20 Minutes",
        "instructions": "Cover bowl and rest dough for 20 minutes at room temperature.",
        "why": "Relaxes dough structure so gluten can stretch without tearing during subsequent folds."
      },
      {
        "number": 7,
        "title": "Stretch & Fold (4 Sets)",
        "instructions": "Perform 4 sets spaced 30 minutes apart. Wet hands, reach under dough, stretch upward gently, fold over center. Rotate bowl 90 degrees and repeat 4 times per set.",
        "doughProgress": "Fold 1: Loose, tears easily -> Fold 2: Smoother, holds shape -> Fold 3: Stronger, resists stretch -> Fold 4: Smooth, elastic, holds dome shape.",
        "why": "Builds gluten strength without heavy kneading, aligning protein strands and trapping gas bubbles."
      },
      {
        "number": 8,
        "title": "Bulk Fermentation",
        "instructions": "Cover bowl and leave at room temperature (22–25°C) for 3–5 hours after final fold.",
        "signsReady": ["Grown 40–50% larger", "Surface shows small bubbles", "Dough feels light, airy, jiggly when shaken", "Edges slightly domed"],
        "warning": "Do not let dough double in size during bulk fermentation — over-proofed dough becomes weak and tears easily."
      },
      {
        "number": 9,
        "title": "Divide Dough",
        "instructions": "Turn dough onto un-floured counter. Use bench scraper to divide into 4 equal portions (approx. 280 g each). Do NOT punch down dough.",
        "why": "Preserves gas pockets formed during bulk fermentation."
      },
      {
        "number": 10,
        "title": "Shape Dough Balls",
        "instructions": "Fold edges of each dough piece into center. Flip upside down. Cup hands around dough ball and pull toward you across un-floured counter to build surface tension. Repeat until smooth and round.",
        "why": "Surface tension holds shape during cold proofing and aids puffing during baking."
      },
      {
        "number": 11,
        "title": "Cold Fermentation (48 Hours)",
        "instructions": "Place dough balls into lightly oiled individual containers or proofing box. Cover tightly and refrigerate at 4°C for 48 hours.",
        "why": "Slow cold fermentation produces deep complex flavor, superior digestibility, dark leopard browning, and relaxed handling."
      },
      {
        "number": 12,
        "title": "Bring to Room Temperature",
        "instructions": "Remove dough from refrigerator 2–3 hours before baking. Keep covered.",
        "signsReady": [
          "Soft, puffy, warm to touch, stretches effortlessly",
          "If dough springs back immediately, rest another 30–60 mins"
        ]
      },
      {
        "number": 13,
        "title": "Preheat Oven & Pizza Steel/Stone",
        "instructions": "Place pizza steel or stone on upper rack. Preheat oven to maximum temperature (250–290°C / 475–550°F) for 45–60 minutes prior to baking.",
        "why": "A fully saturated thermal mass delivers immediate intense bottom heat essential for crispness."
      },
      {
        "number": 14,
        "title": "Stretch Dough",
        "instructions": "Turn dough ball onto lightly floured surface. Press center gently outward leaving a 2 cm (3/4 inch) unpressed rim. Lift dough, rest on knuckles, and let gravity stretch it to 11–12 inches.",
        "warning": "NEVER use a rolling pin — it crushes the delicate internal gas bubbles."
      },
      {
        "number": 15,
        "title": "Add Toppings",
        "instructions": "Top pizza lightly according to selected variant (Garden Veg or Tandoori Chicken). Keep toppings balanced so center crust stays crisp.",
        "baseRatio": {
          "sauce": "70–90 g tomato sauce",
          "mozzarella": "90–100 g fresh mozzarella (drained & patted dry)",
          "parmesan": "10–15 g grated Parmesan/Pecorino",
          "basil": "5–8 fresh basil leaves",
          "oil": "1 tsp Extra Virgin Olive Oil"
        }
      },
      {
        "number": 16,
        "title": "Bake & Serve",
        "instructions": "Slide pizza onto preheated steel/stone. Bake 6–9 minutes (home oven) or 60–90 seconds (pizza oven) until crust shows leopard spotting and cheese bubbles.",
        "finishedCharacteristics": [
          "Leopard spotting (charred spots) on crust rim",
          "Crisp bottom crust with micro-blisters",
          "Airy, open cornicione (rim) structure",
          "Soft, tender chew inside"
        ]
      }
    ],
    "variantToppings": {
      "m27": {
        "pizzaName": "Garden Vegetable Sourdough Pizza (Vegetarian)",
        "sauce": "70 g organic tomato sauce",
        "cheese": "90 g fresh mozzarella & 15g shaved Parmesan",
        "toppings": ["Roasted bell peppers", "Sautéed wild mushrooms", "Cherry tomatoes", "Kalamata olives", "Fresh basil & EVOO"],
        "chefTip": "Pre-roast peppers and drain mozzarella thoroughly to keep crust crisp."
      },
      "m28": {
        "pizzaName": "Tandoori Chicken Sourdough Pizza (Non-Vegetarian)",
        "sauce": "70 g spiced tomato makhani base",
        "cheese": "90 g fresh mozzarella",
        "toppings": ["80–100 g charcoal-grilled chicken tikka", "Thinly sliced red onions & bell peppers", "Fresh coriander", "Cooling mint-yogurt drizzle"],
        "chefTip": "Drizzle garlic-mint yogurt after bake so it melts into warm spices."
      }
    },
    "troubleshooting": [
      { "problem": "Dough too sticky", "cause": "High water ratio or weak flour", "solution": "Wet hands while folding; use strong unbleached bread flour." },
      { "problem": "Tears during stretching", "cause": "Gluten underdeveloped", "solution": "Perform more folds and allow longer rest." },
      { "problem": "Pale crust", "cause": "Oven steel not preheated long enough", "solution": "Preheat steel for 60 mins at max temp." }
    ],
    "schedule": {
      "title": "Sample 48-Hour Baking Schedule",
      "days": [
        { "day": "Friday", "timeline": [{ "time": "8:00 AM", "task": "Feed starter" }, { "time": "1:00 PM", "task": "Autolyse" }, { "time": "2:00 PM", "task": "Mix & Fold" }, { "time": "7:15 PM", "task": "Refrigerate for 48 hrs" }] },
        { "day": "Sunday", "timeline": [{ "time": "4:00 PM", "task": "Bring to room temp" }, { "time": "5:00 PM", "task": "Preheat oven steel" }, { "time": "6:00 PM", "task": "Bake & enjoy" }] }
      ]
    }
  }
};
