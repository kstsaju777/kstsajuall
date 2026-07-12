// 알림톡 발송 타이밍 설정
// 이미지 생성이 있는 상품은 이미지 완료 후 알림톡 발송
// 이미지 없는 상품은 챕터 완료 즉시 발송
// 상품에 이미지 추가 시 여기에 productSlug 추가
export const WAIT_FOR_IMAGE = new Set<string>([
  "total",
  "saju_janyeo",
  "saju_youare",
  "kunghap_yeonae",
]);
