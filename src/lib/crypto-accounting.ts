const ACCOUNTING_API_URL = process.env.CRYPTO_ACCOUNTING_URL;
const ACCOUNTING_API_KEY = process.env.CRYPTO_ACCOUNTING_API_KEY;

interface AccountingPayload {
  externalId: string;
  amountUsd: number;
  amountCrypto: number;
  cryptoCurrency: string;
  productType: string;
  productName?: string;
  status: string;
  paymentDate: string;
  userEmail?: string;
  userId?: string;
  walletAddress?: string;
  transactionHash?: string;
  exchangeRate?: number;
  nowPaymentsId?: string;
  actuallyPaid?: number;
  metadata?: Record<string, unknown>;
}

export async function sendToAccounting(payload: AccountingPayload): Promise<void> {
  if (!ACCOUNTING_API_URL || !ACCOUNTING_API_KEY) {
    console.log("[Accounting] Not configured, skipping");
    return;
  }

  try {
    const response = await fetch(`${ACCOUNTING_API_URL}/api/webhook/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": ACCOUNTING_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[Accounting] Failed to send payment:", error);
    } else {
      const result = await response.json();
      console.log("[Accounting] Payment sent:", result.status);
    }
  } catch (error) {
    console.error("[Accounting] Webhook error:", error);
    // Don't throw - we don't want to block the main payment flow
  }
}

export function mapCryptoCurrency(currency: string): string {
  const mapping: Record<string, string> = {
    btc: "BTC",
    eth: "ETH",
    eur: "EUR",
    usd: "USD",
  };
  return mapping[currency.toLowerCase()] || currency.toUpperCase();
}

export function mapPaymentStatus(status: string): string {
  const mapping: Record<string, string> = {
    waiting: "PENDING",
    confirming: "CONFIRMING",
    confirmed: "COMPLETED",
    sending: "COMPLETED",
    partially_paid: "PENDING",
    finished: "COMPLETED",
    failed: "FAILED",
    refunded: "REFUNDED",
    expired: "EXPIRED",
  };
  return mapping[status.toLowerCase()] || status.toUpperCase();
}
