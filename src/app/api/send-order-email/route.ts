import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, customerName, productName, price } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "홍연당 <support@villionhive.com>",
      to: [customerEmail],
      subject: `[홍연당] ${customerName}님, 구매가 완료되었습니다 🎉`,
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fdf8f4;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #9b2335; font-size: 24px; margin: 0;">홍연당</h1>
            <p style="color: #888; font-size: 13px; margin-top: 4px;">정통 사주 · 운세 리포트</p>
          </div>

          <div style="background: #fff; border-radius: 16px; padding: 28px; margin-bottom: 24px; border: 1px solid #eee;">
            <h2 style="color: #1a1a1a; font-size: 18px; margin: 0 0 16px;">구매 완료 안내</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.6; margin: 0 0 20px;">
              안녕하세요, <strong>${customerName}</strong>님!<br/>
              홍연당을 이용해주셔서 감사합니다.
            </p>

            <div style="background: #fdf0f0; border-radius: 12px; padding: 16px; border: 1px solid #f5c5c8;">
              <p style="color: #9b2335; font-size: 13px; font-weight: bold; margin: 0 0 8px;">📋 구매 내역</p>
              <p style="color: #1a1a1a; font-size: 15px; font-weight: bold; margin: 0 0 4px;">${productName}</p>
              <p style="color: #444; font-size: 14px; margin: 0;">${price.toLocaleString()}원</p>
            </div>
          </div>

          <div style="background: #fff; border-radius: 16px; padding: 28px; margin-bottom: 24px; border: 1px solid #eee;">
            <p style="color: #1a1a1a; font-size: 15px; font-weight: bold; margin: 0 0 12px;">📖 리포트 확인 방법</p>
            <p style="color: #444; font-size: 14px; line-height: 1.6; margin: 0;">
              결제 완료 후 화면에서 바로 리포트를 확인하실 수 있습니다.<br/>
              언제든지 홍연당 사이트를 통해 재열람하실 수 있습니다.
            </p>
          </div>

          <div style="text-align: center; padding: 20px;">
            <p style="color: #888; font-size: 12px; margin: 0;">
              문의사항은 <a href="mailto:support@villionhive.com" style="color: #9b2335;">support@villionhive.com</a>으로 연락주세요.<br/>
              © 2025 홍연당 · Villionhive
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
