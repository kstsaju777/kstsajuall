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
      r = r.replace(/__PT_는__/g, `${ptFull}는`);
      r = r.replace(/__PT_가__/g, `${ptFull}가`);
      r = r.replace(/__PT_를__/g, `${ptFull}를`);
      r = r.replace(/__PT_와__/g, `${ptFull}와`);
      r = r.replace(/__PT_에게__/g, `${ptFull}에게`);
      r = r.replace(/__PT__/g, ptFull);
    }
  }

  // 2.5. "당신"/"그대" → 이름+호칭 강제 치환 (전역 프롬프트 규칙 미준수 시 안전장치 —
  //      LLM이 지시를 놓치고 이 대명사를 쓰더라도 결과물엔 절대 남지 않도록 확정 교정)
  {
    const myFullEarly = `${myLabel}${myHonorific}`;
    const bMy = hasBatchim(myFullEarly[myFullEarly.length - 1]);
    for (const word of ["당신", "그대"]) {
      r = r
        .replace(new RegExp(`${word}(은|는)`, "g"), `${myFullEarly}${bMy ? "은" : "는"}`)
        .replace(new RegExp(`${word}(이|가)`, "g"), `${myFullEarly}${bMy ? "이" : "가"}`)
        .replace(new RegExp(`${word}(을|를)`, "g"), `${myFullEarly}${bMy ? "을" : "를"}`)
        .replace(new RegExp(`${word}(과|와)`, "g"), `${myFullEarly}${bMy ? "과" : "와"}`)
        .replace(new RegExp(`${word}(으로|로)`, "g"), `${myFullEarly}${bMy ? "으로" : "로"}`)
        .replace(new RegExp(`${word}에게`, "g"), `${myFullEarly}에게`)
        .replace(new RegExp(`${word}의`, "g"), `${myFullEarly}의`)
        .replace(new RegExp(word, "g"), myFullEarly); // 남은 단독 사용(조사 없음)
    }
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

  // 7. 님 뒤 잘못된 조사 교정
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
