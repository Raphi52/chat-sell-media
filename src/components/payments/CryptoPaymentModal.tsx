"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge, Card } from "@/components/ui";
import {
  X,
  Copy,
  Check,
  Loader2,
  ArrowLeft,
  RefreshCw,
  QrCode,
  Clock,
} from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";

interface CryptoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "media" | "subscription" | "ppv" | "tip";
  mediaId?: string;
  planId?: string;
  billingInterval?: string;
  messageId?: string;
  amount?: number;
  title: string;
  price: number;
}

const cryptoCurrencies = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", color: "#F7931A" },
  { id: "eth", name: "Ethereum", symbol: "ETH", color: "#627EEA" },
];

export function CryptoPaymentModal({
  isOpen,
  onClose,
  type,
  mediaId,
  planId,
  billingInterval,
  messageId,
  amount,
  title,
  price,
}: CryptoPaymentModalProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [cryptoPayment, setCryptoPayment] = useState<{
    payAddress: string;
    payAmount: number;
    payCurrency: string;
    qrCodeUrl: string;
    expiresAt: string;
  } | null>(null);
  const [usdValue, setUsdValue] = useState<number | null>(null);
  const [refreshingUsd, setRefreshingUsd] = useState(false);
  const { formatPrice } = useCurrency();

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedCrypto(null);
      setCryptoPayment(null);
      setUsdValue(null);
    }
  }, [isOpen]);

  // Generate crypto payment
  const generatePayment = async () => {
    if (!selectedCrypto) return;
    setIsLoading(true);

    try {
      const response = await fetch("/api/payments/crypto/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          currency: selectedCrypto,
          mediaId,
          planId,
          billingInterval,
          messageId,
          amount: amount || price,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create payment");
      }

      const data = await response.json();
      setCryptoPayment({
        payAddress: data.payAddress,
        payAmount: data.payAmount,
        payCurrency: data.payCurrency,
        qrCodeUrl: data.qrCodeUrl,
        expiresAt: data.expiresAt,
      });
    } catch (error) {
      console.error("Crypto payment error:", error);
      alert(error instanceof Error ? error.message : "Erreur lors de la création du paiement");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch USD value
  const fetchUsdValue = async () => {
    if (!cryptoPayment) return;
    setRefreshingUsd(true);
    try {
      const symbol = cryptoPayment.payCurrency.toLowerCase();
      let coinId = "bitcoin";
      if (symbol.includes("eth")) coinId = "ethereum";
      else if (symbol.includes("usdt")) coinId = "tether";

      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`
      );
      const data = await response.json();
      const coinPrice = data[coinId]?.usd;
      if (coinPrice) {
        setUsdValue(cryptoPayment.payAmount * coinPrice);
      }
    } catch (error) {
      console.error("Failed to fetch USD value:", error);
      setUsdValue(price);
    } finally {
      setRefreshingUsd(false);
    }
  };

  // Fetch USD value when payment created
  useEffect(() => {
    if (cryptoPayment) {
      fetchUsdValue();
    }
  }, [cryptoPayment]);

  // Copy address to clipboard
  const copyAddress = () => {
    if (cryptoPayment) {
      navigator.clipboard.writeText(cryptoPayment.payAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md"
        >
          <Card variant="luxury" className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Paiement Crypto
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--muted)]" />
              </button>
            </div>

            {/* Product info */}
            <div className="bg-[var(--surface)] rounded-lg p-4 mb-6">
              <p className="text-sm text-[var(--muted)]">Article</p>
              <p className="font-medium text-[var(--foreground)]">{title}</p>
              <p className="text-lg font-bold text-[var(--gold)]">{formatPrice(price)}</p>
            </div>

            {!cryptoPayment ? (
              <>
                {/* Crypto selection */}
                <div className="mb-6">
                  <p className="text-sm text-[var(--muted)] mb-3">
                    Sélectionnez une cryptomonnaie
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {cryptoCurrencies.map((crypto) => (
                      <button
                        key={crypto.id}
                        onClick={() => setSelectedCrypto(crypto.id)}
                        className={`p-3 rounded-lg border transition-all text-center ${
                          selectedCrypto === crypto.id
                            ? "border-[var(--gold)] bg-[var(--gold)]/10"
                            : "border-[var(--border)] hover:border-[var(--gold)]/50"
                        }`}
                      >
                        <div
                          className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: `${crypto.color}20` }}
                        >
                          <span
                            className="text-lg font-bold"
                            style={{ color: crypto.color }}
                          >
                            {crypto.symbol.charAt(0)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-[var(--foreground)]">
                          {crypto.symbol}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate button */}
                <Button
                  variant="premium"
                  size="lg"
                  className="w-full"
                  onClick={generatePayment}
                  disabled={!selectedCrypto || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5 mr-2" />
                      Générer QR Code
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                {/* Back button */}
                <button
                  onClick={() => {
                    setCryptoPayment(null);
                    setSelectedCrypto(null);
                  }}
                  className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] flex items-center gap-1 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Changer de crypto
                </button>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-3 rounded-lg mb-4">
                    <img
                      src={cryptoPayment.qrCodeUrl}
                      alt="QR Code de paiement"
                      className="w-48 h-48"
                    />
                  </div>

                  {/* Amount */}
                  <div className="text-center mb-4">
                    <p className="text-sm text-[var(--muted)] mb-1">
                      Envoyez exactement:
                    </p>
                    <p className="text-2xl font-bold text-[var(--foreground)]">
                      {cryptoPayment.payAmount} {cryptoPayment.payCurrency.toUpperCase()}
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="text-sm text-[var(--muted)]">
                        ≈ ${usdValue ? usdValue.toFixed(2) : "..."} USD
                      </span>
                      <button
                        onClick={fetchUsdValue}
                        disabled={refreshingUsd}
                        className="p-1 hover:bg-[var(--surface)] rounded transition-colors"
                        title="Rafraîchir"
                      >
                        <RefreshCw
                          className={`w-3 h-3 text-[var(--muted)] ${
                            refreshingUsd ? "animate-spin" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="w-full bg-black/50 p-3 rounded-lg border border-[var(--border)]">
                    <p className="text-xs text-[var(--muted)] mb-2">
                      À cette adresse:
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs text-[var(--gold)] break-all">
                        {cryptoPayment.payAddress}
                      </code>
                      <button
                        onClick={copyAddress}
                        className="p-2 bg-[var(--surface)] hover:bg-[var(--surface-hover)] rounded transition-colors flex-shrink-0"
                        title="Copier l'adresse"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-[var(--muted)]" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
                    <Clock className="w-4 h-4" />
                    <span>Expire dans 1 heure</span>
                  </div>

                  {/* Info */}
                  <div className="mt-4 bg-[var(--gold)]/10 border border-[var(--gold)]/30 rounded-lg p-3 w-full">
                    <p className="text-xs text-[var(--gold)] text-center">
                      Votre achat sera activé automatiquement après confirmation
                      du paiement (10-30 min)
                    </p>
                  </div>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
