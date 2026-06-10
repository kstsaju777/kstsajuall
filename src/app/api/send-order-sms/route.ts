import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getSignature(apiKey: string, apiSecret: string, date: string, salt: string) {
  const message = date + salt;
  return crypto.createHmac("sha256", apiSecret).update(message).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const { customerName, productName, price } = await req.json();

    const apiKey = process.env.SOLAPI_API_KEY!;
    const apiSecret = process.env.SOLAPI_API_SECRET!;
    const fromNumber = "01096768847";
    const toNumber = "01096768847"; // 내 번호로 수신

    const date = new Date().toISOString();
    const salt = Math.random().toString(36).substring(2, 15);
    const signature = getSignature(apiKey, apiSecret, date, salt);

    const res = await fetch("https://api.solapi.com/messages/v4/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
      },
      body: JSON.stringify({
        message: {
          to: toNumber,
          from: fromNumber,
          text: `[홍연당 주문알림]\n${customerName}님이 결제했습니다.\n상품: ${productName}\n금액: ${price.toLocaleString()}원`,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
