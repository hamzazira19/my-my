import { GiftItem } from '../types';

export const GIFTS_CATALOG: GiftItem[] = [
  {
    id: 'rose',
    name: 'Red Rose',
    icon: '🌹',
    coinsCost: 10,
    diamondValue: 8,
    tier: 'common',
    animationType: 'rose',
    description: 'A classic sweet gesture of appreciation'
  },
  {
    id: 'heart_rocket',
    name: 'Heart Rocket',
    icon: '🚀',
    coinsCost: 50,
    diamondValue: 40,
    tier: 'common',
    animationType: 'rocket',
    description: 'Launch love straight to the moon!'
  },
  {
    id: 'perfume',
    name: 'Luxury Perfume',
    icon: '✨',
    coinsCost: 150,
    diamondValue: 120,
    tier: 'rare',
    animationType: 'ring',
    description: 'High elegance and sweet aroma'
  },
  {
    id: 'diamond_ring',
    name: 'Diamond Ring',
    icon: '💍',
    coinsCost: 500,
    diamondValue: 400,
    tier: 'rare',
    animationType: 'ring',
    description: 'Shining diamond commitment'
  },
  {
    id: 'sports_car',
    name: 'Speed Supercar',
    icon: '🏎️',
    coinsCost: 2000,
    diamondValue: 1600,
    tier: 'epic',
    animationType: 'car',
    description: 'Roaring engine with full-screen race animation!'
  },
  {
    id: 'golden_crown',
    name: 'Royal Crown',
    icon: '👑',
    coinsCost: 5000,
    diamondValue: 4000,
    tier: 'epic',
    animationType: 'crown',
    description: 'Crown the streamer as the king or queen of the night!'
  },
  {
    id: 'fiery_dragon',
    name: 'Fiery Dragon',
    icon: '🐉',
    coinsCost: 10000,
    diamondValue: 8000,
    tier: 'legendary',
    animationType: 'dragon',
    description: 'Mythical dragon soaring with flame breath and massive banner!'
  },
  {
    id: 'mega_yacht',
    name: 'Super Yacht',
    icon: '🛥️',
    coinsCost: 25000,
    diamondValue: 20000,
    tier: 'legendary',
    animationType: 'yacht',
    description: 'The ultimate VIP whale gift with platform-wide announcement!'
  }
];

export const CRYPTO_OPTIONS = [
  { id: 'USDTTRC20', name: 'Tether USDT', network: 'TRC20 (Tron)', icon: '₮', badge: 'Lowest Fees', minDeposit: 10 },
  { id: 'BTC', name: 'Bitcoin', network: 'Bitcoin Network', icon: '₿', badge: 'Popular', minDeposit: 20 },
  { id: 'ETH', name: 'Ethereum', network: 'ERC20 (Ethereum)', icon: 'Ξ', badge: 'Fast', minDeposit: 20 },
  { id: 'SOL', name: 'Solana', network: 'Solana Network', icon: '◎', badge: 'Ultra Fast', minDeposit: 10 },
  { id: 'LTC', name: 'Litecoin', network: 'Litecoin Network', icon: 'Ł', badge: 'Low Fee', minDeposit: 10 },
  { id: 'TRX', name: 'Tron', network: 'TRON Mainnet', icon: '⚡', badge: 'Instant', minDeposit: 10 },
];

export const COIN_PACKAGES = [
  { usd: 10, coins: 1100, bonus: '+10% Bonus', popular: false },
  { usd: 25, coins: 2875, bonus: '+15% Bonus', popular: false },
  { usd: 50, coins: 6000, bonus: '+20% Bonus 🔥', popular: true },
  { usd: 100, coins: 13000, bonus: '+30% Bonus 💎', popular: false },
  { usd: 250, coins: 35000, bonus: '+40% VIP Whale 🚀', popular: false },
];
