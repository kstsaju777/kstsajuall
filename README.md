# 사주 사이트 보일러플레이트

> Next.js 15 + Supabase + 토스페이먼츠로 만든 **결제까지 동작하는** 사주 사이트 보일러플레이트.
> 클론 → 환경변수 → 1번 배포 = 본인 사주 사이트 완성.

## 무엇을 얻나요?

- ✅ 토스페이먼츠 위젯 v2 결제 플로우 (서버 confirm + 금액 위변조 검증)
- ✅ Supabase 기반 회원/주문/결과 데이터 모델 + RLS
- ✅ 게스트 결제 (이메일만으로 결제 가능, 추후 회원가입 시 자동 연결)
- ✅ AI 사주 해석 (OpenAI / Anthropic / Gemini 스위치)
- ✅ 마이페이지, 관리자 결제 내역, 법적 페이지(약관/개인정보/환불/사업자정보)
- ✅ shadcn/ui 기반 깔끔한 UI

## 빠른 시작

### 1. 사전 준비물

| 항목 | 비고 |
|---|---|
| Node.js 22+ | pnpm 권장 |
| Supabase 계정 | 무료 플랜 OK |
| 토스페이먼츠 가입 | 테스트 키는 즉시 발급, 라이브 키는 PG 심사 필요 |
| LLM API 키 | OpenAI / Anthropic / Gemini 중 **하나면 됨** |
| 만세력 API | 선택. 없으면 mock 모드로 데모 동작 |

### 2. 로컬 실행

```bash
git clone <this-repo> saju-site && cd saju-site
pnpm install
cp .env.example .env.local
# .env.local 열어서 채우기 (아래 § 환경변수 참고)
pnpm dev
```

### 3. Supabase 세팅

1. https://supabase.com 에서 새 프로젝트 생성
2. **Settings → API** 에서 `URL`, `anon`, `service_role` 키 복사 → `.env.local`
3. 마이그레이션 적용 (택1):
   - **CLI**: `npx supabase link --project-ref <ref> && npx supabase db push`
   - **수동**: Supabase Studio → SQL Editor 에서 `supabase/migrations/` 의 SQL 3개를 차례로 실행
4. 상품 시드: `pnpm seed:products`
5. 관리자 지정: 회원가입 후 `pnpm create:admin <your-email>`

### 4. 토스페이먼츠

1. https://developers.tosspayments.com 에서 가입
2. **테스트 키**는 `.env.example` 의 기본값 그대로 동작합니다 (즉시 결제 테스트 가능)
3. 실 결제용 라이브 키는 PG 심사 통과 후 발급 — **[PG_심사_가이드.md](./PG_심사_가이드.md)** 참고
4. 토스 콘솔에서 콜백 URL 등록:
   - 성공: `https://<your-domain>/checkout/success`
   - 실패: `https://<your-domain>/checkout/fail`

### 5. Vercel 배포

자세한 내용은 [DEPLOY.md](./DEPLOY.md) 참고.

요약: GitHub repo 연결 → 환경변수 입력 → Deploy.

## 환경변수

`.env.example` 참고. 핵심:

```bash
NEXT_PUBLIC_SITE_URL=                 # 배포 도메인 (로컬은 http://localhost:3000)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # 절대 클라이언트에 노출 금지
NEXT_PUBLIC_TOSS_CLIENT_KEY=
TOSS_SECRET_KEY=
LLM_PROVIDER=anthropic                # openai | anthropic | gemini
LLM_MODEL=claude-sonnet-4-6
ANTHROPIC_API_KEY=                    # 선택한 provider 키만 채우면 됨
```

## 커스터마이징

| 바꾸고 싶은 것 | 파일 |
|---|---|
| 사이트 이름·설명·이메일 | `src/config/site.ts` |
| 사업자 정보 (법적 페이지에 노출) | `src/config/site.ts` `businessInfo` |
| 상품 라인업 (이름/가격/설명) | `src/config/products.seed.ts` 수정 → `pnpm seed:products` |
| 사주 해석 톤·분량 | `src/lib/saju/prompt.ts` |
| 만세력 API 연동 | `src/lib/saju/manseryeok.ts` `callExternalManseryeok` |
| 컬러 테마 | `src/app/globals.css` (HSL 변수) + `tailwind.config.ts` 팔레트 |
| 랜딩 카피 | `src/components/landing/Hero.tsx` |
| 디자인 시스템 가이드 | `DESIGN.md` (현재 Ollama 스타일 — 페이퍼 화이트 + pill geometry + flat). 다른 스타일로 갈아끼우려면 `npx getdesign@latest add <brand>` |

## 폴더 구조

```
src/
├── app/                # Next.js App Router 페이지 및 API
│   ├── (auth)/         # 로그인/회원가입/리셋
│   ├── products/       # 상품 리스트 + 상세
│   ├── checkout/       # 토스 위젯 + success/fail
│   ├── results/        # 결과지
│   ├── mypage/         # 마이페이지
│   ├── admin/          # 관리자 (is_admin 가드)
│   ├── legal/          # 약관/개인정보/환불/사업자정보
│   └── api/            # 서버 라우트 핸들러
├── components/         # UI 컴포넌트 (shadcn 기반)
├── lib/                # supabase / toss / saju / env 헬퍼
├── config/             # 사이트 설정 + 상품 시드
└── types/              # DB / 도메인 타입
supabase/migrations/    # 초기 스키마 / RLS / 시드
scripts/                # seed-products, create-admin
```

## 검증 체크리스트

- [ ] `pnpm dev` 가 정상 부팅됨
- [ ] `pnpm typecheck` 통과
- [ ] `/products` 에서 시드 상품 4개가 보임
- [ ] 게스트로 4,900원 상품 결제 → `/results/...` 로 이동, 결과지 표시됨
- [ ] 회원가입 → 마이페이지 → 결제 내역 확인됨
- [ ] `pnpm create:admin <email>` 후 `/admin/orders` 진입 가능, 비어드민은 차단됨

## 트러블슈팅

- **결제 위젯이 안 보여요** → `NEXT_PUBLIC_TOSS_CLIENT_KEY` 확인, 콘솔에서 도메인 등록 확인
- **결제 후 결과지가 안 떠요** → `LLM_PROVIDER` 와 해당 API 키 확인, 토스 대시보드에서 결제는 승인되었으나 결과 생성만 실패한 경우 `/admin/orders` 에서 토스 대시보드로 환불 처리
- **`/admin` 이 자꾸 홈으로 튕겨요** → `pnpm create:admin <email>` 실행 후 로그아웃→재로그인
- **Supabase RLS 에러** → service_role 키가 빠져있을 가능성. 서버 라우트에서만 `createServiceClient()` 사용

## 라이선스

MIT. 자유롭게 클론·수정·재배포 가능합니다.
