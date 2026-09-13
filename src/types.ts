export type GiftTier = 'common' | 'rare' | 'epic' | 'legendary';

export interface GiftItem {
  id: string;
  name: string;
  icon: string;
  coinsCost: number;
  diamondValue: number;
  tier: GiftTier;
  animationType: 'rose' | 'rocket' | 'car' | 'dragon' | 'crown' | 'ring' | 'yacht';
  description: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  avatar: string;
  bio: string;
  coinsBalance: number;
  diamondsBalance: number; // 100 diamonds = $1 USD
  level: number;
  followers: number;
  following: number;
  isStreamer: boolean;
  walletAddress?: string;
  country?: string;
  countryFlag?: string;
  countryName?: string;
  role?: 'admin' | 'model' | 'user';
  isBanned?: boolean;
  isMutedGlobal?: boolean;
  createdAt?: string;
  age?: number;
  fansCount?: number;
  subtitle?: string;
  quote?: string;
  verified?: boolean;
  gainsFormatted?: string;
  followersFormatted?: string;
  fansFormatted?: string;
  authProvider?: 'google' | 'phone';
  phoneNumber?: string;
  totalDepositedUSD?: number;
  streamHours?: number;
  language?: 'ar' | 'fr' | 'en' | 'es' | 'pt';
}

export type SupportedLanguage = 'ar' | 'fr' | 'en' | 'es' | 'pt';

export interface LiveStreamItem {
  id: string;
  streamerId: string;
  streamerName: string;
  streamerUsername?: string;
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
  mutedUsers?: string[];
  blockedUsers?: string[];
  goal: {
    title: string;
    current: number;
    target: number;
  };
  startedAt: string;
}

export interface DirectMessage {
  id: string;
  conversationId: string;
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

export interface DirectConversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  participantCountry?: string;
  participantCountryFlag?: string;
  isLive: boolean;
  streamId?: string;
  isMutualFollow: boolean;
  isUnlockedByGift: boolean;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: number;
  lastMessageSenderId: string;
  isOnline: boolean;
  lastSeenText: string;
  isFavorite?: boolean;
  isGifter?: boolean;
}

export interface AdminOverviewStats {
  totalUsers: number;
  totalStreams: number;
  activeViewers: number;
  totalCoinsInCirculation: number;
  totalDiamondsInCirculation: number;
  totalDepositedUSD: number;
  totalWithdrawnUSD: number;
  platformNetRevenueUSD: number;
  totalBlockedUsers: number;
  totalMutedUsers: number;
}

export interface AdminUserItem extends UserProfile {
  role: 'admin' | 'model' | 'user';
  isBanned: boolean;
  isMutedGlobal: boolean;
  createdAt: string;
}

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

export interface TopSupporter {
  userId: string;
  userName: string;
  userAvatar: string;
  userLevel: number;
  totalCoins: number;
  lastGiftName: string;
}

export interface DailyStat {
  date: string;
  diamonds: number;
  usd: number;
  viewers: number;
  giftsCount: number;
}

export interface DashboardStatsResponse {
  user: UserProfile;
  summary: {
    diamondsBalance: number;
    diamondsUSD: string;
    coinsBalance: number;
    totalEarnedUSD: string;
    totalCoinsDeposited: number;
    totalCoinsSpent: number;
    streamHours: number;
    totalViewers: number;
    totalGiftsReceived: number;
  };
  topSupporters: TopSupporter[];
  dailyStats: DailyStat[];
  giftsBreakdown: Array<{ name: string; count: number; coins: number; share: number }>;
  recentTransactions: CryptoTx[];
}
