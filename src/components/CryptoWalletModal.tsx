import React, { useState, useEffect } from 'react';
import {
  X, ArrowDownLeft, ArrowUpRight, Copy, Check, ExternalLink,
  QrCode, AlertCircle, Clock, CheckCircle2, RefreshCw, Zap,
  Coins, Gem, Wallet, ArrowRight, Sparkles
} from 'lucide-react';
import { UserProfile, CryptoTx } from '../types';
import { CRYPTO_OPTIONS, COIN_PACKAGES } from '../data/gifts';

interface CryptoWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  initialTab?: 'deposit' | 'withdraw';
}

interface DepositInvoice {
  paymentId: string;
  payAddress: string;
  amountCrypto: number;
  cryptoCurrency: string;
  amountUSD: number;
  coinsToCredit: number;
  status: 'waiting' | 'confirming' | 'finished';
  qrData: string;
  expirationEstimate: string;
}

export const CryptoWalletModal: React.FC<CryptoWalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  initialTab = 'deposit',
}) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'history'>(initialTab);
  
  // Deposit state
  const [selectedCurrency, setSelectedCurrency] = useState('USDTTRC20');
  const [selectedPackage, setSelectedPackage] = useState(COIN_PACKAGES[2]); // $50 default
  const [customUSD, setCustomUSD] = useState('');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<DepositInvoice | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSimulatingConfirm, setIsSimulatingConfirm] = useState(false);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState<string | null>(null);

  // Withdraw state
  const [withdrawDiamonds, setWithdrawDiamonds] = useState('5000');
  const [withdrawCurrency, setWithdrawCurrency] = useState('USDTTRC20');
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawSuccessMsg, setWithdrawSuccessMsg] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<CryptoTx[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load transactions when opened
  useEffect(() => {
    if (isOpen) {
      loadTransactions();
    }
  }, [isOpen]);

  const loadTransactions = async () => {
    setIsLoadingTx(true);
    try {
      const res = await fetch('/api/crypto/transactions');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTransactions(data);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoadingTx(false);
    }
  };

  // Generate Direct Crypto Deposit Invoice
  const handleCreateDeposit = async () => {
    setIsGeneratingInvoice(true);
    setDepositSuccessMsg(null);
    const amount = customUSD ? Number(customUSD) : selectedPackage.usd;

    try {
      const res = await fetch('/api/crypto/create-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUSD: amount,
          cryptoCurrency: selectedCurrency,
        })
      });

      const data = await res.json();
      if (data.paymentId) {
        setCurrentInvoice(data);
        loadTransactions();
      }
    } catch (err) {
      console.error('Crypto Gateway error:', err);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  // Simulate Instant Blockchain Payment Confirmation (Network sandbox verification)
  const handleSimulatePayment = async () => {
    if (!currentInvoice) return;
    setIsSimulatingConfirm(true);

    try {
      const res = await fetch('/api/crypto/confirm-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: currentInvoice.paymentId })
      });

      const data = await res.json();
      if (data.success) {
        setCurrentInvoice(prev => prev ? { ...prev, status: 'finished' } : null);
        if (data.user) {
          onUpdateUser(data.user);
        }
        setDepositSuccessMsg(data.message || 'Payment confirmed and coins added successfully!');
        loadTransactions();
      }
    } catch (err) {
      console.error('Confirmation error:', err);
    } finally {
      setIsSimulatingConfirm(false);
    }
  };

  // Handle Withdraw Request
  const handleRequestWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawSuccessMsg(null);

    const diamonds = Number(withdrawDiamonds);
    if (!diamonds || diamonds < 5000) {
      setWithdrawError('Minimum withdrawal is 5,000 diamonds ($50 USD).');
      return;
    }

    if (!walletAddress.trim() || walletAddress.trim().length < 15) {
      setWithdrawError('Please enter a valid crypto wallet address.');
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const res = await fetch('/api/crypto/request-withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          diamondsAmount: diamonds,
          cryptoCurrency: withdrawCurrency,
          walletAddress: walletAddress.trim(),
          network: withdrawCurrency.includes('TRC') ? 'TRC20' : 'ERC20',
        })
      });

      const data = await res.json();
      if (data.error) {
        setWithdrawError(data.error);
        return;
      }

      if (data.user) {
        onUpdateUser(data.user);
      }
      setWithdrawSuccessMsg(data.message || 'Withdrawal requested successfully.');
      setWalletAddress('');
      loadTransactions();
    } catch (err) {
      console.error('Withdrawal error:', err);
      setWithdrawError('Network error occurred during withdrawal request.');
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Copy to clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!isOpen) return null;

  const currentUSDValue = (currentUser.diamondsBalance / 100).toFixed(2);
  const withdrawUSD = (Number(withdrawDiamonds) / 100) || 0;
  const withdrawFee = (withdrawUSD * 0.03);
  const netPayout = Math.max(0, withdrawUSD - withdrawFee);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0e1320] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-[#121829]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#0c101b] rounded-[14px] flex items-center justify-center text-amber-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white font-['Outfit']">Crypto Wallet & Gateway</h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Instant Blockchain Network
                </span>
              </div>
              <p className="text-xs text-slate-400">Instant Crypto Deposits & Creator Withdrawals</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-800 bg-[#0a0d16] px-6">
          <button
            onClick={() => { setActiveTab('deposit'); setCurrentInvoice(null); }}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'deposit'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Deposit Crypto (Buy Coins)</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'withdraw'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Withdraw Crypto (Cashout)</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-bold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'history'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Transactions</span>
          </button>
        </div>

        {/* Balance Status Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-slate-900 via-[#111728] to-slate-900 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400 font-medium">Solde Coins (Supporter) :</span>
            <span className="font-extrabold text-amber-300">{currentUser.coinsBalance.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400 font-medium">Gains Modèle (Diamants) :</span>
            <span className="font-extrabold text-cyan-300">
              {currentUser.diamondsBalance.toLocaleString()} 💎 (${currentUSDValue} USD)
            </span>
          </div>
        </div>

        {/* Informative Note: Coins -> Diamonds Conversion for Models */}
        <div className="px-6 py-2 bg-purple-950/40 border-b border-purple-500/20 text-[11px] text-purple-200 flex items-center justify-between">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            Conversion active pour les modèles : <strong>80%</strong> en Diamants lors des cadeaux (ex: 10 000 Coins reçus = 8 000 Diamants crédités au modèle).
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* ================= TAB 1: CRYPTO DEPOSIT ================= */}
          {activeTab === 'deposit' && (
            <div className="space-y-6">
              {!currentInvoice ? (
                <>
                  {/* Step 1: Select Crypto Currency */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                      1. Select Deposit Cryptocurrency
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {CRYPTO_OPTIONS.map((crypto) => (
                        <button
                          key={crypto.id}
                          type="button"
                          onClick={() => setSelectedCurrency(crypto.id)}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                            selectedCurrency === crypto.id
                              ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-900/20'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-amber-400 text-sm">
                              {crypto.icon}
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white">{crypto.name}</div>
                              <div className="text-[10px] text-slate-400">{crypto.network}</div>
                            </div>
                          </div>
                          {crypto.badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                              {crypto.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Coins Package */}
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-2">
                      2. Choose Coin Package (USD)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {COIN_PACKAGES.map((pkg) => (
                        <button
                          key={pkg.usd}
                          type="button"
                          onClick={() => { setSelectedPackage(pkg); setCustomUSD(''); }}
                          className={`p-3 rounded-2xl border text-left relative cursor-pointer transition-all ${
                            selectedPackage.usd === pkg.usd && !customUSD
                              ? 'bg-purple-600/20 border-purple-500 text-white shadow-md shadow-purple-900/30'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {pkg.popular && (
                            <span className="absolute -top-2 right-2 px-2 py-0.2 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-black text-[9px] font-black uppercase">
                              Best Value
                            </span>
                          )}
                          <div className="text-sm font-black text-amber-300">
                            {pkg.coins.toLocaleString()} Coins
                          </div>
                          <div className="text-xs font-bold text-white mt-0.5">
                            ${pkg.usd} USD
                          </div>
                          <div className="text-[10px] text-purple-400 font-bold mt-1">
                            {pkg.bonus}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Crypto Payment Button */}
                  <button
                    onClick={handleCreateDeposit}
                    disabled={isGeneratingInvoice}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-black font-black text-sm shadow-xl shadow-amber-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                  >
                    {isGeneratingInvoice ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Generating Crypto Address...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-black" />
                        <span>Pay ${(customUSD || selectedPackage.usd)} with Crypto</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </>
              ) : (
                /* Active Invoice Display */
                <div className="bg-[#121829] rounded-3xl p-5 border border-amber-500/40 space-y-4">
                  {/* Status Banner */}
                  <div className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2">
                      {currentInvoice.status === 'finished' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">
                          Status: <span className="uppercase text-amber-400">{currentInvoice.status}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">Payment ID: {currentInvoice.paymentId}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-amber-300">
                        +{currentInvoice.coinsToCredit.toLocaleString()} Coins
                      </div>
                      <div className="text-[10px] text-slate-400">${currentInvoice.amountUSD} USD</div>
                    </div>
                  </div>

                  {depositSuccessMsg && (
                    <div className="p-3 bg-emerald-950/70 border border-emerald-500/60 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{depositSuccessMsg}</span>
                    </div>
                  )}

                  {/* QR Code & Wallet Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-black/60 p-4 rounded-2xl border border-slate-800">
                    {/* Visual QR Code Generator */}
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl aspect-square w-36 mx-auto">
                      <div className="w-full h-full border-4 border-black p-1 flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-black" />
                          <div className="w-6 h-6 bg-black" />
                        </div>
                        <div className="flex justify-center items-center font-mono text-[9px] font-black text-black">
                          NOWPAY
                        </div>
                        <div className="flex justify-between">
                          <div className="w-6 h-6 bg-black" />
                          <div className="w-6 h-6 bg-black" />
                        </div>
                      </div>
                    </div>

                    {/* Payment Specs */}
                    <div className="sm:col-span-2 space-y-3">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Exact Crypto to Transfer:</span>
                        <div className="text-lg font-black text-white font-mono flex items-center gap-2">
                          <span>{currentInvoice.amountCrypto}</span>
                          <span className="text-amber-400">{currentInvoice.cryptoCurrency}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">Deposit Address (Direct Blockchain Network):</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            readOnly
                            value={currentInvoice.payAddress}
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-200 font-mono select-all outline-none"
                          />
                          <button
                            onClick={() => handleCopy(currentInvoice.payAddress)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                            title="Copy Address"
                          >
                            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-400">
                        ⚡ Send exactly <strong className="text-white">{currentInvoice.amountCrypto} {currentInvoice.cryptoCurrency}</strong> to the address above. Funds are credited automatically.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                    {currentInvoice.status !== 'finished' ? (
                      <button
                        onClick={handleSimulatePayment}
                        disabled={isSimulatingConfirm}
                        className="w-full sm:flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-950/40"
                      >
                        {isSimulatingConfirm ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Verifying Blockchain Transaction...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 fill-white" />
                            <span>Simulate Instant Payment Confirmation (Sandbox Test)</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentInvoice(null)}
                        className="w-full sm:flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Make Another Deposit
                      </button>
                    )}

                    <button
                      onClick={() => setCurrentInvoice(null)}
                      className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Back to Packages
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: CRYPTO WITHDRAW (FOR MODELS & CREATORS) ================= */}
          {activeTab === 'withdraw' && (
            <form onSubmit={handleRequestWithdraw} className="space-y-5">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
                <Gem className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-cyan-200">
                    Model & Creator Cashout (Instant Crypto Payout)
                  </p>
                  <p className="text-slate-400 mt-0.5">
                    Convert your earned diamonds directly to crypto (USDT, BTC). Rate: 100 Diamonds = $1.00 USD. Minimum withdrawal: 5,000 Diamonds ($50 USD).
                  </p>
                </div>
              </div>

              {withdrawSuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{withdrawSuccessMsg}</span>
                </div>
              )}

              {withdrawError && (
                <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{withdrawError}</span>
                </div>
              )}

              {/* Diamond Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-extrabold uppercase text-slate-300">
                    Diamonds to Cash Out
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawDiamonds(String(currentUser.diamondsBalance))}
                    className="text-[11px] font-bold text-cyan-400 hover:underline cursor-pointer"
                  >
                    Max ({currentUser.diamondsBalance.toLocaleString()} 💎)
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    min={5000}
                    max={currentUser.diamondsBalance}
                    value={withdrawDiamonds}
                    onChange={(e) => setWithdrawDiamonds(e.target.value)}
                    placeholder="5000"
                    className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-sm text-white font-mono outline-none"
                  />
                  <div className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                    ≈ ${withdrawUSD.toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Payout Currency */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-300 mb-2">
                  Payout Cryptocurrency
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWithdrawCurrency('USDTTRC20')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      withdrawCurrency === 'USDTTRC20'
                        ? 'bg-cyan-500/20 border-cyan-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">USDT (TRC20 Network)</div>
                    <div className="text-[10px] text-cyan-300 mt-0.5">Lowest network gas fees</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setWithdrawCurrency('BTC')}
                    className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                      withdrawCurrency === 'BTC'
                        ? 'bg-cyan-500/20 border-cyan-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Bitcoin (BTC)</div>
                    <div className="text-[10px] text-amber-300 mt-0.5">Direct to BTC address</div>
                  </button>
                </div>
              </div>

              {/* Destination Wallet Address */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-300 mb-1.5">
                  Your Receiving Wallet Address
                </label>
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="e.g. TLyqzVGLV1nmH3M42Z1xWkP7sD6YgV8Hj9"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none placeholder-slate-600"
                />
              </div>

              {/* Calculation Summary Box */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Gross Payout:</span>
                  <span className="text-white font-bold">${withdrawUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform & Network Fee (3%):</span>
                  <span className="text-red-400 font-bold">-${withdrawFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-1.5 border-t border-slate-800 text-sm">
                  <span>Net Crypto Sent to Your Wallet:</span>
                  <span className="text-emerald-400 font-mono">${netPayout.toFixed(2)} {withdrawCurrency}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw || currentUser.diamondsBalance < 5000}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black text-sm shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
              >
                {isSubmittingWithdraw ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    <span>Processing Payout to Blockchain...</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 text-black" />
                    <span>Submit Crypto Withdrawal (${netPayout.toFixed(2)})</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= TAB 3: TRANSACTION HISTORY ================= */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">Recent Gateway Records</span>
                <button
                  onClick={loadTransactions}
                  className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTx ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No crypto transactions recorded yet.
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-cyan-500/20 text-cyan-400'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{tx.type === 'deposit' ? 'Deposit' : 'Withdrawal'}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">({tx.cryptoCurrency})</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {new Date(tx.createdAt).toLocaleDateString()} • {tx.paymentId}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-white">
                          {tx.type === 'deposit' ? `+${tx.coinsReceived?.toLocaleString()} Coins` : `-$${tx.amountUSD} USD`}
                        </div>
                        <span className={`inline-block text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full mt-0.5 ${
                          tx.status === 'finished'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : tx.status === 'confirming'
                            ? 'bg-cyan-500/20 text-cyan-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
