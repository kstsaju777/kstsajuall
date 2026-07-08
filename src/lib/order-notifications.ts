import { Resend } from "resend";
import crypto from "crypto";

function solapiAuth() {
  const apiKey = process.env.SOLAPI_API_KEY ?? "";
  const apiSecret = process.env.SOLAPI_API_SECRET ?? "";
  const date = new Date().toISOString();
  const salt = Math.random().toString(36).substring(2, 15);
  const signature = crypto.createHmac("sha256", apiSecret).update(date + salt).digest("hex");
  return { apiKey, date, salt, signature };
}

export function sendAlimtalk({
  customerPhone,
  customerName,
  resultUrl,
}: {
  customerPhone: string;
  customerName: string;
  resultUrl: string;
}) {
  const phone = customerPhone.replace(/\D/g, "");
  if (!phone) return Promise.resolve();
  const { apiKey, date, salt, signature } = solapiAuth();
  if (!apiKey) return Promise.resolve();
  return fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({
      message: {
        to: phone,
        from: "01096768847",
        kakaoOptions: {
          pfId: "KA01PF260705184430144ZqSBMiZSdjb",
          templateId: "KA01TP260705185306355QVmxcJYJwzX",
          variables: {
            "#{이름}": customerName,
          },
          buttons: [
            {
              buttonType: "WL",
              buttonName: "풀이 확인하기",
              linkMobile: resultUrl,
              linkPc: resultUrl,
            },
          ],
        },
      },
    }),
  }).then(async (res) => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) console.error("[Alimtalk] 발송 실패:", res.status, JSON.stringify(body));
    else console.log("[Alimtalk] 발송 성공:", JSON.stringify(body));
  }).catch((e) => console.error("[Alimtalk] 네트워크 오류:", e));
}

export function sendOrderSms({ customerName, productName, price }: { customerName: string; productName: string; price: number }) {
  const { apiKey, date, salt, signature } = solapiAuth();
  if (!apiKey) return Promise.resolve();
  return fetch("https://api.solapi.com/messages/v4/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`,
    },
    body: JSON.stringify({
      message: {
        to: "01096768847",
        from: "01096768847",
        text: `[홍연당 주문알림]\n${customerName}님이 결제했습니다.\n상품: ${productName}\n금액: ${price.toLocaleString()}원`,
      },
    }),
  }).then(async (res) => {
    const body = await res.json().catch(() => ({}));
    if (!res.ok) console.error("[SMS] 발송 실패:", res.status, JSON.stringify(body));
    else console.log("[SMS] 발송 성공:", JSON.stringify(body));
  }).catch((e) => console.error("[SMS] 네트워크 오류:", e));
}

export function sendOrderEmail({
  customerEmail,
  customerName,
  productName,
  price,
  reportUrl,
}: {
  customerEmail: string;
  customerName: string;
  productName: string;
  price: number;
  reportUrl: string;
}) {
  if (!customerEmail || !process.env.RESEND_API_KEY) return Promise.resolve();
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails
    .send({
      from: "홍연당 <support@villionhive.com>",
      to: [customerEmail, "support@villionhive.com"],
      subject: `[홍연당] ${customerName}님, 구매가 완료되었습니다`,
      html: `
        <div style="font-family: 'Apple SD Gothic Neo', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 3px solid #9b2335; border-radius: 16px; overflow: hidden;">
          <div style="background: #ffffff; padding: 32px 20px; text-align: center; border-bottom: 2px solid #9b2335;">
            <img src="https://www.hongyeondang.com/logo.png" alt="홍연당" style="height: 60px; max-width: 200px; object-fit: contain;" />
          </div>
          <div style="padding: 36px 28px; background: #ffffff;">
            <h2 style="color: #1a1a1a; font-size: 20px; margin: 0 0 16px; text-align: center;">구매가 완료되었습니다</h2>
            <p style="color: #444; font-size: 15px; line-height: 1.8; margin: 0 0 28px; text-align: center;">
              안녕하세요, <strong>${customerName}</strong>님!<br/>
              홍연당을 이용해주셔서 감사합니다.
            </p>
            <div style="background: #fdf0f0; border-radius: 12px; padding: 20px; margin-bottom: 28px; border: 1px solid #f5c5c8;">
              <p style="color: #9b2335; font-size: 13px; font-weight: bold; margin: 0 0 10px;">구매 내역</p>
              <p style="color: #1a1a1a; font-size: 16px; font-weight: bold; margin: 0 0 4px;">${productName}</p>
              <p style="color: #444; font-size: 14px; margin: 0;">${price.toLocaleString()}원</p>
            </div>
            <p style="color: #666; font-size: 13px; line-height: 1.7; margin: 0 0 24px; text-align: center;">
              결과지 생성에 1~2분 정도 소요됩니다.<br/>
              완성되면 아래 버튼으로 언제든 확인하실 수 있습니다.
            </p>
            <div style="text-align: center;">
              <a href="${reportUrl}" style="display: inline-block; background: #9b2335; color: #ffffff; font-size: 16px; font-weight: bold; padding: 16px 40px; border-radius: 50px; text-decoration: none;">
                결과지 확인하러 가기
              </a>
            </div>
          </div>
          <div style="background: #9b2335; padding: 20px; text-align: center;">
            <p style="color: #ffffff; font-size: 12px; margin: 0;">
              문의사항은 <a href="mailto:support@villionhive.com" style="color: #ffffff;">support@villionhive.com</a>으로 연락주세요.<br/>
              © 2026 홍연당 · Villionhive
            </p>
          </div>
        </div>
      `,
    })
    .catch((e) => console.error("[Email] 발송 실패:", e));
}
