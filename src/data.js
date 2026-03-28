export const HAIR_PRODUCTS = [
  { id: 1, name: "Sleek Bob Cut", category: "Bobs", price: 45000, originalPrice: 55000, rating: 4.8, reviews: 124, bestSeller: true, inStock: true, length: "12 inch", color: "Jet Black", description: "A flawlessly sleek, chin-length bob that exudes sophistication. Made with 100% virgin human hair, heat-resistant up to 220°C. Perfect for everyday elegance.", image: "bob1" },
  { id: 2, name: "Curly Goddess", category: "Curly", price: 62000, originalPrice: 75000, rating: 4.9, reviews: 89, bestSeller: true, inStock: true, length: "18 inch", color: "Dark Brown", description: "Bouncy, voluminous curls that command attention. Double-drawn Brazilian hair with natural luster. Tangle-free and minimal shedding.", image: "curly1" },
  { id: 3, name: "Beach Waves Lace Front", category: "Wavy", price: 58000, originalPrice: null, rating: 4.7, reviews: 67, bestSeller: false, inStock: true, length: "20 inch", color: "Auburn", description: "Effortless beachy waves with a natural hairline. 13x4 lace front wig. Pre-plucked with baby hair for an undetectable finish.", image: "wavy1" },
  { id: 4, name: "Bouncy Blowout", category: "Bouncy", price: 52000, originalPrice: 60000, rating: 4.6, reviews: 103, bestSeller: true, inStock: true, length: "22 inch", color: "Natural Black", description: "Full, luscious volume with a natural blowout style. Premium Malaysian hair. Stays bouncy all day with zero frizz.", image: "bouncy1" },
  { id: 5, name: "Bone Straight Silk", category: "Bone Straight", price: 68000, originalPrice: null, rating: 4.9, reviews: 201, bestSeller: true, inStock: true, length: "24 inch", color: "Jet Black", description: "Glass-smooth bone straight wig with a silk-like finish. Vietnamese raw hair, naturally straight without chemical treatment.", image: "straight1" },
  { id: 6, name: "Pixie Bob", category: "Bobs", price: 38000, originalPrice: 44000, rating: 4.5, reviews: 55, bestSeller: false, inStock: true, length: "8 inch", color: "Burgundy", description: "Chic and bold pixie bob with a burgundy tint. Human hair blend with a comfortable adjustable cap.", image: "bob2" },
  { id: 7, name: "Deep Wave Curls", category: "Curly", price: 55000, originalPrice: 65000, rating: 4.7, reviews: 78, bestSeller: false, inStock: false, length: "16 inch", color: "Dark Brown", description: "Defined deep wave curls with incredible bounce. 100% Peruvian human hair. Minimal maintenance, maximum glamour.", image: "curly2" },
  { id: 8, name: "Mermaid Waves", category: "Wavy", price: 72000, originalPrice: null, rating: 4.8, reviews: 92, bestSeller: true, inStock: true, length: "26 inch", color: "Ombre Brown", description: "Long, dramatic mermaid waves in a stunning ombre. HD full lace wig. The ultimate statement hair.", image: "wavy2" },
  { id: 9, name: "Volume Bouncy Curl", category: "Bouncy", price: 48000, originalPrice: 56000, rating: 4.6, reviews: 44, bestSeller: false, inStock: true, length: "20 inch", color: "Natural Black", description: "Super bouncy spiral curls with incredible volume. Brazilian remy hair. Perfect for special occasions.", image: "bouncy2" },
  { id: 10, name: "Ultra Straight Lace", category: "Bone Straight", price: 78000, originalPrice: 90000, rating: 5.0, reviews: 156, bestSeller: true, inStock: true, length: "28 inch", color: "Jet Black", description: "Absolutely straight HD lace frontal wig. The finest quality raw Vietnamese hair. Mirror-like shine.", image: "straight2" },
];

export const CATEGORIES = ["All", "Bobs", "Curly", "Wavy", "Bouncy", "Bone Straight", "Straight", "Body Wave", "Loose Wave", "Deep Wave", "Kinky Curly", "Water Wave", "Yaki"];

export const TEXTURES = ["Double Drawn Virgin", "Super Double Drawn", "Single Donor (Raw)", "Indonesia Hair", "Bone Straight"];

export const ORDER_STATUSES = [
  "Order Placed",
  "Payment Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];


export const HAIR_GRADIENTS = {
  bob1: "linear-gradient(135deg, #2a1a0a 0%, #1a1008 60%, #0a0805 100%)",
  bob2: "linear-gradient(135deg, #7a2020 0%, #5c1a1a 60%, #3d0d0d 100%)",
  curly1: "linear-gradient(135deg, #4d2a0a 0%, #3d1a0a 60%, #2d0f05 100%)",
  curly2: "linear-gradient(135deg, #5c2a0a 0%, #3d1a0a 60%, #2a0f05 100%)",
  wavy1: "linear-gradient(135deg, #c47a3a 0%, #8B4513 60%, #5c2a0a 100%)",
  wavy2: "linear-gradient(135deg, #7a5028 0%, #4a2c0a 50%, #1a0a02 100%)",
  bouncy1: "linear-gradient(135deg, #2a1a0a 0%, #1a1008 100%)",
  bouncy2: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
  straight1: "linear-gradient(135deg, #1a1a1a 0%, #080808 100%)",
  straight2: "linear-gradient(135deg, #101010 0%, #050505 100%)",
};

export const QUALITY_TAGS = [
  '100% Raw Hair',
  'Donor Hair',
  'No Shedding',
  'Can Be Dyed',
  'Long Lasting',
  'Full Density',
  'Heat Resistant',
  'Pre-Plucked',
];

export const fmt = (n) => `₦${n.toLocaleString()}`;
