import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/nowpayments";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID required" },
        { status: 400 }
      );
    }

    // Get payment status from NOWPayments
    const status = await getPaymentStatus(paymentId);

    // Also update our database
    await prisma.payment.updateMany({
      where: { providerTxId: paymentId },
      data: {
        status: status.payment_status === "finished" ? "COMPLETED" :
                status.payment_status === "failed" ? "FAILED" :
                status.payment_status === "expired" ? "FAILED" : "PENDING",
      },
    });

    return NextResponse.json({
      status: status.payment_status,
      payAmount: status.pay_amount,
      actuallyPaid: status.actually_paid || 0,
      payAddress: status.pay_address,
    });
  } catch (error) {
    console.error("Payment status check error:", error);
    return NextResponse.json(
      { error: "Failed to check payment status" },
      { status: 500 }
    );
  }
}
