import crypto from "crypto";

const API_URL = "https://api.nowpayments.io/v1";

interface CreatePaymentParams {
  priceAmount: number;
  priceCurrency?: string;
  payCurrency: string;
  orderId: string;
  orderDescription?: string;
}

interface PaymentResponse {
  payment_id: string;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  created_at: string;
}

interface IPNPayload {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  pay_amount: number;
  pay_currency: string;
  price_amount: number;
  price_currency: string;
  order_id: string;
  actually_paid: number;
  outcome_amount: number;
  outcome_currency: string;
}

export const CRYPTO_CURRENCIES = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", color: "#F7931A" },
  { id: "eth", name: "Ethereum", symbol: "ETH", color: "#627EEA" },
];

interface InvoiceResponse {
  id: string;
  token_id: string;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  invoice_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create a crypto invoice with hosted payment page
 */
export async function createCryptoInvoice(params: {
  priceAmount: number;
  priceCurrency: string;
  orderId: string;
  orderDescription: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<InvoiceResponse> {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    throw new Error("NOWPayments API key not configured");
  }

  const ipnCallbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/crypto/webhook`;
  const successUrl = params.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`;
  const cancelUrl = params.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/checkout`;

  const response = await fetch(`${API_URL}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: ipnCallbackUrl,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`NOWPayments API error: ${error}`);
  }

  return response.json();
}

export async function createCryptoPayment(
  params: CreatePaymentParams
): Promise<PaymentResponse> {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    throw new Error("NOWPayments API key not configured");
  }

  const response = await fetch(`${API_URL}/payment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.NOWPAYMENTS_API_KEY,
    },
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency || "usd",
      pay_currency: params.payCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/crypto/webhook`,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create payment");
  }

  return response.json();
}

export async function getPaymentStatus(paymentId: string) {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    throw new Error("NOWPayments API key not configured");
  }

  const response = await fetch(`${API_URL}/payment/${paymentId}`, {
    headers: {
      "x-api-key": process.env.NOWPAYMENTS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get payment status");
  }

  return response.json();
}

export async function getEstimatedAmount(
  fromCurrency: string,
  toCurrency: string,
  amount: number
) {
  if (!process.env.NOWPAYMENTS_API_KEY) {
    throw new Error("NOWPayments API key not configured");
  }

  const response = await fetch(
    `${API_URL}/estimate?amount=${amount}&currency_from=${fromCurrency}&currency_to=${toCurrency}`,
    {
      headers: {
        "x-api-key": process.env.NOWPAYMENTS_API_KEY,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get estimated amount");
  }

  return response.json();
}

export function verifyWebhookSignature(
  payload: IPNPayload,
  signature: string
): boolean {
  if (!process.env.NOWPAYMENTS_IPN_SECRET) {
    throw new Error("NOWPayments IPN secret not configured");
  }

  // Sort payload keys alphabetically and create string
  const sortedPayload = Object.keys(payload)
    .sort()
    .reduce((acc, key) => {
      acc[key] = payload[key as keyof IPNPayload];
      return acc;
    }, {} as Record<string, any>);

  const hmac = crypto.createHmac("sha512", process.env.NOWPAYMENTS_IPN_SECRET);
  hmac.update(JSON.stringify(sortedPayload));
  const calculatedSignature = hmac.digest("hex");

  return calculatedSignature === signature;
}

export function mapPaymentStatus(status: string): string {
  const statusMap: Record<string, string> = {
    waiting: "PENDING",
    confirming: "PENDING",
    confirmed: "COMPLETED",
    sending: "COMPLETED",
    partially_paid: "PENDING",
    finished: "COMPLETED",
    failed: "FAILED",
    refunded: "REFUNDED",
    expired: "FAILED",
  };

  return statusMap[status] || "PENDING";
}
