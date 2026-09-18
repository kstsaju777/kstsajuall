-- =====================================================
-- RLS 성능 최적화: auth.uid() 직접 호출 → (select auth.uid())
-- =====================================================
-- 문제: RLS 정책 안에서 auth.uid()를 직접 호출하면 Postgres가 스캔하는
-- 모든 행마다 그 함수를 다시 평가한다(Supabase Performance Advisor가
-- "Auth RLS Initialization Plan" 경고로 감지). 데이터가 적을 땐 티가
-- 안 나다가, orders/saju_inputs/saju_results처럼 행이 많아지고 조회가
-- 잦아지면 급격히 느려진다.
-- 해결: auth.uid()를 (select auth.uid())로 감싸면 Postgres가 쿼리당
-- 한 번만 평가하고 재사용한다(initplan). 정책의 실제 동작(권한 범위)은
-- 완전히 동일하고 성능만 개선된다.

-- ─── profiles ────────────────────────────────────────
drop policy if exists "profiles self select" on public.profiles;
create policy "profiles self select"
  on public.profiles for select
  using ((select auth.uid()) = id);

drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update"
  on public.profiles for update
  using ((select auth.uid()) = id);

-- ─── orders ──────────────────────────────────────────
drop policy if exists "orders self select" on public.orders;
create policy "orders self select"
  on public.orders for select
  using ((select auth.uid()) = user_id);

-- ─── saju_inputs ─────────────────────────────────────
drop policy if exists "saju_inputs via own order" on public.saju_inputs;
create policy "saju_inputs via own order"
  on public.saju_inputs for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = saju_inputs.order_id and o.user_id = (select auth.uid())
    )
  );

-- ─── saju_results ────────────────────────────────────
drop policy if exists "saju_results via own order" on public.saju_results;
create policy "saju_results via own order"
  on public.saju_results for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = saju_results.order_id and o.user_id = (select auth.uid())
    )
  );

-- ─── reviews ─────────────────────────────────────────
drop policy if exists "reviews self insert" on public.reviews;
create policy "reviews self insert"
  on public.reviews for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "reviews self update" on public.reviews;
create policy "reviews self update"
  on public.reviews for update
  using ((select auth.uid()) = user_id);

drop policy if exists "reviews self delete" on public.reviews;
create policy "reviews self delete"
  on public.reviews for delete
  using ((select auth.uid()) = user_id);
