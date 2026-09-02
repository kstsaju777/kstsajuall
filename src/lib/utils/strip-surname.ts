/** 이름에서 성을 제외한 부분을 반환. 복성(2글자 성)은 예외 처리. */
export const COMPOUND_SURNAMES = ["남궁", "황보", "제갈", "사공", "서문", "독고", "선우", "동방", "장곡", "망절"];

export function stripSurname(fullName: string): string {
  if (!fullName) return fullName;
  const compound = COMPOUND_SURNAMES.find((s) => fullName.startsWith(s));
  if (compound && fullName.length > compound.length) return fullName.slice(compound.length);
  return fullName.length > 1 ? fullName.slice(1) : fullName;
}
