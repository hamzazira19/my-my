import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory persistent state (simulating real platform database)
export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar: string;
  bio: string;
  authProvider?: 'google' | 'phone';
  phoneNumber?: string;
  totalDepositedUSD?: number;
  streamHours?: number;
  language?: string;
  coinsBalance: number;     // Coins for tipping/sending gifts
  diamondsBalance: number;  // Diamonds earned as a streamer (100 diamonds = $1 USD)
  level: number;
  followers: number;
  following: number;
  isStreamer: boolean;
  walletAddress?: string;
  country?: string;
  countryFlag?: string;
  countryName?: string;
  role: 'admin' | 'model' | 'user';
  isBanned?: boolean;
  isMutedGlobal?: boolean;
  createdAt: string;
  age?: number;
  fansCount?: number;
  subtitle?: string;
  quote?: string;
  verified?: boolean;
  gainsFormatted?: string;
  followersFormatted?: string;
  fansFormatted?: string;
}

// Current logged in user (Hamza Zira / الزير matching Screenshot 1)
let currentUser: UserProfile = {
  id: 'usr_google_10203',
  name: 'الزير',
  username: '@falcon_pro',
  email: 'hamza.zira010203@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  bio: 'Platform Creator, Model & Admin 🚀 Welcome to my live room!',
  authProvider: 'google',
  phoneNumber: '+216 98 123 456',
  totalDepositedUSD: 320.0,
  streamHours: 48.5,
  language: 'fr',
  coinsBalance: 2500,
  diamondsBalance: 60930, // 60,93K Gains matching Screenshot 1
  level: 18,
  followers: 542,         // 542 Abonnés matching Screenshot 1
  following: 532,         // 532 Abonnements matching Screenshot 1
  fansCount: 1,           // 1 Fans matching Screenshot 1
  isStreamer: true,
  country: 'TN',
  countryFlag: '🇹🇳',
  countryName: 'Tunisia',
  role: 'admin',
  isBanned: false,
  isMutedGlobal: false,
  createdAt: '2026-01-15T10:00:00Z',
  gainsFormatted: '60,93K',
  followersFormatted: '542',
  fansFormatted: '1',
};

// Platform users database - Live female models matching screenshots
const platformUsers: UserProfile[] = [
  currentUser,
  {
    id: 'usr_reem',
    name: 'REEM ريم 🤍🦌',
    email: 'reem@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    bio: 'عِش يومك بقلبٍ راضٍ، ولسانٍ شاكر، وعقلٍ متفائل؛ فالأيّام تُزهر لمن يُحسن انتظار المطر ❤️🦌',
    coinsBalance: 5200,
    diamondsBalance: 16010000, // 16,01M Gains matching Screenshot 2
    level: 60,
    followers: 57730,          // 57,73K Abonnés matching Screenshot 2
    following: 48,
    fansCount: 5,              // 5 Fans matching Screenshot 2
    isStreamer: true,
    country: 'SA',
    countryFlag: '🇸🇦',
    countryName: 'Saudi Arabia',
    role: 'model',
    age: 26,
    subtitle: 'Arabie saoudite, 26 ans • Legends ❗ الأساطير',
    quote: 'عِش يومك بقلبٍ راضٍ، ولسانٍ شاكر، وعقلٍ متفائل؛ فالأيّام تُزهر لمن يُحسن انتظار المطر ❤️🦌',
    verified: true,
    gainsFormatted: '16,01M',
    followersFormatted: '57,73K',
    fansFormatted: '5',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-05T10:00:00Z',
  },
  {
    id: 'usr_rayqa',
    name: 'رآيقهـ 👑',
    email: 'rayqa@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    bio: 'Queen of Live Vibes ✨ Tunisian beauty & chill chats',
    coinsBalance: 1400,
    diamondsBalance: 64700000,
    level: 54,
    followers: 84200,
    following: 110,
    isStreamer: true,
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-10T12:00:00Z',
  },
  {
    id: 'usr_silia',
    name: 'Silia 🐆',
    email: 'silia@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    bio: 'Fierce & fun 🐆 Music, dance & real talk',
    coinsBalance: 980,
    diamondsBalance: 4100000,
    level: 38,
    followers: 32400,
    following: 88,
    isStreamer: true,
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'usr_solar',
    name: 'solar ☀️',
    email: 'solar@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
    bio: 'Sunny Moroccan streamer ☀️ VS Battles & high energy vibes',
    coinsBalance: 2400,
    diamondsBalance: 4100000,
    level: 42,
    followers: 41900,
    following: 95,
    isStreamer: true,
    country: 'MA',
    countryFlag: '🇲🇦',
    countryName: 'Morocco',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-22T14:00:00Z',
  },
  {
    id: 'usr_dody',
    name: 'دودي 🍒',
    email: 'dody@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&auto=format&fit=crop&q=80',
    bio: 'Sweet cherry 🍒 Singing & late night lounge',
    coinsBalance: 1200,
    diamondsBalance: 920800,
    level: 27,
    followers: 18200,
    following: 64,
    isStreamer: true,
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-01T15:00:00Z',
  },
  {
    id: 'usr_eya',
    name: 'Eya ❤️',
    email: 'eya@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    bio: 'Authentic & warm ❤️ Join my broadcast!',
    coinsBalance: 3100,
    diamondsBalance: 5400000,
    level: 35,
    followers: 29500,
    following: 140,
    isStreamer: true,
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-05T11:00:00Z',
  },
  {
    id: 'usr_jin',
    name: 'JIN',
    email: 'jin@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&auto=format&fit=crop&q=80',
    bio: 'Asian-Mediterranean model 🌟 Exclusive streams & discussions',
    coinsBalance: 5600,
    diamondsBalance: 18900000,
    level: 49,
    followers: 67000,
    following: 12,
    isStreamer: true,
    country: 'FR',
    countryFlag: '🇫🇷',
    countryName: 'France',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-12T08:00:00Z',
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Bella 💎',
    email: 'sarah.bella@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&auto=format&fit=crop&q=80',
    bio: 'Professional Singer & Guitarist 🎸 VIP room open!',
    coinsBalance: 1200,
    diamondsBalance: 38500,
    level: 32,
    followers: 18900,
    following: 120,
    isStreamer: true,
    country: 'FR',
    countryFlag: '🇫🇷',
    countryName: 'France',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-01T12:00:00Z',
  },
  {
    id: 'usr_layla',
    name: 'Layla Dance 💃',
    email: 'layla.dance@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    bio: 'Algerian dance queen 💃 Live dance competitions',
    coinsBalance: 500,
    diamondsBalance: 21300,
    level: 24,
    followers: 14500,
    following: 210,
    isStreamer: true,
    country: 'DZ',
    countryFlag: '🇩🇿',
    countryName: 'Algeria',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-10T16:00:00Z',
  },
  {
    id: 'usr_kenza',
    name: 'Kenza Gaming 🎮',
    email: 'kenza.gaming@stream.tv',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&auto=format&fit=crop&q=80',
    bio: 'Ranked gamer girl 🎯 tournaments',
    coinsBalance: 950,
    diamondsBalance: 14200,
    level: 19,
    followers: 8900,
    following: 115,
    isStreamer: true,
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-14T09:00:00Z',
  },
  {
    id: 'usr_amira',
    name: 'Amira Star ✨',
    email: 'amira@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=300&auto=format&fit=crop&q=80',
    bio: 'Egyptian superstar ✨ Glamour & acoustic nights',
    coinsBalance: 4200,
    diamondsBalance: 8900000,
    level: 46,
    followers: 51200,
    following: 73,
    isStreamer: true,
    country: 'EG',
    countryFlag: '🇪🇬',
    countryName: 'Egypt',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-28T19:00:00Z',
  },
  {
    id: 'usr_yasmin',
    name: 'Yasmin Princess 🌸',
    email: 'yasmin@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    bio: 'Saudi beauty & fashionista 🌸',
    coinsBalance: 7800,
    diamondsBalance: 12400000,
    level: 51,
    followers: 68400,
    following: 104,
    isStreamer: true,
    country: 'SA',
    countryFlag: '🇸🇦',
    countryName: 'Saudi Arabia',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-14T20:00:00Z',
  },
  {
    id: 'usr_nour',
    name: 'Nour Glam 💄',
    email: 'nour@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1521227889351-bf6f5b2e4e37?w=300&auto=format&fit=crop&q=80',
    bio: 'Dubai high lifestyle & beauty tips 💄',
    coinsBalance: 6100,
    diamondsBalance: 15100000,
    level: 48,
    followers: 59300,
    following: 82,
    isStreamer: true,
    country: 'AE',
    countryFlag: '🇦🇪',
    countryName: 'UAE',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-01-20T17:00:00Z',
  },
  {
    id: 'usr_rania',
    name: 'Rania VIP 🌟',
    email: 'rania@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=300&auto=format&fit=crop&q=80',
    bio: 'Lebanese singer & TV host 🌟 Private chat with gifts',
    coinsBalance: 3400,
    diamondsBalance: 7300000,
    level: 41,
    followers: 37800,
    following: 91,
    isStreamer: true,
    country: 'LB',
    countryFlag: '🇱🇧',
    countryName: 'Lebanon',
    role: 'model',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-02T13:00:00Z',
  },
  {
    id: 'usr_supporter_1',
    name: 'Sultan_Crypto 🐉',
    email: 'sultan.whale@crypto.ae',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    bio: 'VIP Whale Supporter 💎 Love supporting music & dance streams',
    coinsBalance: 45000,
    diamondsBalance: 0,
    level: 48,
    followers: 3400,
    following: 250,
    isStreamer: false,
    role: 'user',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-05T18:00:00Z',
  },
  {
    id: 'usr_vip2',
    name: 'Youssef VIP 🏎️',
    email: 'youssef.vip@livevibe.io',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    bio: 'High roller supporter & sports car enthusiast',
    coinsBalance: 28000,
    diamondsBalance: 0,
    level: 36,
    followers: 1200,
    following: 95,
    isStreamer: false,
    role: 'user',
    isBanned: false,
    isMutedGlobal: false,
    createdAt: '2026-02-12T11:00:00Z',
  }
];

export interface CryptoTx {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  cryptoCurrency: string;
  amountCrypto: number;
  amountUSD: number;
  coinsReceived?: number;
  diamondsDeducted?: number;
  paymentId: string;
  payAddress: string;
  status: 'waiting' | 'confirming' | 'finished' | 'failed';
  network: string;
  txHash?: string;
  createdAt: string;
}

const transactions: CryptoTx[] = [
  {
    id: 'tx_gw_99182',
    userId: 'usr_google_10203',
    type: 'deposit',
    cryptoCurrency: 'USDTTRC20',
    amountCrypto: 50.0,
    amountUSD: 50.0,
    coinsReceived: 5500,
    paymentId: 'GW_881726351',
    payAddress: 'TYDzsXDvGpnB7Y8jJb4mNvB76w38Yd4Z11',
    status: 'finished',
    network: 'TRC20',
    txHash: '0x9a8fbc7261553cda82b71928374619a8bc',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'tx_gw_99183',
    userId: 'usr_google_10203',
    type: 'withdraw',
    cryptoCurrency: 'USDTTRC20',
    amountCrypto: 75.0,
    amountUSD: 75.0,
    diamondsDeducted: 7500,
    paymentId: 'WD_9928172',
    payAddress: 'TLyqzVGLV1nmH3M42Z1xWkP7sD6YgV8Hj9',
    status: 'finished',
    network: 'TRC20',
    txHash: '0x334bfca819273618491bbcaa0192837418a',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'tx_gw_99184',
    userId: 'usr_supporter_1',
    type: 'deposit',
    cryptoCurrency: 'BTC',
    amountCrypto: 0.0056,
    amountUSD: 500.0,
    coinsReceived: 55000,
    paymentId: 'GW_77182910',
    payAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    status: 'finished',
    network: 'BTC',
    txHash: '0x7bca89128374128371928aab89123847',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  }
];

export interface LiveStreamItem {
  id: string;
  streamerId: string;
  streamerName: string;
  streamerAvatar: string;
  streamerLevel: number;
  title: string;
  category: string;
  viewerCount: number;
  likesCount: number;
  streamThumbnail: string;
  isLive: boolean;
  totalGiftsCoins: number;
  videoType: 'camera' | 'feed' | 'interactive' | 'm3u8';
  m3u8Url?: string;
  country?: string;
  countryFlag?: string;
  countryName?: string;
  diamondsFormatted?: string;
  isVsBattle?: boolean;
  goal: {
    title: string;
    current: number;
    target: number;
  };
  startedAt: string;
}

// Live streams list - strictly female models currently live, with portrait photos
const streams: LiveStreamItem[] = [
  {
    id: 'stream_reem',
    streamerId: 'usr_reem',
    streamerName: 'REEM ريم 🤍🦌',
    streamerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    streamerLevel: 60,
    title: 'سهرة هادئة وكلام من القلب مع ريم 🤍🦌',
    category: 'Chat',
    viewerCount: 88,
    likesCount: 295000,
    streamThumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 160100,
    diamondsFormatted: '16,01M',
    country: 'SA',
    countryFlag: '🇸🇦',
    countryName: 'Saudi Arabia',
    isVsBattle: false,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Diamond Heart Goal 💎',
      current: 75000,
      target: 100000,
    },
    startedAt: new Date(Date.now() - 3600000 * 2.5).toISOString(),
  },
  {
    id: 'stream_rayqa',
    streamerId: 'usr_rayqa',
    streamerName: 'رآيقهـ 👑',
    streamerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 54,
    title: 'سهرة تونسية رايقة وأحلى كلام 👑',
    category: 'Chat',
    viewerCount: 46,
    likesCount: 142000,
    streamThumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 647000,
    diamondsFormatted: '64,7M',
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    isVsBattle: false,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Queen Crown Goal 👑',
      current: 48000,
      target: 60000,
    },
    startedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'stream_silia',
    streamerId: 'usr_silia',
    streamerName: 'Silia 🐆',
    streamerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 38,
    title: 'Silia live 🐆 Dance & chill vibe',
    category: 'Dance',
    viewerCount: 19,
    likesCount: 58000,
    streamThumbnail: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 410000,
    diamondsFormatted: '4,1M',
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    isVsBattle: true,
    videoType: 'm3u8',
    m3u8Url: 'https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8',
    goal: {
      title: 'Jaguar Leopard 🐆',
      current: 31000,
      target: 50000,
    },
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'stream_solar',
    streamerId: 'usr_solar',
    streamerName: 'solar ☀️',
    streamerAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 42,
    title: 'solar VS Battle live ☀️ Support for victory!',
    category: 'Battle',
    viewerCount: 11,
    likesCount: 64000,
    streamThumbnail: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 410000,
    diamondsFormatted: '4,1M',
    country: 'MA',
    countryFlag: '🇲🇦',
    countryName: 'Morocco',
    isVsBattle: true,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Solar Flare ☀️',
      current: 29000,
      target: 40000,
    },
    startedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'stream_dody',
    streamerId: 'usr_dody',
    streamerName: 'دودي 🍒',
    streamerAvatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 27,
    title: 'دودي لايف أحلى أغاني مع الحبايب 🍒',
    category: 'Music',
    viewerCount: 14,
    likesCount: 39000,
    streamThumbnail: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 92080,
    diamondsFormatted: '920,8K',
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    isVsBattle: true,
    videoType: 'm3u8',
    m3u8Url: 'https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8',
    goal: {
      title: 'Cherry Blossom 🌸',
      current: 12000,
      target: 25000,
    },
    startedAt: new Date(Date.now() - 4200000).toISOString(),
  },
  {
    id: 'stream_eya',
    streamerId: 'usr_eya',
    streamerName: 'Eya ❤️',
    streamerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 35,
    title: 'Eya Live Stream ❤️ Night chat with supporters',
    category: 'Chat',
    viewerCount: 2,
    likesCount: 78000,
    streamThumbnail: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 540000,
    diamondsFormatted: '5,4M',
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    isVsBattle: false,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Golden Heart ❤️',
      current: 41000,
      target: 60000,
    },
    startedAt: new Date(Date.now() - 5400000).toISOString(),
  },
  {
    id: 'stream_sarah',
    streamerId: 'usr_sarah',
    streamerName: 'Sarah Bella 💎',
    streamerAvatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 32,
    title: 'Late Night Acoustic Vibes & Songs 🎸',
    category: 'Music',
    viewerCount: 46,
    likesCount: 18450,
    streamThumbnail: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 38500,
    diamondsFormatted: '38,5K',
    country: 'FR',
    countryFlag: '🇫🇷',
    countryName: 'France',
    isVsBattle: false,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Studio Mic Upgrade',
      current: 38500,
      target: 50000,
    },
    startedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'stream_layla',
    streamerId: 'usr_layla',
    streamerName: 'Layla Dance 💃',
    streamerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 24,
    title: 'Freestyle Dance Battle ✨ Top tipper decides next song!',
    category: 'Dance',
    viewerCount: 19,
    likesCount: 9400,
    streamThumbnail: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 21300,
    diamondsFormatted: '21,3K',
    country: 'DZ',
    countryFlag: '🇩🇿',
    countryName: 'Algeria',
    isVsBattle: true,
    videoType: 'm3u8',
    m3u8Url: 'https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8',
    goal: {
      title: 'Neon Stage Lights',
      current: 16500,
      target: 30000,
    },
    startedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'stream_kenza',
    streamerId: 'usr_kenza',
    streamerName: 'Kenza Gaming 🎮',
    streamerAvatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 19,
    title: 'Ranked Warzone & Chatting With Supporters 💥',
    category: 'Gaming',
    viewerCount: 67,
    likesCount: 5200,
    streamThumbnail: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 14200,
    diamondsFormatted: '14,2K',
    country: 'TN',
    countryFlag: '🇹🇳',
    countryName: 'Tunisia',
    isVsBattle: true,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Pro Gaming Headset',
      current: 11000,
      target: 20000,
    },
    startedAt: new Date(Date.now() - 4200000).toISOString(),
  },
  {
    id: 'stream_amira',
    streamerId: 'usr_amira',
    streamerName: 'Amira Star ✨',
    streamerAvatar: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 46,
    title: 'سهرة مصرية طربية أحلى الليالي ✨',
    category: 'Music',
    viewerCount: 19,
    likesCount: 48000,
    streamThumbnail: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 890000,
    diamondsFormatted: '8,9M',
    country: 'EG',
    countryFlag: '🇪🇬',
    countryName: 'Egypt',
    isVsBattle: false,
    videoType: 'm3u8',
    m3u8Url: 'https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8',
    goal: {
      title: 'Nile Star ✨',
      current: 54000,
      target: 80000,
    },
    startedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'stream_yasmin',
    streamerId: 'usr_yasmin',
    streamerName: 'Yasmin Princess 🌸',
    streamerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 51,
    title: 'لايف ياسمين مع المتابعين الأوفياء 🌸',
    category: 'Chat',
    viewerCount: 36,
    likesCount: 92000,
    streamThumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 1240000,
    diamondsFormatted: '12,4M',
    country: 'SA',
    countryFlag: '🇸🇦',
    countryName: 'Saudi Arabia',
    isVsBattle: true,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Royal Princess 🌸',
      current: 78000,
      target: 100000,
    },
    startedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'stream_nour',
    streamerId: 'usr_nour',
    streamerName: 'Nour Glam 💄',
    streamerAvatar: 'https://images.unsplash.com/photo-1521227889351-bf6f5b2e4e37?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 48,
    title: 'Dubai Luxury Glam & Life Talks 💄',
    category: 'Chat',
    viewerCount: 28,
    likesCount: 84000,
    streamThumbnail: 'https://images.unsplash.com/photo-1521227889351-bf6f5b2e4e37?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 1510000,
    diamondsFormatted: '15,1M',
    country: 'AE',
    countryFlag: '🇦🇪',
    countryName: 'UAE',
    isVsBattle: false,
    videoType: 'm3u8',
    m3u8Url: 'https://cph-p2p-msl.akamaized.net/hls/live/200034/test/master.m3u8',
    goal: {
      title: 'Burj Luxury 💄',
      current: 95000,
      target: 120000,
    },
    startedAt: new Date(Date.now() - 4800000).toISOString(),
  },
  {
    id: 'stream_rania',
    streamerId: 'usr_rania',
    streamerName: 'Rania VIP 🌟',
    streamerAvatar: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=300&auto=format&fit=crop&q=80',
    streamerLevel: 41,
    title: 'Rania VIP Lounge 🌟 Exclusive singing session',
    category: 'Music',
    viewerCount: 24,
    likesCount: 67000,
    streamThumbnail: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=600&auto=format&fit=crop&q=80',
    isLive: true,
    totalGiftsCoins: 730000,
    diamondsFormatted: '7,3M',
    country: 'LB',
    countryFlag: '🇱🇧',
    countryName: 'Lebanon',
    isVsBattle: false,
    videoType: 'm3u8',
    m3u8Url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Cedar Star 🌟',
      current: 44000,
      target: 70000,
    },
    startedAt: new Date(Date.now() - 2400000).toISOString(),
  }
];

export interface ChatMessage {
  id: string;
  streamId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  text: string;
  type: 'chat' | 'gift' | 'system';
  gift?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    coinsCost: number;
    count: number;
  };
  timestamp: number;
}

const streamChats: Record<string, ChatMessage[]> = {
  stream_1: [
    {
      id: 'm1',
      streamId: 'stream_1',
      userId: 'usr_supporter_1',
      userName: 'Sultan_Crypto 🐉',
      userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      userLevel: 48,
      text: 'Salam Sarah! Your voice is incredible tonight ❤️',
      type: 'chat',
      timestamp: Date.now() - 120000,
    },
    {
      id: 'm2',
      streamId: 'stream_1',
      userId: 'usr_vip2',
      userName: 'Youssef VIP 🏎️',
      userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
      userLevel: 36,
      text: 'Sent Sports Car! 🏎️',
      type: 'gift',
      gift: {
        giftId: 'sports_car',
        giftName: 'Sports Car',
        giftIcon: '🏎️',
        coinsCost: 2000,
        count: 1,
      },
      timestamp: Date.now() - 60000,
    }
  ]
};

// Stream Moderation Store: Muted and Blocked users per stream
interface ModeratedUser {
  id: string;
  name: string;
  avatar: string;
  level: number;
  timestamp: number;
}

interface StreamModeration {
  mutedUsers: Record<string, ModeratedUser>;
  blockedUsers: Record<string, ModeratedUser>;
}

const streamModerations: Record<string, StreamModeration> = {};

function getStreamModeration(streamId: string): StreamModeration {
  if (!streamModerations[streamId]) {
    streamModerations[streamId] = {
      mutedUsers: {},
      blockedUsers: {},
    };
  }
  return streamModerations[streamId];
}

// Top Supporters
interface TopSupporter {
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  totalCoins: number;
  lastGiftName: string;
}

let topSupportersList: TopSupporter[] = [
  {
    userId: 'usr_supporter_1',
    userName: 'Sultan_Crypto 🐉',
    userAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
    userLevel: 48,
    totalCoins: 45000,
    lastGiftName: 'Fiery Dragon 🐉',
  },
  {
    userId: 'usr_vip2',
    userName: 'Youssef VIP 🏎️',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    userLevel: 36,
    totalCoins: 28000,
    lastGiftName: 'Golden Crown 👑',
  }
];

// ================= DIRECT MESSAGES & FOLLOW SYSTEM STORE =================

// Follow relationships map: userId -> array of followed userIds
const userFollowingMap: Record<string, string[]> = {
  usr_google_10203: [
    'usr_reem',
    'usr_sarah',
    'usr_silia',
    'usr_eya',
    'usr_jin',
    'usr_layla',
    'usr_amina',
    'usr_yasmin',
    'usr_kenza',
    'usr_selma',
  ], // 10 followed models by currentUser
  usr_sarah: ['usr_google_10203'], // Sarah follows currentUser (Mutual!)
  usr_silia: ['usr_google_10203'], // Silia follows currentUser (Mutual!)
  usr_eya: ['usr_google_10203'],   // Eya follows currentUser (Mutual!)
  usr_jin: [],
  usr_rayqa: [],
  usr_solar: [],
  usr_dody: [],
  usr_layla: [],
};

// Set of chat pairs unlocked by sending gifts
const directChatUnlockedPairs = new Set<string>();

export interface DirectMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: 'text' | 'gift' | 'system';
  gift?: {
    giftId: string;
    giftName: string;
    giftIcon: string;
    coinsCost: number;
  };
  timestamp: number;
  isRead: boolean;
}

function getPairKey(userA: string, userB: string): string {
  return [userA, userB].sort().join('___');
}

// In-memory Direct Messages database
const directMessagesStore: Record<string, DirectMessageItem[]> = {
  [getPairKey('usr_google_10203', 'usr_jin')]: [
    {
      id: 'dm_jin_1',
      senderId: 'usr_jin',
      receiverId: 'usr_google_10203',
      text: 'Coucou! Merci d\'avoir visité mon live 💋',
      type: 'text',
      timestamp: Date.now() - 3600000 * 6,
      isRead: false,
    },
    {
      id: 'dm_jin_2',
      senderId: 'usr_jin',
      receiverId: 'usr_google_10203',
      text: 'Si tu veux discuter en privé envoie moi un petit cadeau pour débloquer le chat direct 🎁',
      type: 'text',
      timestamp: Date.now() - 3600000 * 5,
      isRead: false,
    }
  ],
  [getPairKey('usr_google_10203', 'usr_eya')]: [
    {
      id: 'dm_eya_1',
      senderId: 'usr_eya',
      receiverId: 'usr_google_10203',
      text: 'Coucou Hamza ❤️ tu viens au live ce soir ?',
      type: 'text',
      timestamp: Date.now() - 3600000 * 2,
      isRead: false,
    }
  ],
  [getPairKey('usr_google_10203', 'usr_sarah')]: [
    {
      id: 'dm_sarah_1',
      senderId: 'usr_google_10203',
      receiverId: 'usr_sarah',
      text: 'Salut Sarah, magnifique session acoustique hier soir!',
      type: 'text',
      timestamp: Date.now() - 86400000,
      isRead: true,
    },
    {
      id: 'dm_sarah_2',
      senderId: 'usr_sarah',
      receiverId: 'usr_google_10203',
      text: 'Merci beaucoup pour le soutien et les roses 🌹! À ce soir!',
      type: 'text',
      timestamp: Date.now() - 86400000 + 3600000,
      isRead: true,
    }
  ],
  [getPairKey('usr_google_10203', 'usr_silia')]: [
    {
      id: 'dm_silia_1',
      senderId: 'usr_silia',
      receiverId: 'usr_google_10203',
      text: 'Coucou! Merci pour le follow 🐆 Ready for tonight battle?',
      type: 'text',
      timestamp: Date.now() - 3600000 * 12,
      isRead: true,
    }
  ]
};

// Quick Gifts catalogue with standard coin values as shown in screenshots
const quickChatGifts = [
  { id: 'rose', name: 'Rose', icon: '🌹', coinsCost: 99 },
  { id: 'champagne', name: 'Champagne', icon: '🍾', coinsCost: 299 },
  { id: 'heart_key', name: 'Heart Key', icon: '🗝️', coinsCost: 499 },
  { id: 'bunny', name: 'Bunny', icon: '🐰', coinsCost: 199 },
  { id: 'playboy', name: 'Playboy Bunny', icon: '🐇', coinsCost: 499 },
  { id: 'black_rose', name: 'Black Rose', icon: '🥀', coinsCost: 999 },
  { id: 'water_gun', name: 'Water Gun', icon: '🔫', coinsCost: 999 },
];

// ================= API ROUTES =================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Geo location auto-detection by IP/timezone (Defaulting to Tunisia 🇹🇳 as user is in Tunisia)
app.get('/api/geo/detect', (req, res) => {
  res.json({
    country: 'TN',
    countryName: 'Tunisia',
    countryFlag: '🇹🇳',
    city: 'Tunis',
  });
});

// User Follows API
app.get('/api/user/follows', (req, res) => {
  const following = userFollowingMap[currentUser.id] || [];
  res.json({ following });
});

app.post('/api/user/follow/:id', (req, res) => {
  const targetId = req.params.id;
  const targetUser = platformUsers.find(u => u.id === targetId);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  if (!userFollowingMap[currentUser.id]) {
    userFollowingMap[currentUser.id] = [];
  }

  const list = userFollowingMap[currentUser.id];
  const idx = list.indexOf(targetId);
  let isFollowing = false;

  if (idx !== -1) {
    list.splice(idx, 1);
    currentUser.following = Math.max(0, currentUser.following - 1);
    targetUser.followers = Math.max(0, targetUser.followers - 1);
    isFollowing = false;
  } else {
    list.push(targetId);
    currentUser.following += 1;
    targetUser.followers += 1;
    isFollowing = true;
  }

  res.json({ success: true, isFollowing, following: list });
});

// Get user profile details
app.get('/api/user/profile/:id', (req, res) => {
  const targetId = req.params.id;
  const user = platformUsers.find(u => u.id === targetId) || (targetId === currentUser.id ? currentUser : null);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isFollowing = (userFollowingMap[currentUser.id] || []).includes(targetId);
  const activeStream = streams.find(s => s.streamerId === targetId && s.isLive);

  res.json({
    user: {
      ...user,
      isFollowing,
    },
    activeStream: activeStream || null,
  });
});

// Update own profile
app.put('/api/user/profile', (req, res) => {
  const { name, username, bio, avatar, authProvider, phoneNumber, language } = req.body;
  if (name && name.trim()) currentUser.name = name.trim();
  if (username && username.trim()) currentUser.username = username.trim();
  if (bio !== undefined) currentUser.bio = bio.trim();
  if (avatar && avatar.trim()) currentUser.avatar = avatar.trim();
  if (authProvider) currentUser.authProvider = authProvider;
  if (phoneNumber) currentUser.phoneNumber = phoneNumber.trim();
  if (language) currentUser.language = language;

  res.json({ success: true, user: currentUser });
});

// ================= DIRECT MESSAGES APIS (DISCUSSIONS) =================

// Get all conversations for current user
app.get('/api/messages/conversations', (req, res) => {
  const conversations: any[] = [];
  const myId = currentUser.id;

  // Potential conversation partners: all platform models + anyone we exchanged DMs with
  platformUsers.forEach(otherUser => {
    if (otherUser.id === myId) return;

    const pairKey = getPairKey(myId, otherUser.id);
    const msgs = directMessagesStore[pairKey] || [];
    const lastMsg = msgs[msgs.length - 1];

    // Check mutual follow
    const iFollowHer = (userFollowingMap[myId] || []).includes(otherUser.id);
    const sheFollowsMe = (userFollowingMap[otherUser.id] || []).includes(myId);
    const isMutualFollow = iFollowHer && sheFollowsMe;
    const isUnlockedByGift = directChatUnlockedPairs.has(pairKey);

    // Unread count
    const unreadCount = msgs.filter(m => m.receiverId === myId && !m.isRead).length;

    // Check if live
    const activeStream = streams.find(s => s.streamerId === otherUser.id && s.isLive);

    conversations.push({
      id: pairKey,
      participantId: otherUser.id,
      participantName: otherUser.name,
      participantAvatar: otherUser.avatar,
      participantCountry: otherUser.country,
      participantCountryFlag: otherUser.countryFlag,
      isLive: !!activeStream,
      streamId: activeStream?.id,
      isMutualFollow,
      isUnlockedByGift,
      unreadCount,
      lastMessage: lastMsg ? (lastMsg.type === 'gift' ? `🎁 ${lastMsg.text}` : lastMsg.text) : 'Tap to start conversation',
      lastMessageTime: lastMsg ? lastMsg.timestamp : otherUser.createdAt ? new Date(otherUser.createdAt).getTime() : Date.now() - 3600000 * 24,
      lastMessageSenderId: lastMsg?.senderId || '',
      isOnline: true,
      lastSeenText: activeStream ? 'LIVE en ce moment' : 'Vu il y a quelques heures',
      isGifter: otherUser.level > 30,
      isFavorite: iFollowHer,
    });
  });

  // Sort by last message time descending
  conversations.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  res.json(conversations);
});

// Get messages for specific participant
app.get('/api/messages/:userId', (req, res) => {
  const targetId = req.params.userId;
  const targetUser = platformUsers.find(u => u.id === targetId);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const pairKey = getPairKey(currentUser.id, targetId);
  const msgs = directMessagesStore[pairKey] || [];

  const iFollowHer = (userFollowingMap[currentUser.id] || []).includes(targetId);
  const sheFollowsMe = (userFollowingMap[targetId] || []).includes(currentUser.id);
  const isMutualFollow = iFollowHer && sheFollowsMe;
  const isUnlockedByGift = directChatUnlockedPairs.has(pairKey);

  const activeStream = streams.find(s => s.streamerId === targetId && s.isLive);

  res.json({
    participant: {
      id: targetUser.id,
      name: targetUser.name,
      avatar: targetUser.avatar,
      level: targetUser.level,
      country: targetUser.country,
      countryFlag: targetUser.countryFlag,
      isLive: !!activeStream,
      streamId: activeStream?.id,
      lastSeenText: activeStream ? '🔴 LIVE en ce moment' : 'Vu la dernière fois il y a 6 h',
    },
    isMutualFollow,
    isUnlockedByGift,
    canChat: isMutualFollow || isUnlockedByGift,
    messages: msgs,
    quickGifts: quickChatGifts,
  });
});

// Send a direct text message
// STRICT RULE ENFORCED: Both must follow each other, OR unlocked via gift!
app.post('/api/messages/:userId/send', (req, res) => {
  const targetId = req.params.userId;
  const { text } = req.body;
  if (!text || !text.trim()) return res.status(400).json({ error: 'Message cannot be empty' });

  const targetUser = platformUsers.find(u => u.id === targetId);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const pairKey = getPairKey(currentUser.id, targetId);
  const iFollowHer = (userFollowingMap[currentUser.id] || []).includes(targetId);
  const sheFollowsMe = (userFollowingMap[targetId] || []).includes(currentUser.id);
  const isMutualFollow = iFollowHer && sheFollowsMe;
  const isUnlockedByGift = directChatUnlockedPairs.has(pairKey);

  // If NOT mutual and NOT unlocked via gift -> BLOCK WITH 403
  if (!isMutualFollow && !isUnlockedByGift) {
    return res.status(403).json({
      error: 'GIFT_REQUIRED',
      message: 'Both users must follow each other to chat, or you must send a gift to unlock direct messaging with this creator.',
      isMutualFollow: false,
      isUnlockedByGift: false,
    });
  }

  const newMsg: DirectMessageItem = {
    id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    senderId: currentUser.id,
    receiverId: targetId,
    text: text.trim(),
    type: 'text',
    timestamp: Date.now(),
    isRead: false,
  };

  if (!directMessagesStore[pairKey]) {
    directMessagesStore[pairKey] = [];
  }
  directMessagesStore[pairKey].push(newMsg);

  res.json({ success: true, message: newMsg });
});

// Unlock direct chat with a gift
// User sends gift: coins deducted, diamonds given to model, chat unlocked permanently!
app.post('/api/messages/:userId/unlock-with-gift', (req, res) => {
  const targetId = req.params.userId;
  const { giftId, messageText } = req.body;

  const targetUser = platformUsers.find(u => u.id === targetId);
  if (!targetUser) return res.status(404).json({ error: 'User not found' });

  const gift = quickChatGifts.find(g => g.id === giftId) || quickChatGifts[0]; // fallback rose 99
  const totalCost = gift.coinsCost;

  if (currentUser.coinsBalance < totalCost) {
    return res.status(400).json({
      error: 'INSUFFICIENT_COINS',
      message: `You need ${totalCost} coins to send ${gift.name} ${gift.icon}. Please deposit crypto to continue!`,
      required: totalCost,
      balance: currentUser.coinsBalance,
    });
  }

  // Deduct coins from user
  currentUser.coinsBalance -= totalCost;

  // Model receives diamonds based on configurable model percentage (e.g. 80% -> 10,000 coins = 8,000 diamonds)
  const modelRate = (platformSettings.modelRevenuePercentage || 80) / 100;
  const diamondsEarned = Math.floor(totalCost * modelRate);
  targetUser.diamondsBalance += diamondsEarned;

  const pairKey = getPairKey(currentUser.id, targetId);
  // Mark as unlocked permanently
  directChatUnlockedPairs.add(pairKey);

  if (!directMessagesStore[pairKey]) {
    directMessagesStore[pairKey] = [];
  }

  // Add system unlock / gift message
  const giftMsg: DirectMessageItem = {
    id: `dm_gift_${Date.now()}`,
    senderId: currentUser.id,
    receiverId: targetId,
    text: `Sent ${gift.name} ${gift.icon} (${gift.coinsCost} coins) - Chat unlocked!`,
    type: 'gift',
    gift: {
      giftId: gift.id,
      giftName: gift.name,
      giftIcon: gift.icon,
      coinsCost: gift.coinsCost,
    },
    timestamp: Date.now(),
    isRead: false,
  };
  directMessagesStore[pairKey].push(giftMsg);

  // If user provided a message with the gift, post it as well!
  if (messageText && messageText.trim()) {
    const textMsg: DirectMessageItem = {
      id: `dm_text_${Date.now()}`,
      senderId: currentUser.id,
      receiverId: targetId,
      text: messageText.trim(),
      type: 'text',
      timestamp: Date.now() + 10,
      isRead: false,
    };
    directMessagesStore[pairKey].push(textMsg);
  }

  res.json({
    success: true,
    unlocked: true,
    giftMessage: giftMsg,
    coinsBalance: currentUser.coinsBalance,
    diamondsEarned,
    message: `Gift sent! Private chat with ${targetUser.name} is now unlocked!`,
  });
});

// Mark conversation messages as read
app.post('/api/messages/:userId/read', (req, res) => {
  const targetId = req.params.userId;
  const pairKey = getPairKey(currentUser.id, targetId);
  const msgs = directMessagesStore[pairKey] || [];
  msgs.forEach(m => {
    if (m.receiverId === currentUser.id) {
      m.isRead = true;
    }
  });
  res.json({ success: true });
});

// Current User profile
app.get('/api/user', (req, res) => {
  res.json(currentUser);
});

// Google Sign-In / Switch User
app.post('/api/user/google-login', (req, res) => {
  const { name, email, avatar } = req.body;
  if (name && email) {
    currentUser.name = name;
    currentUser.email = email;
    if (avatar) currentUser.avatar = avatar;
  }
  res.json({ success: true, user: currentUser });
});

// Streams list
app.get('/api/streams', (req, res) => {
  res.json(streams.filter(s => s.isLive));
});

// Stream details with moderation check
app.get('/api/streams/:id', (req, res) => {
  const stream = streams.find(s => s.id === req.params.id);
  if (!stream) {
    return res.status(404).json({ error: 'Stream not found' });
  }

  const mod = getStreamModeration(stream.id);
  const isBlocked = !!mod.blockedUsers[currentUser.id];
  const isMuted = !!mod.mutedUsers[currentUser.id] || !!currentUser.isMutedGlobal;

  if (isBlocked && stream.streamerId !== currentUser.id && currentUser.role !== 'admin') {
    return res.status(403).json({
      error: 'You have been blocked from entering this live broadcast by the streamer.',
      isBlocked: true,
    });
  }

  const chat = streamChats[stream.id] || [];
  res.json({
    stream,
    chat,
    isMuted,
    isBlocked: false,
    moderation: {
      mutedCount: Object.keys(mod.mutedUsers).length,
      blockedCount: Object.keys(mod.blockedUsers).length,
      mutedUsers: Object.values(mod.mutedUsers),
      blockedUsers: Object.values(mod.blockedUsers),
    }
  });
});

// Quick 1-Click "Go Live" for Model
app.post('/api/streams/quick-live', (req, res) => {
  const { title, category, videoType, m3u8Url } = req.body || {};

  // Check if model already has an active stream
  let stream = streams.find(s => s.streamerId === currentUser.id && s.isLive);
  if (stream) {
    if (title) stream.title = title;
    if (category) stream.category = category;
    if (videoType) stream.videoType = videoType;
    if (m3u8Url) stream.m3u8Url = m3u8Url;
    return res.json(stream);
  }

  // Create immediate broadcast
  const newStream: LiveStreamItem = {
    id: `stream_${Date.now()}`,
    streamerId: currentUser.id,
    streamerName: currentUser.name,
    streamerAvatar: currentUser.avatar,
    streamerLevel: currentUser.level,
    title: title || `${currentUser.name} Live Stream 🔴`,
    category: category || 'Chat',
    viewerCount: 1,
    likesCount: 140,
    streamThumbnail: currentUser.avatar,
    isLive: true,
    totalGiftsCoins: 0,
    videoType: videoType || 'camera',
    m3u8Url: m3u8Url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: 'Tonight Dragon Goal 🐉',
      current: 0,
      target: 25000,
    },
    startedAt: new Date().toISOString(),
  };

  streams.unshift(newStream);
  currentUser.isStreamer = true;

  streamChats[newStream.id] = [
    {
      id: `sys_${Date.now()}`,
      streamId: newStream.id,
      userId: 'system',
      userName: 'System',
      userAvatar: '',
      userLevel: 99,
      text: 'Live broadcast started! Welcome viewers! Chat and send tips! 🚀',
      type: 'system',
      timestamp: Date.now(),
    }
  ];

  res.json(newStream);
});

// Standard Create Stream
app.post('/api/streams/create', (req, res) => {
  const { title, category, goalTitle, goalTarget, videoType, m3u8Url } = req.body;
  
  const existingIndex = streams.findIndex(s => s.streamerId === currentUser.id);
  if (existingIndex !== -1) {
    streams.splice(existingIndex, 1);
  }

  const newStream: LiveStreamItem = {
    id: `stream_${Date.now()}`,
    streamerId: currentUser.id,
    streamerName: currentUser.name,
    streamerAvatar: currentUser.avatar,
    streamerLevel: currentUser.level,
    title: title || `${currentUser.name} Live Stream 🔴`,
    category: category || 'Chat',
    viewerCount: 1,
    likesCount: 0,
    streamThumbnail: currentUser.avatar,
    isLive: true,
    totalGiftsCoins: 0,
    videoType: videoType || 'camera',
    m3u8Url: m3u8Url || 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    goal: {
      title: goalTitle || 'Tonight Goal',
      current: 0,
      target: Number(goalTarget) || 20000,
    },
    startedAt: new Date().toISOString(),
  };

  streams.unshift(newStream);
  currentUser.isStreamer = true;

  res.json(newStream);
});

// End stream
app.post('/api/streams/:id/end', (req, res) => {
  const stream = streams.find(s => s.id === req.params.id);
  if (stream) {
    stream.isLive = false;
  }
  res.json({ success: true });
});

// Post chat message with moderation check
app.post('/api/streams/:id/message', (req, res) => {
  const { text } = req.body;
  const streamId = req.params.id;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Text required' });
  }

  // Check global or stream mute
  if (currentUser.isMutedGlobal) {
    return res.status(403).json({ error: 'Your account is muted platform-wide.' });
  }

  const mod = getStreamModeration(streamId);
  if (mod.mutedUsers[currentUser.id]) {
    return res.status(403).json({ error: 'You are muted in this live stream. You can only watch.' });
  }
  if (mod.blockedUsers[currentUser.id]) {
    return res.status(403).json({ error: 'You have been blocked from this live stream.' });
  }

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    streamId,
    userId: currentUser.id,
    userName: currentUser.name,
    userAvatar: currentUser.avatar,
    userLevel: currentUser.level,
    text: text.trim(),
    type: 'chat',
    timestamp: Date.now(),
  };

  if (!streamChats[streamId]) {
    streamChats[streamId] = [];
  }
  streamChats[streamId].push(newMsg);
  if (streamChats[streamId].length > 150) {
    streamChats[streamId].shift();
  }

  res.json(newMsg);
});

// ================= LIVE MODERATION (MUTE & BLOCK USER REAL-TIME) =================

// Mute User in Stream
app.post('/api/streams/:id/mute-user', (req, res) => {
  const streamId = req.params.id;
  const { userId, userName, userAvatar, userLevel } = req.body;
  const stream = streams.find(s => s.id === streamId);

  if (!stream) return res.status(404).json({ error: 'Stream not found' });
  if (stream.streamerId !== currentUser.id && currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied: Only host or admin can mute users' });
  }

  const mod = getStreamModeration(streamId);
  mod.mutedUsers[userId] = {
    id: userId,
    name: userName || 'User',
    avatar: userAvatar || '',
    level: userLevel || 1,
    timestamp: Date.now(),
  };

  // Add system notice to chat
  const sysMsg: ChatMessage = {
    id: `sys_mute_${Date.now()}`,
    streamId,
    userId: 'system',
    userName: 'Moderator',
    userAvatar: '',
    userLevel: 99,
    text: `🔇 ${userName} was muted by the host.`,
    type: 'system',
    timestamp: Date.now(),
  };
  streamChats[streamId]?.push(sysMsg);

  res.json({ success: true, mutedUsers: Object.values(mod.mutedUsers), message: `${userName} is now muted` });
});

// Unmute User in Stream
app.post('/api/streams/:id/unmute-user', (req, res) => {
  const streamId = req.params.id;
  const { userId } = req.body;
  const mod = getStreamModeration(streamId);
  const user = mod.mutedUsers[userId];
  delete mod.mutedUsers[userId];

  if (user) {
    const sysMsg: ChatMessage = {
      id: `sys_unmute_${Date.now()}`,
      streamId,
      userId: 'system',
      userName: 'Moderator',
      userAvatar: '',
      userLevel: 99,
      text: `🔊 ${user.name} was unmuted.`,
      type: 'system',
      timestamp: Date.now(),
    };
    streamChats[streamId]?.push(sysMsg);
  }

  res.json({ success: true, mutedUsers: Object.values(mod.mutedUsers) });
});

// Block User from Stream (Cannot enter or view live stream)
app.post('/api/streams/:id/block-user', (req, res) => {
  const streamId = req.params.id;
  const { userId, userName, userAvatar, userLevel } = req.body;
  const stream = streams.find(s => s.id === streamId);

  if (!stream) return res.status(404).json({ error: 'Stream not found' });
  if (stream.streamerId !== currentUser.id && currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Permission denied: Only host or admin can block users' });
  }

  const mod = getStreamModeration(streamId);
  mod.blockedUsers[userId] = {
    id: userId,
    name: userName || 'User',
    avatar: userAvatar || '',
    level: userLevel || 1,
    timestamp: Date.now(),
  };

  // Also remove from viewers
  if (stream.viewerCount > 1) {
    stream.viewerCount -= 1;
  }

  // Add system notice to chat
  const sysMsg: ChatMessage = {
    id: `sys_block_${Date.now()}`,
    streamId,
    userId: 'system',
    userName: 'Moderator',
    userAvatar: '',
    userLevel: 99,
    text: `🚫 ${userName} was blocked and removed from this broadcast.`,
    type: 'system',
    timestamp: Date.now(),
  };
  streamChats[streamId]?.push(sysMsg);

  res.json({ success: true, blockedUsers: Object.values(mod.blockedUsers), message: `${userName} has been blocked from this live room` });
});

// Unblock User in Stream
app.post('/api/streams/:id/unblock-user', (req, res) => {
  const streamId = req.params.id;
  const { userId } = req.body;
  const mod = getStreamModeration(streamId);
  delete mod.blockedUsers[userId];
  res.json({ success: true, blockedUsers: Object.values(mod.blockedUsers) });
});

// Send gift in stream
app.post('/api/streams/:id/gift', (req, res) => {
  const { giftId, giftName, giftIcon, coinsCost, count = 1 } = req.body;
  const streamId = req.params.id;
  const totalCost = Number(coinsCost) * Number(count);

  if (currentUser.coinsBalance < totalCost) {
    return res.status(400).json({
      error: 'Solde insuffisant! Please deposit crypto to get more coins.',
      required: totalCost,
      current: currentUser.coinsBalance
    });
  }

  // Deduct coins from supporter
  currentUser.coinsBalance -= totalCost;

  // Streamer earns diamonds (configurable rate: e.g. 80% -> 10,000 coins = 8,000 diamonds)
  const modelRate = (platformSettings.modelRevenuePercentage || 80) / 100;
  const diamondsEarned = Math.floor(totalCost * modelRate);

  const stream = streams.find(s => s.id === streamId);
  if (stream) {
    stream.totalGiftsCoins += totalCost;
    stream.goal.current += totalCost;

    if (stream.streamerId === currentUser.id) {
      currentUser.diamondsBalance += diamondsEarned;
    } else {
      const modelUser = platformUsers.find(u => u.id === stream.streamerId);
      if (modelUser) modelUser.diamondsBalance += diamondsEarned;
    }
  }

  // Add gift message to stream chat
  const giftMsg: ChatMessage = {
    id: `gift_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    streamId,
    userId: currentUser.id,
    userName: currentUser.name,
    userAvatar: currentUser.avatar,
    userLevel: currentUser.level,
    text: `Sent ${count > 1 ? count + 'x ' : ''}${giftName} ${giftIcon} (${totalCost.toLocaleString()} coins)`,
    type: 'gift',
    gift: {
      giftId,
      giftName,
      giftIcon,
      coinsCost: totalCost,
      count: Number(count),
    },
    timestamp: Date.now(),
  };

  if (!streamChats[streamId]) {
    streamChats[streamId] = [];
  }
  streamChats[streamId].push(giftMsg);

  // Update top supporters
  const existingSupporter = topSupportersList.find(s => s.userId === currentUser.id);
  if (existingSupporter) {
    existingSupporter.totalCoins += totalCost;
    existingSupporter.lastGiftName = `${giftName} ${giftIcon}`;
  } else {
    topSupportersList.unshift({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userLevel: currentUser.level,
      totalCoins: totalCost,
      lastGiftName: `${giftName} ${giftIcon}`,
    });
  }
  topSupportersList.sort((a, b) => b.totalCoins - a.totalCoins);

  res.json({
    success: true,
    user: currentUser,
    message: giftMsg,
    diamondsEarned,
    newCoinsBalance: currentUser.coinsBalance,
  });
});

// Like stream
app.post('/api/streams/:id/like', (req, res) => {
  const stream = streams.find(s => s.id === req.params.id);
  if (stream) {
    stream.likesCount += 1;
  }
  res.json({ success: true, likesCount: stream?.likesCount || 0 });
});

// ================= DIRECT CRYPTO GATEWAY =================

app.post('/api/crypto/create-deposit', (req, res) => {
  const { amountUSD, cryptoCurrency } = req.body;
  const usd = Number(amountUSD) || 20;
  const currency = (cryptoCurrency || 'USDTTRC20').toUpperCase();

  const cryptoRates: Record<string, number> = {
    USDTTRC20: 1.0,
    USDTERC20: 1.0,
    BTC: 89000.0,
    ETH: 3200.0,
    SOL: 180.0,
    LTC: 92.0,
    TRX: 0.22,
  };

  const rate = cryptoRates[currency] || 1.0;
  const amountCrypto = parseFloat((usd / rate).toFixed(6));
  const coinsToCredit = Math.round(usd * 110);

  const paymentId = `GW_${Math.floor(100000000 + Math.random() * 900000000)}`;

  const sampleAddresses: Record<string, string> = {
    USDTTRC20: 'TQ9x4mKZy1gRtP7wQ38Yd4Z11vB7mNvTYDzs',
    USDTERC20: '0x71Cb05EE1b1F506fF321Da3dac38f25c0c9ce6E1',
    BTC: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    ETH: '0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7',
    SOL: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    LTC: 'LQTp8u2MhW1ZqV9s7vL3b4C7d2P9x6Y1Za',
    TRX: 'TW7hZ7tq9x4mKZy1gRtP7wQ38Yd4Z11vB7',
  };

  const payAddress = sampleAddresses[currency] || 'TQ9x4mKZy1gRtP7wQ38Yd4Z11vB7mNvTYDzs';

  const newTx: CryptoTx = {
    id: `tx_${Date.now()}`,
    userId: currentUser.id,
    type: 'deposit',
    cryptoCurrency: currency,
    amountCrypto,
    amountUSD: usd,
    coinsReceived: coinsToCredit,
    paymentId,
    payAddress,
    status: 'waiting',
    network: currency.includes('TRC') ? 'TRC20' : currency.includes('ERC') ? 'ERC20' : currency,
    createdAt: new Date().toISOString(),
  };

  transactions.unshift(newTx);

  res.json({
    paymentId,
    payAddress,
    amountCrypto,
    cryptoCurrency: currency,
    amountUSD: usd,
    coinsToCredit,
    status: 'waiting',
    qrData: `${currency.toLowerCase()}:${payAddress}?amount=${amountCrypto}`,
    expirationEstimate: '20 minutes',
  });
});

app.post('/api/crypto/confirm-deposit', (req, res) => {
  const { paymentId } = req.body;
  const tx = transactions.find(t => t.paymentId === paymentId);
  if (!tx) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  if (tx.status === 'finished') {
    return res.json({ success: true, tx, user: currentUser });
  }

  tx.status = 'finished';
  tx.txHash = `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
  
  if (tx.coinsReceived) {
    currentUser.coinsBalance += tx.coinsReceived;
  }

  res.json({
    success: true,
    tx,
    user: currentUser,
    message: `Payment confirmed! ${tx.coinsReceived?.toLocaleString()} coins added to your balance.`
  });
});

app.post('/api/crypto/request-withdraw', (req, res) => {
  const { diamondsAmount, cryptoCurrency, walletAddress, network } = req.body;
  const diamonds = Number(diamondsAmount);

  if (!diamonds || diamonds < 5000) {
    return res.status(400).json({ error: 'Minimum withdrawal is 5,000 diamonds ($50 USD)' });
  }

  if (!walletAddress || walletAddress.trim().length < 15) {
    return res.status(400).json({ error: 'Please enter a valid crypto wallet address' });
  }

  if (currentUser.diamondsBalance < diamonds) {
    return res.status(400).json({
      error: 'Solde de diamonds insuffisant!',
      available: currentUser.diamondsBalance,
      requested: diamonds,
    });
  }

  const grossUSD = diamonds / 100;
  const feeUSD = parseFloat((grossUSD * 0.03).toFixed(2));
  const netUSD = grossUSD - feeUSD;

  currentUser.diamondsBalance -= diamonds;

  const paymentId = `WD_${Math.floor(1000000 + Math.random() * 9000000)}`;
  const currency = (cryptoCurrency || 'USDTTRC20').toUpperCase();

  const newTx: CryptoTx = {
    id: `tx_${Date.now()}`,
    userId: currentUser.id,
    type: 'withdraw',
    cryptoCurrency: currency,
    amountCrypto: netUSD,
    amountUSD: netUSD,
    diamondsDeducted: diamonds,
    paymentId,
    payAddress: walletAddress.trim(),
    status: 'confirming',
    network: network || (currency.includes('TRC') ? 'TRC20' : 'ERC20'),
    createdAt: new Date().toISOString(),
  };

  transactions.unshift(newTx);

  res.json({
    success: true,
    tx: newTx,
    user: currentUser,
    message: `Withdrawal request of $${netUSD} (${diamonds.toLocaleString()} diamonds) submitted successfully via Blockchain Network.`
  });
});

// Platform configuration (Admin adjustable model revenue percentage)
interface PlatformSettings {
  modelRevenuePercentage: number; // e.g. 80 (meaning model gets 80% in diamonds, platform takes 20%)
  minWithdrawDiamonds: number;
  withdrawalFeePercentage: number;
}

let platformSettings: PlatformSettings = {
  modelRevenuePercentage: 80, // Default 80% (10,000 coins -> 8,000 diamonds)
  minWithdrawDiamonds: 1000,
  withdrawalFeePercentage: 3,
};

// Public platform settings endpoint
app.get('/api/platform/settings', (req, res) => {
  res.json({
    ...platformSettings,
    platformCommissionPercentage: 100 - platformSettings.modelRevenuePercentage,
  });
});

// Admin update settings
app.post('/api/admin/settings', (req, res) => {
  const { modelRevenuePercentage, minWithdrawDiamonds, withdrawalFeePercentage } = req.body;
  if (typeof modelRevenuePercentage === 'number') {
    if (modelRevenuePercentage < 1 || modelRevenuePercentage > 100) {
      return res.status(400).json({ error: 'Percentage must be between 1% and 100%' });
    }
    platformSettings.modelRevenuePercentage = Math.round(modelRevenuePercentage);
  }
  if (typeof minWithdrawDiamonds === 'number' && minWithdrawDiamonds > 0) {
    platformSettings.minWithdrawDiamonds = minWithdrawDiamonds;
  }
  if (typeof withdrawalFeePercentage === 'number' && withdrawalFeePercentage >= 0) {
    platformSettings.withdrawalFeePercentage = withdrawalFeePercentage;
  }

  res.json({
    success: true,
    settings: {
      ...platformSettings,
      platformCommissionPercentage: 100 - platformSettings.modelRevenuePercentage,
    },
    message: `Pourcentage modèle mis à jour : ${platformSettings.modelRevenuePercentage}% ! (Ex: 10 000 coins envoyés = ${Math.floor(10000 * (platformSettings.modelRevenuePercentage / 100)).toLocaleString()} diamants pour le modèle).`,
  });
});

app.get('/api/crypto/transactions', (req, res) => {
  res.json(transactions);
});

// ================= FULL ADMIN DASHBOARD APIS (SSOLO7IYAT ÉLKOL) =================

// Admin Overview
app.get('/api/admin/overview', (req, res) => {
  if (currentUser.role !== 'admin') {
    // Permit preview access for demonstration
  }

  const totalCoinsInCirculation = platformUsers.reduce((sum, u) => sum + (u.coinsBalance || 0), 0);
  const totalDiamondsInCirculation = platformUsers.reduce((sum, u) => sum + (u.diamondsBalance || 0), 0);
  const totalDepositedUSD = transactions
    .filter(t => t.type === 'deposit' && t.status === 'finished')
    .reduce((sum, t) => sum + (t.amountUSD || 0), 0);
  const totalWithdrawnUSD = transactions
    .filter(t => t.type === 'withdraw' && t.status === 'finished')
    .reduce((sum, t) => sum + (t.amountUSD || 0), 0);

  // Configurable platform commission on gifts + withdrawal fee
  const platformCommRate = (100 - (platformSettings.modelRevenuePercentage || 80)) / 100;
  const platformNetRevenueUSD = parseFloat((totalDepositedUSD * platformCommRate + totalWithdrawnUSD * (platformSettings.withdrawalFeePercentage / 100) + 245.80).toFixed(2));

  let totalBlockedUsers = 0;
  let totalMutedUsers = 0;
  Object.values(streamModerations).forEach(m => {
    totalBlockedUsers += Object.keys(m.blockedUsers).length;
    totalMutedUsers += Object.keys(m.mutedUsers).length;
  });

  const activeViewers = streams.filter(s => s.isLive).reduce((acc, s) => acc + s.viewerCount, 0);

  res.json({
    totalUsers: platformUsers.length,
    totalStreams: streams.filter(s => s.isLive).length,
    activeViewers,
    totalCoinsInCirculation,
    totalDiamondsInCirculation,
    totalDepositedUSD,
    totalWithdrawnUSD,
    platformNetRevenueUSD,
    totalBlockedUsers,
    totalMutedUsers,
  });
});

// Admin Users List
app.get('/api/admin/users', (req, res) => {
  res.json(platformUsers);
});

// Admin Update User Balance (Coins / Diamonds)
app.post('/api/admin/users/:id/update-balance', (req, res) => {
  const { coinsChange, diamondsChange } = req.body;
  const user = platformUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (typeof coinsChange === 'number') {
    user.coinsBalance = Math.max(0, user.coinsBalance + coinsChange);
    if (user.id === currentUser.id) currentUser.coinsBalance = user.coinsBalance;
  }
  if (typeof diamondsChange === 'number') {
    user.diamondsBalance = Math.max(0, user.diamondsBalance + diamondsChange);
    if (user.id === currentUser.id) currentUser.diamondsBalance = user.diamondsBalance;
  }

  res.json({ success: true, user });
});

// Admin Global Ban User
app.post('/api/admin/users/:id/ban', (req, res) => {
  const user = platformUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isBanned = !user.isBanned;
  if (user.id === currentUser.id) currentUser.isBanned = user.isBanned;

  // If user has an active stream, kill it
  if (user.isBanned) {
    const activeStream = streams.find(s => s.streamerId === user.id && s.isLive);
    if (activeStream) activeStream.isLive = false;
  }

  res.json({ success: true, user, message: user.isBanned ? `${user.name} banned` : `${user.name} unbanned` });
});

// Admin Global Mute User
app.post('/api/admin/users/:id/mute', (req, res) => {
  const user = platformUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.isMutedGlobal = !user.isMutedGlobal;
  if (user.id === currentUser.id) currentUser.isMutedGlobal = user.isMutedGlobal;

  res.json({ success: true, user, message: user.isMutedGlobal ? `${user.name} globally muted` : `${user.name} unmuted` });
});

// Admin Toggle User Role
app.post('/api/admin/users/:id/toggle-role', (req, res) => {
  const { role, isStreamer } = req.body;
  const user = platformUsers.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  if (role) user.role = role;
  if (typeof isStreamer === 'boolean') user.isStreamer = isStreamer;

  res.json({ success: true, user });
});

// Admin Live Streams Management (Force Kill / End Stream)
app.get('/api/admin/streams', (req, res) => {
  const detailedStreams = streams.map(s => {
    const mod = getStreamModeration(s.id);
    return {
      ...s,
      mutedCount: Object.keys(mod.mutedUsers).length,
      blockedCount: Object.keys(mod.blockedUsers).length,
    };
  });
  res.json(detailedStreams);
});

app.post('/api/admin/streams/:id/kill', (req, res) => {
  const stream = streams.find(s => s.id === req.params.id);
  if (!stream) return res.status(404).json({ error: 'Stream not found' });

  stream.isLive = false;
  // Push system message
  const sysMsg: ChatMessage = {
    id: `sys_kill_${Date.now()}`,
    streamId: stream.id,
    userId: 'system',
    userName: 'Admin',
    userAvatar: '',
    userLevel: 100,
    text: '🚨 This live stream has been terminated by Platform Administration.',
    type: 'system',
    timestamp: Date.now(),
  };
  streamChats[stream.id]?.push(sysMsg);

  res.json({ success: true, message: `Stream "${stream.title}" terminated by Administrator.` });
});

// Admin Transactions Override (Approve / Reject / Complete)
app.post('/api/admin/transactions/:id/action', (req, res) => {
  const { action } = req.body; // 'approve' | 'reject' | 'finish'
  const tx = transactions.find(t => t.id === req.params.id);
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });

  if (action === 'finish' || action === 'approve') {
    tx.status = 'finished';
    tx.txHash = tx.txHash || `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`;
    if (tx.type === 'deposit' && tx.coinsReceived) {
      const u = platformUsers.find(user => user.id === tx.userId);
      if (u) u.coinsBalance += tx.coinsReceived;
      if (tx.userId === currentUser.id) currentUser.coinsBalance += tx.coinsReceived;
    }
  } else if (action === 'reject') {
    tx.status = 'failed';
    // Refund diamonds if it was a withdrawal
    if (tx.type === 'withdraw' && tx.diamondsDeducted) {
      const u = platformUsers.find(user => user.id === tx.userId);
      if (u) u.diamondsBalance += tx.diamondsDeducted;
      if (tx.userId === currentUser.id) currentUser.diamondsBalance += tx.diamondsDeducted;
    }
  }

  res.json({ success: true, tx });
});

// Admin All Moderation Records
app.get('/api/admin/moderation', (req, res) => {
  const records: Array<{
    streamId: string;
    streamTitle: string;
    streamerName: string;
    userId: string;
    userName: string;
    type: 'muted' | 'blocked';
    timestamp: number;
  }> = [];

  Object.entries(streamModerations).forEach(([streamId, mod]) => {
    const stream = streams.find(s => s.id === streamId);
    const title = stream?.title || streamId;
    const streamerName = stream?.streamerName || 'Streamer';

    Object.values(mod.mutedUsers).forEach(u => {
      records.push({
        streamId,
        streamTitle: title,
        streamerName,
        userId: u.id,
        userName: u.name,
        type: 'muted',
        timestamp: u.timestamp,
      });
    });

    Object.values(mod.blockedUsers).forEach(u => {
      records.push({
        streamId,
        streamTitle: title,
        streamerName,
        userId: u.id,
        userName: u.name,
        type: 'blocked',
        timestamp: u.timestamp,
      });
    });
  });

  res.json(records);
});

// ================= M3U8 TEST ENDPOINT =================
app.get('/api/hls/live.m3u8', (req, res) => {
  res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const playlist = `#EXTM3U
#EXT-X-VERSION:3
#EXT-X-TARGETDURATION:10
#EXT-X-MEDIA-SEQUENCE:0
#EXTINF:10.0,
https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_7.ts
#EXTINF:10.0,
https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_8.ts
#EXTINF:10.0,
https://test-streams.mux.dev/x36xhzz/url_0/193039199_mp4_h264_aac_hd_9.ts
#EXT-X-ENDLIST`;
  res.send(playlist);
});

// Unified Dashboard Statistics (Model + Da3ém / Supporter)
app.get('/api/dashboard/stats', (req, res) => {
  const totalDiamondsEarned = currentUser.diamondsBalance + 28500;
  const totalEarnedUSD = (totalDiamondsEarned / 100);
  
  const totalCoinsSpent = 18500;
  const totalCoinsDeposited = transactions
    .filter(t => t.type === 'deposit' && t.status === 'finished')
    .reduce((acc, t) => acc + (t.coinsReceived || 0), 0);

  const dailyStats = [
    { date: 'Mon', diamonds: 3200, usd: 32.0, viewers: 840, giftsCount: 45 },
    { date: 'Tue', diamonds: 4800, usd: 48.0, viewers: 1120, giftsCount: 62 },
    { date: 'Wed', diamonds: 7500, usd: 75.0, viewers: 1680, giftsCount: 94 },
    { date: 'Thu', diamonds: 5400, usd: 54.0, viewers: 1350, giftsCount: 78 },
    { date: 'Fri', diamonds: 11200, usd: 112.0, viewers: 2400, giftsCount: 145 },
    { date: 'Sat', diamonds: 16800, usd: 168.0, viewers: 3100, giftsCount: 210 },
    { date: 'Sun', diamonds: 14500, usd: 145.0, viewers: 2950, giftsCount: 185 },
  ];

  const giftsBreakdown = [
    { name: 'Rose 🌹', count: 640, coins: 6400, share: 12 },
    { name: 'Heart Rocket 🚀', count: 180, coins: 9000, share: 16 },
    { name: 'Diamond Ring 💍', count: 42, coins: 21000, share: 22 },
    { name: 'Sports Car 🏎️', count: 15, coins: 30000, share: 28 },
    { name: 'Fiery Dragon 🐉', count: 3, coins: 30000, share: 22 },
  ];

  res.json({
    user: currentUser,
    summary: {
      diamondsBalance: currentUser.diamondsBalance,
      diamondsUSD: (currentUser.diamondsBalance / 100).toFixed(2),
      coinsBalance: currentUser.coinsBalance,
      totalEarnedUSD: totalEarnedUSD.toFixed(2),
      totalCoinsDeposited,
      totalCoinsSpent,
      streamHours: 42.5,
      totalViewers: 14850,
      totalGiftsReceived: 1080,
    },
    topSupporters: topSupportersList,
    dailyStats,
    giftsBreakdown,
    recentTransactions: transactions.slice(0, 10),
  });
});

// Vite middleware or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
