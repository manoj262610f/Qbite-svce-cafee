import { FoodItem } from '../types';

export const INITIAL_FOOD_ITEMS: FoodItem[] = [
  {
    id: 'f-masala-dosa',
    name: 'Masala Dosa',
    category: 'South Indian',
    price: 40,
    prepTimeMinutes: 10,
    isAvailable: true,
    description: 'Crispy golden dosa roasted in ghee, filled with spiced potato masala, served with coconut chutney & sambar.',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.8,
    isPopular: true
  },
  {
    id: 'f-plain-dosa',
    name: 'Plain Dosa',
    category: 'South Indian',
    price: 30,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: 'Crispy fermented rice & lentil crepe served with authentic fresh coconut chutney and piping hot sambar.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.6
  },
  {
    id: 'f-idli',
    name: 'Idli (2 pcs)',
    category: 'South Indian',
    price: 30,
    prepTimeMinutes: 5,
    isAvailable: true,
    description: 'Soft, fluffy steamed rice cakes served with aromatic Madras sambar and fresh ground mint-coconut chutney.',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.7,
    isPopular: true
  },
  {
    id: 'f-vada',
    name: 'Medu Vada (1 pc)',
    category: 'South Indian',
    price: 25,
    prepTimeMinutes: 5,
    isAvailable: true,
    description: 'Crispy on the outside, fluffy inside spiced lentil donut with curry leaves and black pepper.',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.6
  },
  {
    id: 'f-poori',
    name: 'Poori Sagu (3 pcs)',
    category: 'Breakfast',
    price: 35,
    prepTimeMinutes: 10,
    isAvailable: true,
    description: 'Puffed golden pooris served with mild Karnataka style mixed vegetable sagu and onion rings.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.7
  },
  {
    id: 'f-kesari-bath',
    name: 'Kesari Bath',
    category: 'Breakfast',
    price: 30,
    prepTimeMinutes: 5,
    isAvailable: true,
    description: 'Sweet saffron semolina dessert loaded with golden fried cashews, raisins, and aromatic cardamom ghee.',
    imageUrl: 'https://images.unsplash.com/photo-1605197143984-690e29317578?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.5
  },
  {
    id: 'f-rice-bath',
    name: 'Rice Bath / Khara Bath',
    category: 'Breakfast',
    price: 40,
    prepTimeMinutes: 6,
    isAvailable: true,
    description: 'Flavorful spiced rice tempered with mustard, roasted peanuts, curry leaves, and country vegetables.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.4
  },
  {
    id: 'f-veg-meals',
    name: 'SVCE Special Veg Meals',
    category: 'Meals',
    price: 70,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: 'Complete South Indian thali: Steamed Sonamasuri rice, sambar, rasam, palya, curd, crispy papad & pickle.',
    imageUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.9,
    isPopular: true
  },
  {
    id: 'f-curd-rice',
    name: 'Curd Rice',
    category: 'Meals',
    price: 35,
    prepTimeMinutes: 5,
    isAvailable: true,
    description: 'Comforting creamy curd rice tempered with mustard seeds, ginger, pomegranate kernels, and green chilies.',
    imageUrl: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.6
  },
  {
    id: 'f-biryani',
    name: 'Hyderabadi Veg Dum Biryani',
    category: 'North Indian',
    price: 90,
    prepTimeMinutes: 12,
    isAvailable: true,
    description: 'Slow-cooked fragrant basmati rice layered with marinated paneer, fresh mint, fried onions & raita.',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.8,
    isPopular: true
  },
  {
    id: 'f-fried-rice',
    name: 'Veg Fried Rice',
    category: 'Fast Food',
    price: 70,
    prepTimeMinutes: 10,
    isAvailable: true,
    description: 'Wok-tossed long-grain rice with crunchy bell peppers, cabbage, spring onions, and oriental sauces.',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.5
  },
  {
    id: 'f-noodles',
    name: 'Veg Hakka Noodles',
    category: 'Fast Food',
    price: 70,
    prepTimeMinutes: 10,
    isAvailable: true,
    description: 'Street-style tossed noodles with crisp julienned vegetables, soy sauce, and garlic chili oil.',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.7
  },
  {
    id: 'f-sandwich',
    name: 'Grilled Veg Cheese Sandwich',
    category: 'Snacks',
    price: 50,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: 'Golden butter-toasted sandwich stuffed with cucumber, tomato, green chutney, and melted cheese.',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.6
  },
  {
    id: 'f-burger',
    name: 'Crispy Veg Burger',
    category: 'Fast Food',
    price: 70,
    prepTimeMinutes: 10,
    isAvailable: true,
    description: 'Crunchy herb potato patty layered with crisp lettuce, sliced tomato, cheese slice, and tangy mayo.',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.5
  },
  {
    id: 'f-samosa',
    name: 'Hot Samosa (2 pcs)',
    category: 'Snacks',
    price: 20,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: 'Crispy triangular pastry filled with spiced green peas and potato mash, served with sweet tamarind chutney.',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.7,
    isPopular: true
  },
  {
    id: 'f-puff',
    name: 'Veg Puff / Curry Puff',
    category: 'Snacks',
    price: 25,
    prepTimeMinutes: 3,
    isAvailable: true,
    description: 'Flaky baked golden pastry filled with zesty onion-potato masala, always hot and crunchy.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.4
  },
  {
    id: 'f-french-fries',
    name: 'Crispy Salted French Fries',
    category: 'Snacks',
    price: 60,
    prepTimeMinutes: 8,
    isAvailable: true,
    description: 'Golden fried potato batons seasoned with rock salt and peri-peri sprinkle, served with hot dip.',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.5
  },
  {
    id: 'f-lime-juice',
    name: 'Fresh Mint Lime Juice',
    category: 'Juices',
    price: 30,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: 'Freshly squeezed sweet & salty lime juice infused with crushed mint leaves and black salt.',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.8
  },
  {
    id: 'f-mango-juice',
    name: 'Alphonso Mango Juice',
    category: 'Juices',
    price: 40,
    prepTimeMinutes: 4,
    isAvailable: true,
    description: 'Thick, chilled natural Alphonso mango pulp blend, smooth and refreshing between lectures.',
    imageUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.7
  },
  {
    id: 'f-coffee',
    name: 'SVCE Special Filter Coffee',
    category: 'Drinks',
    price: 20,
    prepTimeMinutes: 3,
    isAvailable: true,
    description: 'Authentic South Indian chicory filter coffee frothed to perfection in traditional stainless steel tumbler.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.9,
    isPopular: true
  },
  {
    id: 'f-tea',
    name: 'Cardamom Ginger Tea',
    category: 'Drinks',
    price: 15,
    prepTimeMinutes: 3,
    isAvailable: true,
    description: 'Strong hot milk chai brewed with freshly crushed ginger roots and fragrant green cardamom.',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.8
  },
  {
    id: 'f-ice-cream',
    name: 'Vanilla / Choco Cone Ice Cream',
    category: 'Desserts',
    price: 30,
    prepTimeMinutes: 2,
    isAvailable: true,
    description: 'Creamy double-scoop ice cream cone topped with roasted chocolate nuts and fudge.',
    imageUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=600&q=80',
    isVeg: true,
    rating: 4.6
  }
];

export const CATEGORIES = [
  'All',
  'Breakfast',
  'South Indian',
  'North Indian',
  'Meals',
  'Snacks',
  'Fast Food',
  'Drinks',
  'Juices',
  'Desserts'
];

export const INITIAL_COUPONS = [
  {
    id: 'c-svce10',
    code: 'SVCE10',
    discountAmount: 10,
    minOrderValue: 50,
    isActive: true,
    description: 'Flat ₹10 OFF on orders above ₹50'
  },
  {
    id: 'c-quick20',
    code: 'QUICK20',
    discountPercentage: 20,
    minOrderValue: 100,
    isActive: true,
    description: '20% OFF on group orders above ₹100'
  },
  {
    id: 'c-morning5',
    code: 'BREAKFAST5',
    discountAmount: 5,
    minOrderValue: 30,
    isActive: true,
    description: '₹5 OFF on breakfast items'
  }
];
