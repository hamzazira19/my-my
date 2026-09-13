import React, { useState } from 'react';
import {
  User, ShieldCheck, Mail, Phone, Image as ImageIcon,
  Sparkles, Check, RefreshCw, BarChart3, TrendingUp,
  Globe, HelpCircle, Headphones, MessageCircle, Send,
  FileText, ExternalLink, ChevronDown, ChevronUp, AlertCircle,
  Coins, Gem, Clock, Award, ArrowDownLeft, ArrowUpRight, Search
} from 'lucide-react';
import { UserProfile, SupportedLanguage } from '../types';
import { generateAnimalUsername } from '../data/mockModels';
import { TRANSLATIONS } from '../data/translations';

export type SettingsTab = 'info' | 'statistics' | 'language' | 'faq' | 'support';

interface SettingsPageProps {
  currentUser: UserProfile;
  initialTab?: SettingsTab;
  onUpdateUser: (updatedUser: Partial<UserProfile>) => void;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onNavigate: (view: 'home' | 'followings' | 'chat' | 'dashboard' | 'settings') => void;
  onOpenDeposit: () => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
];

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  initialTab = 'info',
  onUpdateUser,
  onLanguageChange,
  onNavigate,
  onOpenDeposit,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const currentLang = (currentUser.language || 'fr') as SupportedLanguage;
  const t = TRANSLATIONS[currentLang] || TRANSLATIONS.fr;

  // Form State for Info tab
  const [name, setName] = useState(currentUser.name);
  const [username, setUsername] = useState(currentUser.username || generateAnimalUsername());
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [bio, setBio] = useState(currentUser.bio || '');
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>(currentUser.authProvider || 'google');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '+216 98 123 456');
  const [customAvatarInput, setCustomAvatarInput] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // FAQ state
  const [faqSearch, setFaqSearch] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Support state
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('deposit');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSent, setTicketSent] = useState(false);

  // Live support chat simulation
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: 'Bonjour ! Bienvenue au support LiveVibe Crypto. Comment pouvons-nous vous aider aujourd’hui ?',
      time: '12:00'
    }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      username: username.startsWith('@') ? username : `@${username}`,
      avatar,
      bio,
      authProvider: authMethod,
      phoneNumber,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRegenerateAnimalUsername = () => {
    const newAnimal = generateAnimalUsername();
    setUsername(newAnimal);
  };

  const handleSendSupportChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText, time: timeNow }]);
    setChatInput('');

    // Auto agent reply
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: 'Merci pour votre message. Un agent de support analyse votre demande (#TKT-' + Math.floor(1000 + Math.random() * 9000) + '). Si vous avez des questions sur vos dépôts crypto ou retraits, les fonds arrivent en moyenne sous 2 à 5 minutes.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 1000);
  };

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    setTicketSent(true);
    setTicketSubject('');
    setTicketMessage('');
    setTimeout(() => setTicketSent(false), 5000);
  };

  const FAQ_ITEMS = [
    {
      question: 'Comment recharger mon solde de pièces en Crypto (USDT, BTC, TON) ?',
      answer: 'Cliquez sur le bouton "Recharger" en haut à droite. Choisissez la devise (USDT TRC20, BTC, TON, ETH) et le montant souhaité. Vous recevrez une adresse unique de dépôt blockchain. Dès confirmation sur la blockchain, vos pièces sont créditées automatiquement sous 2 minutes sans frais intermédiaires.',
      category: 'Dépôts & Retraits',
    },
    {
      question: 'Comment lancer un live et convertir mes diamants en argent réel ?',
      answer: 'Tout utilisateur peut devenir créateur en cliquant sur "Lancer un Live". Lorsque les spectateurs vous envoient des cadeaux virtuels, vous gagnez des diamants (100 diamants = 1$ USD). Vous pouvez demander un retrait direct vers votre portefeuille crypto à tout moment dès 10$ de gains.',
      category: 'Modèles & Gains',
    },
    {
      question: 'Comment fonctionne le nom d’utilisateur animal unique ?',
      answer: 'Lors de la création de votre compte, un nom d’utilisateur animal (ex: @panther_gold, @falcon_99) vous est attribué automatiquement. Vous pouvez le conserver tel quel ou le modifier librement dans vos Paramètres du compte.',
      category: 'Compte & Profil',
    },
    {
      question: 'Quelles sont les règles de la communauté pendant les lives ?',
      answer: 'LiveVibe garantit un espace sûr et bienveillant. Les propos haineux, le harcèlement, et les contenus illicites sont strictement interdits et entraînent un bannissement immédiat. Des modérateurs certifiés veillent en continu sur la plateforme.',
      category: 'Sécurité & Modération',
    },
    {
      question: 'Comment envoyer des cadeaux aux modèles en direct ?',
      answer: 'Dans la salle de live, cliquez sur l’icône cadeau en bas pour ouvrir le panneau de cadeaux (Roses, Cœurs, Dragons, Yachts, etc.). Chaque cadeau envoyé déclenche une animation spectaculaire sur le live du modèle et fait monter votre badge VIP.',
      category: 'Cadeaux & VIP',
    },
  ];

  const filteredFaq = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#0b0e14] text-slate-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
              <User className="w-7 h-7 text-purple-400" />
              <span>{t.parameters}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Gérez votre profil, vos informations de connexion, vos statistiques et vos préférences
            </p>
          </div>

          {/* Quick Balance Preview */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 px-4 shadow-md">
            <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{currentUser.coinsBalance.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-normal">Coins</span>
            </div>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-purple-300 font-extrabold text-sm">
              <Gem className="w-4 h-4 text-purple-400" />
              <span>{currentUser.diamondsBalance.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-normal">💎</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t.accountInfo}</span>
          </button>

          <button
            onClick={() => setActiveTab('statistics')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'statistics'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t.statistics}</span>
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'language'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>{t.language}</span>
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{t.faq}</span>
          </button>

          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === 'support'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>{t.support}</span>
          </button>
        </div>

        {/* TAB 1: PARAMETER INFO */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Avatar & Identity Card */}
            <div className="lg:col-span-1 p-6 rounded-3xl bg-[#111726] border border-slate-800 space-y-6 flex flex-col items-center text-center">
              <div className="relative group">
                <img
                  src={avatar}
                  alt={name}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover ring-4 ring-purple-500/50 shadow-2xl shadow-purple-950/60"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white p-2 rounded-xl shadow-lg border border-purple-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-white font-['Outfit'] flex items-center justify-center gap-2">
                  <span>{name}</span>
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </h3>
                <p className="text-sm font-bold text-pink-400 mt-0.5">
                  {username}
                </p>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {bio || 'Aucune biographie définie.'}
                </p>
              </div>

              {/* Avatar Preset Picker */}
              <div className="w-full pt-4 border-t border-slate-800/80 text-left">
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  {t.changeAvatar} (Presets)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVATAR_PRESETS.map((pUrl, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(pUrl)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 cursor-pointer ${
                        avatar === pUrl ? 'border-purple-500 ring-2 ring-purple-400' : 'border-slate-800'
                      }`}
                    >
                      <img src={pUrl} alt={`Preset ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      {avatar === pUrl && (
                        <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white font-bold" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {/* Custom Avatar URL */}
                <div className="mt-3">
                  <label className="text-[11px] text-slate-400 block mb-1">Ou URL d'image personnalisée :</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={customAvatarInput}
                      onChange={(e) => setCustomAvatarInput(e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customAvatarInput.trim()) {
                          setAvatar(customAvatarInput.trim());
                          setCustomAvatarInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-white font-bold cursor-pointer"
                    >
                      OK
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Personal Details & Registration Info */}
            <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800">
              <form onSubmit={handleSaveInfo} className="space-y-6">

                {/* Notification Banner on Save */}
                {saveSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 animate-fade-in">
                    <Check className="w-5 h-5" />
                    <span>{t.savedSuccessfully}</span>
                  </div>
                )}

                {/* Section: Registration Method (Gmail or Phone) */}
                <div>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2 mb-2">
                    <Mail className="w-4 h-4 text-purple-400" />
                    <span>{t.registeredWith}</span>
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Indique comment votre compte a été créé et permet de basculer ou lier votre identifiant
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Google / Gmail Option */}
                    <div
                      onClick={() => setAuthMethod('google')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        authMethod === 'google'
                          ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{t.gmailAccount}</span>
                            {authMethod === 'google' && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">Actif</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">
                            {currentUser.email}
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        authMethod === 'google' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'
                      }`}>
                        {authMethod === 'google' && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>

                    {/* Phone Number Option */}
                    <div
                      onClick={() => setAuthMethod('phone')}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        authMethod === 'phone'
                          ? 'bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{t.phoneNumber}</span>
                            {authMethod === 'phone' && (
                              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded-full font-bold">Actif</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {phoneNumber}
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        authMethod === 'phone' ? 'border-purple-400 bg-purple-500' : 'border-slate-600'
                      }`}>
                        {authMethod === 'phone' && <Check className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                  </div>

                  {/* If phone is selected, allow editing number */}
                  {authMethod === 'phone' && (
                    <div className="mt-3">
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        Modifier le numéro de téléphone vérifié :
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="+216 98 123 456"
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>

                {/* Section: Name & Animal Username */}
                <div className="space-y-4 pt-4 border-t border-slate-800/80">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Display Name */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1">
                        {t.changeName}
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    {/* Animal-generated Username */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">
                          {t.username}
                        </label>
                        <button
                          type="button"
                          onClick={handleRegenerateAnimalUsername}
                          className="text-[11px] text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer"
                          title="Générer un autre pseudo animal aléatoire"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Générer animal</span>
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="@falcon_99"
                          required
                          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-pink-400 font-extrabold focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {t.generatedAnimalUsername} (modulable à tout moment).
                      </p>
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      Biographie / Présentation
                    </label>
                    <textarea
                      rows={3}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Parlez un peu de vous..."
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-xl shadow-purple-950/50 cursor-pointer transition-transform hover:scale-[1.02] flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.saveChanges}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* TAB 2: STATISTIQUES & ACTIVITÉ */}
        {activeTab === 'statistics' && (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Deposited */}
              <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-white font-['Outfit']">
                  ${(currentUser.totalDepositedUSD ?? 320.0).toFixed(2)} USD
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.totalDeposited} (Crypto)</div>
                <button
                  onClick={onOpenDeposit}
                  className="mt-4 text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>Recharger mon compte</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              {/* Total Stream Hours */}
              <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center mb-4">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-white font-['Outfit']">
                  {currentUser.streamHours ?? 48.5} h
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.streamHours}</div>
                <div className="mt-4 text-xs text-pink-400 font-bold">
                  24 sessions diffusées
                </div>
              </div>

              {/* Coins Balance & Spent */}
              <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                  <Coins className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-amber-300 font-['Outfit']">
                  {currentUser.coinsBalance.toLocaleString()}
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.coinsBalance}</div>
                <div className="mt-4 text-xs text-slate-400">
                  Total dépensé : <span className="text-amber-400 font-bold">18 500 Coins</span>
                </div>
              </div>

              {/* Diamonds Balance & Earnings */}
              <div className="p-6 rounded-3xl bg-[#111726] border border-slate-800 relative overflow-hidden group">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                  <Gem className="w-5 h-5" />
                </div>
                <div className="text-2xl font-black text-purple-300 font-['Outfit']">
                  {currentUser.diamondsBalance.toLocaleString()} 💎
                </div>
                <div className="text-xs text-slate-400 mt-1">{t.diamondsBalance}</div>
                <div className="mt-4 text-xs text-purple-400 font-bold">
                  Valeur : ${(currentUser.diamondsBalance / 100).toFixed(2)} USD
                </div>
              </div>
            </div>

            {/* Detailed Activity & Transaction Table */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white font-['Outfit']">
                    {t.activityHistory}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Historique de vos dépôts, retraits et sessions de live
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  Synchronisé Blockchain
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    type: 'deposit',
                    title: 'Dépôt Crypto USDT TRC20',
                    amount: '+$50.00 USD (5 500 Coins)',
                    date: 'Aujourd’hui, 14:32',
                    status: 'Confirmé',
                    hash: '0x9a8f...3746',
                  },
                  {
                    type: 'live',
                    title: 'Session Live Stream - Soirée Lounge',
                    amount: '+4 200 Diamants (3.2 hrs)',
                    date: 'Hier, 22:15',
                    status: 'Terminé',
                    hash: 'Session #8912',
                  },
                  {
                    type: 'deposit',
                    title: 'Dépôt Crypto Bitcoin (BTC)',
                    amount: '+$120.00 USD (13 200 Coins)',
                    date: '08 Septembre, 18:40',
                    status: 'Confirmé',
                    hash: '0x334b...18a0',
                  },
                  {
                    type: 'withdraw',
                    title: 'Retrait Gains vers Wallet TRC20',
                    amount: '-$75.00 USD (7 500 Diamants)',
                    date: '05 Septembre, 11:10',
                    status: 'Confirmé',
                    hash: '0x712a...98bf',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        item.type === 'deposit'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : item.type === 'withdraw'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {item.type === 'deposit' ? <ArrowDownLeft className="w-5 h-5" /> : item.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{item.title}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span>{item.date}</span>
                          <span>•</span>
                          <span className="font-mono text-slate-500">{item.hash}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-sm font-black ${
                        item.type === 'deposit' ? 'text-emerald-400' : item.type === 'withdraw' ? 'text-amber-400' : 'text-purple-400'
                      }`}>
                        {item.amount}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LANGUE DU SITE */}
        {activeTab === 'language' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6">
            <div>
              <h3 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                <span>{t.language}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choisissez votre langue préférée pour l’interface (Arabe, Français, Anglais, Espagnol, Portugais)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { code: 'ar', label: 'العربية', flag: '🇸🇦', desc: 'اللغة العربية مع دعم كامل' },
                { code: 'fr', label: 'Français', flag: '🇫🇷', desc: 'Langue française par défaut' },
                { code: 'en', label: 'English', flag: '🇬🇧', desc: 'International English' },
                { code: 'es', label: 'Español', flag: '🇪🇸', desc: 'Idioma español' },
                { code: 'pt', label: 'Português', flag: '🇵🇹', desc: 'Língua portuguesa' },
              ].map((lang) => {
                const isSelected = currentLang === lang.code;

                return (
                  <div
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code as SupportedLanguage);
                      onUpdateUser({ language: lang.code as SupportedLanguage });
                    }}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-purple-950/50 border-purple-500 ring-2 ring-purple-500 shadow-lg shadow-purple-950/40'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{lang.flag}</span>
                      <div>
                        <div className="text-base font-black text-white">{lang.label}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{lang.desc}</div>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-purple-400 bg-purple-500' : 'border-slate-700'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: FAQ */}
        {activeTab === 'faq' && (
          <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-white font-['Outfit'] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-purple-400" />
                  <span>{t.faq}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Trouvez rapidement les réponses à vos questions les plus fréquentes
                </p>
              </div>

              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder={t.faqSearchPlaceholder}
                  className="pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 w-64"
                />
              </div>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              {filteredFaq.map((item, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={index}
                    className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-slate-800/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                          {item.category}
                        </span>
                        <span className="text-sm font-extrabold text-white">
                          {item.question}
                        </span>
                      </div>
                      <div className="text-slate-400">
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/50">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: CONTACT SUPPORT */}
        {activeTab === 'support' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Live Chat Simulator */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800 flex flex-col h-[500px]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <span className="w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#111726] absolute bottom-0 right-0" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Support LiveVibe 24/7</h4>
                    <p className="text-[11px] text-emerald-400 font-semibold">En ligne • Réponse immédiate</p>
                  </div>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="flex-1 overflow-y-auto py-4 space-y-3 scrollbar-thin">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-bl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSendSupportChat} className="pt-3 border-t border-slate-800 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Posez votre question au support..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Ticket Submission & Direct Contact Channels */}
            <div className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-[#111726] border border-slate-800">
                <h4 className="text-base font-extrabold text-white mb-1">
                  Ouvrir un ticket d’assistance
                </h4>
                <p className="text-xs text-slate-400 mb-5">
                  Pour les réclamations financières, signalements ou demandes complexes
                </p>

                {ticketSent && (
                  <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-4 flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{t.ticketSubmitted}</span>
                  </div>
                )}

                <form onSubmit={handleSendTicket} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      {t.ticketSubject}
                    </label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Ex: Problème dépôt USDT ou bug affichage live"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      {t.ticketCategory}
                    </label>
                    <select
                      value={ticketCategory}
                      onChange={(e) => setTicketCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="deposit">Dépôt Crypto & Solde de Pièces</option>
                      <option value="withdraw">Retrait de Gains Diamants</option>
                      <option value="stream">Problème Caméra ou Diffusion Live</option>
                      <option value="account">Sécurité du Compte & Identifiants</option>
                      <option value="other">Autre demande</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 block mb-1">
                      {t.ticketMessage}
                    </label>
                    <textarea
                      rows={3}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Indiquez tous les détails utiles (ID transaction, modèle concerné...)"
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs cursor-pointer transition-colors shadow-lg shadow-purple-950/40"
                  >
                    {t.submitTicket}
                  </button>
                </form>
              </div>

              {/* Direct channels */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="mailto:support@livevibe.io"
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 transition-colors flex items-center gap-3"
                >
                  <Mail className="w-5 h-5 text-pink-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Email Support</div>
                    <div className="text-[10px] text-slate-400">support@livevibe.io</div>
                  </div>
                </a>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-colors flex items-center gap-3">
                  <MessageCircle className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Telegram / WhatsApp</div>
                    <div className="text-[10px] text-slate-400">@LiveVibeSupport</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
