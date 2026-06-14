// =====================================================
// 천간/지지 글자 이미지 매핑
// =====================================================
// public/images/saju/cheongan, jiji 에 업로드된 글자 이미지(파일명: 한글+오행 로마자)
// 를 한자 글자 기준으로 찾아준다. 모르는 글자(시 미상 "—" 등)는 ques.png.

const GAN_IMG: Record<string, string> = {
  甲: "gapmok", 乙: "eulmok", 丙: "byeonghwa", 丁: "jeonghwa", 戊: "muto",
  己: "gito", 庚: "gyeonggeum", 辛: "singeum", 壬: "imsu", 癸: "gyesu",
};

const JI_IMG: Record<string, string> = {
  子: "jasu", 丑: "chukto", 寅: "inmok", 卯: "myomok", 辰: "jinto", 巳: "sahwa",
  午: "ohwa", 未: "mito", 申: "singeum", 酉: "yougeum", 戌: "sulto", 亥: "haesu",
};

// 모르는 글자(시 미상 "—" 등)는 hipeun 으로 통일
const HIPEUN = "/images/saju/cheongan/hipeun.png";

export function ganCharImage(hanja: string): string {
  const f = GAN_IMG[hanja];
  return f ? `/images/saju/cheongan/${f}.png` : HIPEUN;
}

export function jiCharImage(hanja: string): string {
  const f = JI_IMG[hanja];
  return f ? `/images/saju/jiji/${f}.png` : HIPEUN;
}
