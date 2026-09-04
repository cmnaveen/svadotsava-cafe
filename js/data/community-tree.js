/**
 * Svādotsava - Community Tree preview data and integration configuration.
 * Sample display names are fictional preview data featuring Mahabharata and Ramayana epic characters.
 * Each order tier maps directly to the painted botanical elements on the tree:
 *   🍃 Leaf (Below ₹500)
 *   🌸 Blossom (₹500–₹1,000)
 *   🍒 Cherry (Above ₹1,000)
 */
window.SVADOTSAVA_COMMUNITY_TREE = {
  mode: "preview",
  apiUrl: "",
  pollIntervalMs: 60000,
  maxElements: 120,
  orders: [
    // 🍃 Leaves (Below ₹500) - mapped directly to painted green leaves
    { orderId: "preview-001", displayName: "Lakshmana", orderAmount: 420, timestamp: "2026-07-01T09:15:00.000Z", x: 0.16, y: 0.18 },
    { orderId: "preview-004", displayName: "Nakula", orderAmount: 360, timestamp: "2026-07-04T15:10:00.000Z", x: 0.945, y: 0.30 },
    { orderId: "preview-008", displayName: "Vidura", orderAmount: 320, timestamp: "2026-07-08T14:05:00.000Z", x: 0.035, y: 0.47 },
    { orderId: "preview-011", displayName: "Sahadeva", orderAmount: 480, timestamp: "2026-07-11T13:15:00.000Z", x: 0.965, y: 0.49 },
    { orderId: "preview-014", displayName: "Shatrughna", orderAmount: 490, timestamp: "2026-07-14T11:20:00.000Z", x: 0.525, y: 0.065 },

    // 🌸 Blossoms (₹500–₹1,000) - mapped directly to painted pink/white 5-petal flowers
    { orderId: "preview-002", displayName: "Sita", orderAmount: 950, timestamp: "2026-07-02T10:20:00.000Z", x: 0.375, y: 0.125 },
    { orderId: "preview-005", displayName: "Bharata", orderAmount: 900, timestamp: "2026-07-05T16:25:00.000Z", x: 0.64, y: 0.125 },
    { orderId: "preview-007", displayName: "Draupadi", orderAmount: 880, timestamp: "2026-07-07T11:45:00.000Z", x: 0.21, y: 0.23 },
    { orderId: "preview-010", displayName: "Karna", orderAmount: 1000, timestamp: "2026-07-10T09:55:00.000Z", x: 0.83, y: 0.235 },
    { orderId: "preview-013", displayName: "Subhadra", orderAmount: 750, timestamp: "2026-07-13T09:10:00.000Z", x: 0.50, y: 0.21 },
    { orderId: "preview-016", displayName: "Urmila", orderAmount: 640, timestamp: "2026-07-16T16:00:00.000Z", x: 0.21, y: 0.375 },
    { orderId: "preview-017", displayName: "Kunti", orderAmount: 850, timestamp: "2026-07-17T17:40:00.000Z", x: 0.735, y: 0.505 },

    // 🍒 Cherries (Above ₹1,000) - mapped directly to painted hanging red cherries
    { orderId: "preview-003", displayName: "Arjuna", orderAmount: 1250, timestamp: "2026-07-03T12:40:00.000Z", x: 0.39, y: 0.185 },
    { orderId: "preview-006", displayName: "Bhima", orderAmount: 1460, timestamp: "2026-07-06T08:35:00.000Z", x: 0.68, y: 0.215 },
    { orderId: "preview-009", displayName: "Yudhisthira", orderAmount: 1100, timestamp: "2026-07-09T17:30:00.000Z", x: 0.298, y: 0.24 },
    { orderId: "preview-012", displayName: "Abhimanyu", orderAmount: 1350, timestamp: "2026-07-12T18:05:00.000Z", x: 0.778, y: 0.32 },
    { orderId: "preview-015", displayName: "Hanuman", orderAmount: 1600, timestamp: "2026-07-15T14:50:00.000Z", x: 0.922, y: 0.38 },
    { orderId: "preview-018", displayName: "Rama", orderAmount: 1500, timestamp: "2026-07-18T19:15:00.000Z", x: 0.545, y: 0.488 }
  ]
};
