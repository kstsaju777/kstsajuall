-- =====================================================
-- 결과지 합본 저장 동시성 레이스 방지 (알림톡 중복 발송 버그 수정)
-- =====================================================
-- 문제: 챕터 합본 저장(saveContent)이 거의 동시에 두 번 호출되면(백그라운드 생성 완료 저장 +
-- 프론트의 최종 재확인 저장), 한쪽의 "그냥 합본 저장"이 다른 쪽이 막 찍은 __alimtalkSent 플래그를
-- 덮어써서 지워버리는 경우가 있었다. 이후 재확인 호출이 플래그가 사라진 걸 보고 다시 발송 조건을
-- 통과해 알림톡이 두 번 나가는 문제가 있었음.
-- 해결: "현재 값 읽기 → 병합 → 쓰기"를 행 잠금(for update)으로 묶어 완전히 직렬화한다.
-- jsonb의 `||` 병합은 왼쪽(현재값)에 있던 키를 오른쪽이 명시하지 않는 한 그대로 보존하므로,
-- 합본 저장이 나중에 실행되더라도 이미 찍힌 __alimtalkSent 플래그를 지우지 않는다.

create or replace function public.merge_saju_result_content(p_id uuid, p_content jsonb)
returns jsonb
language plpgsql
as $$
declare
  v_current jsonb;
  v_merged jsonb;
begin
  select coalesce(interpretation_md::jsonb, '{}'::jsonb) into v_current
  from public.saju_results where id = p_id for update;

  v_merged := v_current || p_content;

  update public.saju_results set interpretation_md = v_merged::text where id = p_id;

  return v_merged;
end;
$$;

create or replace function public.claim_saju_alimtalk(p_id uuid)
returns boolean
language plpgsql
as $$
declare
  v_current jsonb;
begin
  select coalesce(interpretation_md::jsonb, '{}'::jsonb) into v_current
  from public.saju_results where id = p_id for update;

  if coalesce((v_current->>'__alimtalkSent')::boolean, false) then
    return false;
  end if;

  update public.saju_results
  set interpretation_md = (v_current || jsonb_build_object('__alimtalkSent', true))::text
  where id = p_id;

  return true;
end;
$$;
