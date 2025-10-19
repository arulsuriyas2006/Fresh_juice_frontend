export const products = [
  {
    id: 1,
    name: "Classic Orange Juice",
    description: "Pure, fresh-squeezed orange juice. No additives, just pure goodness.",
    price: 89,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop",
    category: "Classic",
    popular: true,
    features: ["100% Natural", "No Sugar Added", "Fresh Squeezed"],
    preparation: {
      ingredients: ["Fresh oranges (4-5 pieces)", "No additives"],
      steps: [
        "Select premium quality oranges",
        "Wash and sanitize the oranges thoroughly",
        "Cut oranges in half",
        "Extract juice using cold-press method",
        "Filter to remove seeds (keeping natural pulp)",
        "Serve immediately for maximum freshness"
      ],
      time: "5 minutes",
      servingSize: "500ml bottle",
      nutritionHighlights: ["Rich in Vitamin C", "Natural antioxidants", "Zero preservatives"]
    }
  },
  {
    id: 2,
    name: "Pulp Delight",
    description: "Extra pulpy orange juice for those who love the real fruit texture.",
    price: 99,
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&h=500&fit=crop",
    category: "Premium",
    popular: true,
    features: ["Extra Pulp", "Rich Texture", "Vitamin C Boost"],
    preparation: {
      ingredients: ["Fresh oranges (5-6 pieces)", "Extra pulp retained"],
      steps: [
        "Select juicy, ripe oranges",
        "Thoroughly wash and sanitize",
        "Hand-squeeze to retain maximum pulp",
        "Minimal filtering for extra texture",
        "Stir well to distribute pulp evenly",
        "Bottle immediately to preserve freshness"
      ],
      time: "7 minutes",
      servingSize: "500ml bottle",
      nutritionHighlights: ["High fiber content", "Extra Vitamin C", "Natural fruit texture"]
    }
  },
  {
    id: 3,
    name: "Vitamin Boost",
    description: "Fortified with extra vitamins and minerals for your daily health needs.",
    price: 119,
    image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&h=500&fit=crop",
    category: "Premium",
    popular: true,
    features: ["Vitamin Fortified", "Immunity Boost", "Energy Plus"],
    preparation: {
      ingredients: ["Fresh oranges (4-5 pieces)", "Vitamin C supplement", "Zinc", "B-complex vitamins"],
      steps: [
        "Extract fresh orange juice using cold-press",
        "Add pharmaceutical-grade vitamin supplements",
        "Mix thoroughly to ensure even distribution",
        "Quality check for vitamin concentration",
        "Bottle in UV-protected containers",
        "Store in cool conditions"
      ],
      time: "8 minutes",
      servingSize: "500ml bottle",
      nutritionHighlights: ["200% daily Vitamin C", "Immune system support", "Energy boosting B vitamins"]
    }
  },
  {
    id: 4,
    name: "Sugar-Free Fresh",
    description: "Perfect for health-conscious individuals. All the taste, zero added sugar.",
    price: 109,
    image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=500&fit=crop",
    category: "Healthy",
    popular: false,
    features: ["Zero Sugar", "Low Calorie", "Diabetic Friendly"],
    preparation: {
      ingredients: ["Fresh oranges (4-5 pieces)", "Natural stevia extract (optional)"],
      steps: [
        "Select naturally sweet oranges",
        "Cold-press extraction to preserve natural sweetness",
        "No sugar or sweeteners added",
        "Test sugar levels to ensure compliance",
        "Filter and bottle immediately",
        "Label with nutritional information"
      ],
      time: "6 minutes",
      servingSize: "500ml bottle",
      nutritionHighlights: ["Only natural fruit sugars", "Low glycemic index", "Suitable for diabetics"]
    }
  },
  {
    id: 5,
    name: "Orange Mint Fusion",
    description: "Refreshing blend of orange and mint for a cool, revitalizing experience.",
    price: 129,
    image: "https://images.unsplash.com/photo-1546548970-71785318a17b?w=500&h=500&fit=crop",
    category: "Fusion",
    popular: false,
    features: ["Mint Infused", "Super Refreshing", "Unique Flavor"],
    preparation: {
      ingredients: ["Fresh oranges (4-5 pieces)", "Fresh mint leaves (10-15)", "Ice cubes"],
      steps: [
        "Extract fresh orange juice",
        "Wash and muddle fresh mint leaves",
        "Infuse mint into orange juice for 2 minutes",
        "Strain to remove mint pieces",
        "Add crushed ice for extra freshness",
        "Serve chilled with mint garnish"
      ],
      time: "10 minutes",
      servingSize: "500ml bottle",
      nutritionHighlights: ["Digestive benefits from mint", "Cooling effect", "Natural refreshment"]
    }
  },
  {
    id: 6,
    name: "Orange Ginger Zing",
    description: "Spicy ginger meets sweet orange for a zingy, energizing drink.",
    price: 129,
    image: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=500&h=500&fit=crop",
    category: "Fusion",
    popular: false,
    features: ["Ginger Kick", "Digestive Aid", "Energizing"],
    preparation: {
      ingredients: ["Fresh oranges (4-5 pieces)", "Fresh ginger root (1 inch)", "Honey (optional)"],
      steps: [
        "Extract fresh orange juice",
        "Peel and grate fresh ginger",
        "Steep ginger in warm juice for 3 minutes",
        "Strain to remove ginger pieces",
        "Add honey if desired for sweetness",
        "Serve warm or chilled based on preference"
      ],
      time: "12 minutes",
      servingSize: "500ml bottle",
      nutritionHighlights: ["Anti-inflammatory properties", "Aids digestion", "Natural energy boost"]
    }
  }
];

export const ORDER_STATUSES = {
  RECEIVED: {
    id: 'received',
    label: 'Order Received',
    icon: '✅',
    description: 'Your order has been received and confirmed'
  },
  PREPARING: {
    id: 'preparing',
    label: 'Preparing Juice',
    icon: '🧃',
    description: 'Fresh juice is being prepared just for you'
  },
  OUT_FOR_DELIVERY: {
    id: 'out_for_delivery',
    label: 'Out for Delivery',
    icon: '🚴',
    description: 'Your order is on the way'
  },
  DELIVERED: {
    id: 'delivered',
    label: 'Delivered',
    icon: '🍊',
    description: 'Order delivered successfully. Enjoy!'
  }
};

export const PAYMENT_MODES = [
  { id: 'cash', label: 'Cash on Delivery' },
  { id: 'online', label: 'Online Payment' }
];
