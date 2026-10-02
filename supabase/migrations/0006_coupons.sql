-- =====================================================
-- 체험단 쿠폰 시스템 (1차: 종합사주 상품에만 적용)
-- =====================================================

create type public.coupon_discount_kind as enum ('fixed', 'free_pass');

-- 쿠폰 종류 (어드민이 정의) — 예: "1000원 할인권", "프리패스 이용권"
create table public.coupon_types (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  discount_kind public.coupon_discount_kind not null default 'fixed',
  amount integer not null default 0 check (amount >= 0), -- free_pass는 0 고정
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 특정 계정에 발급된 쿠폰 1장 (1상품 1회용)
create table public.user_coupons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  coupon_type_id uuid not null references public.coupon_types(id),
  status text not null default 'unused' check (status in ('unused', 'used')),
  order_id uuid references public.orders(id) on delete set null, -- 적용/사용된 주문
  created_at timestamptz not null default now(),
  used_at timestamptz
);

create index user_coupons_user_idx on public.user_coupons(user_id, status);

-- orders 테이블에 쿠폰 적용 결과를 기록 (어드민 매출 집계에서 분리하기 위함)
alter table public.orders
  add column coupon_user_coupon_id uuid references public.user_coupons(id),
  add column coupon_discount integer not null default 0;

-- 기본 쿠폰 종류 시드
insert into public.coupon_types (code, name, discount_kind, amount) values
  ('discount_1000', '1,000원 할인권', 'fixed', 1000),
  ('discount_2000', '2,000원 할인권', 'fixed', 2000),
  ('discount_3000', '3,000원 할인권', 'fixed', 3000),
  ('discount_5000', '5,000원 할인권', 'fixed', 5000),
  ('discount_10000', '10,000원 할인권', 'fixed', 10000),
  ('free_pass', '프리패스 이용권', 'free_pass', 0)
on conflict (code) do nothing;

-- RLS
alter table public.coupon_types enable row level security;
alter table public.user_coupons enable row level security;

create policy "coupon_types_public_read" on public.coupon_types
  for select using (is_active);

create policy "user_coupons_own_read" on public.user_coupons
  for select using (user_id = (select auth.uid()));
