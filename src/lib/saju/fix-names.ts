import { hasBatchim } from "@/lib/utils/fix-josa";

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
    if (ptHonorific === "") {
      // 호칭 없이 이름 그대로(예: 반려동물) — 토큰에 붙은 '님 받침 기준' 조사를
      // 이름 자체의 받침 유무에 맞게 다시 골라줌
      const b = hasBatchim(ptFull[ptFull.length - 1]);
      r = r.replace(/__PT__(은|는)/g, `${ptFull}${b ? "은" : "는"}`);
      r = r.replace(/__PT__(이|가)/g, `${ptFull}${b ? "이" : "가"}`);
      r = r.replace(/__PT__(을|를)/g, `${ptFull}${b ? "을" : "를"}`);
      r = r.replace(/__PT__(과|와)/g, `${ptFull}${b ? "과" : "와"}`);
      r = r.replace(/__PT__에게/g, `${ptFull}에게`);
      r = r.replace(/__PT__으로/g, `${ptFull}${b ? "으로" : "로"}`);
      r = r.replace(/__PT__/g, ptFull);
    } else {
      // '님'·'군'·'양' 호칭은 전부 받침이 있는 글자(ㅁ/ㄴ/ㅇ)라서 이름+호칭은 항상
      // 받침 있는 조사(은/이/을/과)를 써야 한다. 그런데 LLM이 문장을 쓸 때 실제
      // 이름을 모르는 채로 __PT_는__ / __PT_가__ 같은 받침 없는 조사 토큰을 골라
      // '채은양는'처럼 틀린 조사가 그대로 노출되는 사고가 있었다. 토큰에 어떤 조사가
      // 적혀있든 무시하고, 항상 받침 있는 조사로 통일해서 치환한다.
      r = r.replace(/__PT_(는|은)__/g, `${ptFull}은`);
      r = r.replace(/__PT_(가|이)__/g, `${ptFull}이`);
      r = r.replace(/__PT_(를|을)__/g, `${ptFull}을`);
      r = r.replace(/__PT_(와|과)__/g, `${ptFull}과`);
      r = r.replace(/__PT_에게__/g, `${ptFull}에게`);
      r = r.replace(/__PT__/g, ptFull);
    }
  }

  // 안전망: LLM이 지시된 정확한 토큰 형식(밑줄 2개+정해진 조사+밑줄 2개)을 안 지키고
  // '_PT_에게'나 '__PT_에게'처럼 밑줄 개수가 틀린 변형을 만들어내면 위 정확한 매칭에
  // 전부 실패해 토큰이 그대로 노출되는 사고가 있었다. 마지막으로 남은 PT/MY 토큰
  // 잔여물을 전부 이름으로 치환해 어떤 변형이 와도 원문 노출 없이 이름으로 바뀌게 한다.
  r = r.replace(/_{1,2}MY_{0,2}/g, `${myLabel}${myHonorific}`);
  if (ptFull) r = r.replace(/_{1,2}PT_{0,2}/g, ptFull);

  // ※ "당신"/"그대" → 이름 강제 치환 안전장치는 제거함. 정규식 기반 일괄 치환이
  // "그대로"(고정 부사) 같은 고정 단어를 오탐으로 훼손하는 부작용이 있어,
  // GLOBAL_GRAMMAR_RULES의 프롬프트 지시(당신/그대 사용 금지)에만 맡긴다.

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

  // 5. 상대방 이름 변형 교정 (호칭 없음 대상, 예: 반려동물은 호칭 자체를 붙이지 않으므로 제외)
  if (ptLabel && ptLabel.length >= 2 && ptHonorific !== "") {
    const stem = ptLabel.slice(0, -1);
    const esc = stem.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    for (const hon of ["님", "양", "군"]) {
      r = r
        .replace(new RegExp(`${esc}는${hon}`, "g"), `${ptLabel}${hon}`)
        .replace(new RegExp(`${esc}가${hon}`, "g"), `${ptLabel}${hon}`)
        .replace(new RegExp(`${esc}를${hon}`, "g"), `${ptLabel}${hon}`);
    }
  }

  // 6. 이름+호칭 뒤 중복 호칭 제거 (예: 채은양양 → 채은양, 채은양군 → 채은양)
  //    호칭 없음 대상은 반대로 LLM이 실수로 붙인 님/양/군을 제거함
  if (ptFull) {
    if (ptHonorific === "") {
      const escFull = ptFull.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      for (const hon of ["님", "양", "군"]) {
        r = r.replace(new RegExp(`${escFull}${hon}`, "g"), ptFull);
      }
    } else {
      for (const hon of ["님", "양", "군"]) {
        r = r.replace(new RegExp(`${ptFull.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${hon}`, "g"), ptFull);
      }
    }
  }
  const myFull = `${myLabel}${myHonorific}`;
  for (const hon of ["님", "양", "군"]) {
    r = r.replace(new RegExp(`${myFull.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${hon}`, "g"), myFull);
  }

  // 7. 님/양/군 뒤 잘못된 조사 교정 — 셋 다 받침 있는 글자(ㅁ/ㅇ/ㄴ)라 조사가 동일하게
  // 틀릴 수 있는데, 예전엔 "님"만 교정하고 자녀 상품 호칭인 "양"·"군"은 빠져 있어
  // "지희양는"처럼 잘못된 조사가 그대로 노출되는 사고가 있었다(고객 신고).
  for (const hon of ["님", "양", "군"]) {
    r = r
      .replace(new RegExp(`${hon}는`, "g"), `${hon}은`)
      .replace(new RegExp(`${hon}가`, "g"), `${hon}이`)
      .replace(new RegExp(`${hon}를`, "g"), `${hon}을`)
      .replace(new RegExp(`${hon}와`, "g"), `${hon}과`);
  }

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
