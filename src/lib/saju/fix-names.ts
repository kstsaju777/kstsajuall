/**
 * LLM 생성 텍스트에서 이름 변형 교정.
 * __MY__ / __PT__ 토큰을 실제 이름+호칭으로 치환하고,
 * LLM이 조사를 잘못 붙여 변형한 이름을 원래대로 복원합니다.
 */
export function fixNamesInText(
  text: string,
  myLabel: string,        // 본인 이름 (성 제외)
  ptLabel: string | null, // 상대방 이름 (성 제외). 단독 사주이면 null
  ptHonorific: string,    // "님" | "군" | "양"
  myHonorific: string = "님", // 본인 호칭. 자녀 상품에서 "군"/"양"
): string {
  let r = text;
  const ptFull = ptLabel ? `${ptLabel}${ptHonorific}` : null;

  // 1. 조사 포함 __MY__ 토큰 치환 (긴 것 먼저)
  r = r.replace(/__MY_은__/g, `${myLabel}${myHonorific}은`);
  r = r.replace(/__MY_이__/g, `${myLabel}${myHonorific}이`);
  r = r.replace(/__MY_을__/g, `${myLabel}${myHonorific}을`);
  r = r.replace(/__MY_과__/g, `${myLabel}${myHonorific}과`);
  r = r.replace(/__MY_에게__/g, `${myLabel}${myHonorific}에게`);
  r = r.replace(/__MY__/g, `${myLabel}${myHonorific}`);

  // 2. 조사 포함 __PT__ 토큰 치환
  if (ptFull) {
    r = r.replace(/__PT_는__/g, `${ptFull}는`);
    r = r.replace(/__PT_가__/g, `${ptFull}가`);
    r = r.replace(/__PT_를__/g, `${ptFull}를`);
    r = r.replace(/__PT_와__/g, `${ptFull}와`);
    r = r.replace(/__PT_에게__/g, `${ptFull}에게`);
    r = r.replace(/__PT__/g, ptFull);
  }

  // 3. "본인" → 이름+님
  r = r.replace(/본인/g, `${myLabel}님`);

  // 4. 본인 이름 변형 교정 (는님/군/양, 가님/군/양, 를님/군/양 → 원래이름+호칭)
  if (myLabel.length >= 2) {
    const stem = myLabel.slice(0, -1);
    const esc = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const hon of ["님", "양", "군"]) {
      r = r
        .replace(new RegExp(`${esc}는${hon}`, "g"), `${myLabel}${hon}`)
        .replace(new RegExp(`${esc}가${hon}`, "g"), `${myLabel}${hon}`)
        .replace(new RegExp(`${esc}를${hon}`, "g"), `${myLabel}${hon}`);
    }
  }

  // 5. 상대방 이름 변형 교정
  if (ptLabel && ptLabel.length >= 2) {
    const stem = ptLabel.slice(0, -1);
    const esc = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const hon of ["님", "양", "군"]) {
      r = r
        .replace(new RegExp(`${esc}는${hon}`, "g"), `${ptLabel}${hon}`)
        .replace(new RegExp(`${esc}가${hon}`, "g"), `${ptLabel}${hon}`)
        .replace(new RegExp(`${esc}를${hon}`, "g"), `${ptLabel}${hon}`);
    }
  }

  // 6. 님 뒤 잘못된 조사 교정
  r = r
    .replace(/님는/g, "님은")
    .replace(/님가/g, "님이")
    .replace(/님를/g, "님을")
    .replace(/님와/g, "님과");

  // 7. 계절/합성어 보호
  r = r
    .replace(/(?<![가-힣])가[를름]/g, "가을")
    .replace(/(?<![가-힣])여[를름]/g, "여름")
    .replace(/효와/g, "효과")
    .replace(/교와/g, "교과");

  return r;
}

export function fixNamesInValue(
  val: unknown,
  myLabel: string,
  ptLabel: string | null,
  ptHonorific: string,
  myHonorific: string = "님",
): unknown {
  if (typeof val === "string") return fixNamesInText(val, myLabel, ptLabel, ptHonorific, myHonorific);
  if (Array.isArray(val)) return val.map(v => fixNamesInValue(v, myLabel, ptLabel, ptHonorific, myHonorific));
  if (val && typeof val === "object") {
    return Object.fromEntries(
      Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, fixNamesInValue(v, myLabel, ptLabel, ptHonorific, myHonorific)])
    );
  }
  return val;
}
