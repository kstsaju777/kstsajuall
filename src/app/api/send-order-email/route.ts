import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, customerName, productName, price, reportUrl } = await req.json();

    const { data, error } = await resend.emails.send({
      from: "홍연당 <support@villionhive.com>",
      to: [customerEmail, "support@villionhive.com"],
      subject: `[홍연당] ${customerName}님, 구매가 완료되었습니다`,
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 3px solid #9b2335; border-radius: 16px; overflow: hidden;">

          <!-- 상단 헤더 (흰 배경 + 로고) -->
          <div style="background: #ffffff; padding: 32px 20px; text-align: center; border-bottom: 2px solid #9b2335;">
            <img src="https://www.hongyeondang.com/logo.png" alt="홍연당" style="height: 60px; max-width: 200px; object-fit: contain;" />
          </div>

          <!-- 본문 -->
          <div style="padding: 36px 28px; background: #ffffff;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px; text-align: center;">구매가 완료되었습니다</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.8; margin: 0 0 28px; text-align: center;">
              안녕하세요, <strong>${customerName}</strong>님!<br/>
              홍연당을 이용해주셔서 감사합니다.
            </p>

            <!-- 구매 내역 -->
            <div style="background: #fdf0f0; border-radius: 12px; padding: 20px; margin-bottom: 28px; border: 1px solid #f5c5c8;">
              <p style="color: #9b2335; font-size: 13px; font-weight: bold; margin: 0 0 10px;">구매 내역</p>
              <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 4px;">${productName}</p>
              <p style="color: #444; font-size: 14px; margin: 0;">${price.toLocaleString()}원</p>
            </div>

            <!-- 버튼 -->
            <div style="text-align: center;">
              <a href="${reportUrl ?? "https://www.hongyeondang.com"}" style="display: inline-block; background: #9b2335; color: #ffffff; font-size: 16px; font-weight: bold; padding: 16px 40px; border-radius: 50px; text-decoration: none;">
                리포트 확인하러 가기
              </a>
            </div>
          </div>

          <!-- 푸터 -->
          <div style="background: #9b2335; padding: 20px; text-align: center;">
            <p style="color: #ffffff; font-size: 12px; margin: 0;">
              문의사항은 <a href="mailto:support@villionhive.com" style="color: #ffffff;">support@villionhive.com</a>으로 연락주세요.<br/>
              © 2026 홍연당 · Villionhive
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
