# 잉플 디자인 시스템

잉플(Engple)의 UI를 일관되게 유지하기 위한 디자인 토큰과 사용 규칙을 정의합니다.
모든 토큰은 `src/styles/globalStyle.ts`에 CSS 커스텀 프로퍼티로 선언되며,
라이트/다크 테마는 `body.light` / `body.dark` 클래스 스코프로 전환됩니다.

## 원칙

1. **토큰 우선**: 색상·그림자·간격·글자 크기는 컴포넌트에 하드코딩하지 않고 토큰을 사용합니다.
   특히 그림자와 브랜드 컬러는 테마별 값이 다르므로 raw `rgba(...)` 를 새로 만들지 않습니다.
2. **시맨틱 이름 사용**: `--color-gray-3` 같은 원시 스케일보다 `--color-divider`,
   `--color-primary` 같은 시맨틱 토큰이 있으면 그것을 먼저 사용합니다.
3. **다크모드는 토큰에서 해결**: 컴포넌트 안에서 `body.dark &` 분기가 필요하다면
   먼저 "토큰으로 흡수할 수 있는가"를 검토합니다.
4. **인터랙션 일관성**: 카드류는 `hover 시 translateY(-1~-2px) + shadow 승격 + border 강조`,
   전환은 `0.2s ease`를 기본으로 합니다.

## 색상 토큰

### 브랜드 / 상태

| 토큰                     | 라이트                      | 다크                   | 용도                                                   |
| ------------------------ | --------------------------- | ---------------------- | ------------------------------------------------------ |
| `--color-primary`        | `#0066cc`                   | `#0a84ff`              | 브랜드 액센트(링크 하이라이트, 발음 버튼, 활성 상태)   |
| `--color-primary-strong` | `#0054a8`                   | `#3b9dff`              | 액센트 hover/pressed                                   |
| `--color-primary-soft`   | `rgba(0,102,204,.08)`       | `rgba(10,132,255,.16)` | 액센트 배경 틴트(검색 결과 활성/호버 등)               |
| `--color-danger`         | `#b42318`                   | `#f97066`              | 오류 메시지                                            |
| `--color-blue`           | `var(--color-primary)` 별칭 | 〃                     | 레거시 호환용 — 신규 코드에서는 `--color-primary` 사용 |

### 텍스트 / 서피스

기존 토큰 유지: `--color-text`(본문), `--color-text-2`(보조), `--color-text-3`(메타),
`--color-background`, `--color-post-background`, `--color-card`, `--color-divider`,
`--color-gray-1~6`(원시 스케일 — 시맨틱 토큰이 없을 때만).

### 그라데이션

| 토큰                 | 값                                                                | 용도                                                                |
| -------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| `--gradient-surface` | `linear-gradient(180deg, var(--color-card), var(--color-gray-1))` | 패널/카드 배경(TOC, 사이드 패널, Continue 카드, 피처 이미지 프레임) |

## 엘리베이션(그림자)

그림자는 테마별로 정의됩니다. 라이트는 네이비 틴트(`rgba(15,23,42,…)`),
다크는 딥 블랙(`rgba(0,0,0,…)`)을 사용해 다크모드에서도 깊이감이 유지됩니다.

| 토큰             | 용도                                       |
| ---------------- | ------------------------------------------ |
| `--shadow-sm`    | 리스트 아이템, 그리드 카드 기본 상태       |
| `--shadow-md`    | 카드 hover, 버튼/필 hover                  |
| `--shadow-lg`    | 고정 패널(TOC, 사이드 패널), 모달성 서피스 |
| `--shadow-hover` | 큰 카드의 hover 승격 상태                  |

## 타이포그래피

| 토큰           | 크기             | 용도                                          |
| -------------- | ---------------- | --------------------------------------------- |
| `--text-xs`    | 0.6875rem (11px) | 힌트, 캡션 — 접근성상 이보다 작은 글자는 금지 |
| `--text-sm`    | 0.75rem          | 메타 정보, 라벨                               |
| `--text-base`  | 1rem             | 기본                                          |
| `--text-md`    | 1.125rem         | 카드 제목                                     |
| `--text-title` | 1.25rem          | 내비게이션 타이틀                             |
| `--text-lg`    | 1.5rem           | 섹션 헤딩                                     |
| `--text-xl`    | 3rem             | 포스트 H1                                     |

폰트는 시스템 폰트 스택을 사용합니다(웹폰트 미사용 — CLS/LCP 최적화 의도).
본문 한국어는 `word-break: keep-all`이 전역 적용되어 있습니다.

## 간격 / 반경

- 패딩: `--padding-xs(8) / sm(16) / md(20) / lg(22) / xl(32)`
- 사이징: `--sizing-xs(4) ~ --sizing-xxxl(128)`
- 반경: `--border-radius-sm(6) / base(8) / md(12) / lg(28)`, 필형 요소는 `999px`

## 브레이크포인트

styled-components `theme.device` 사용: `xs 419 / sm 767 / md 1023 / lg 1496 / xl 1920`.
CSS 변수 `--device-*`는 레거시이며 신규 코드에서는 `theme.device`를 사용합니다.

## 접근성 체크리스트

- 터치 타깃 최소 `2.75rem`(44px) — 카테고리 필, 페이지네이션에 적용됨
- 포커스는 `:focus-visible` 전역 아웃라인에 위임, 임의 제거 금지
- 아이콘 전용 버튼은 `aria-label` 필수
- `--text-xs`(11px) 미만 글자 크기 사용 금지

## SEO 규칙

- 모든 페이지는 `src/components/seo.tsx`를 통해 메타를 선언합니다
  (canonical, OG/Twitter, robots, JSON-LD `@graph`).
- 포스트는 `BlogPosting + BreadcrumbList + LearningResource(+ FAQPage/Quiz/DefinedTerm)`
  구조화 데이터를 출력합니다.
- 페이지당 `h1`은 정확히 1개(홈: 컬렉션 타이틀, 포스트: 글 제목). 본문 마크다운은 `h2`부터 시작합니다.
- 이미지에는 `alt`(frontmatter `alt`)를 반드시 채우고, 본문 외 이미지는 `loading="lazy"`.
- `article:published_time / modified_time / section`은 포스트 템플릿에서 자동 출력됩니다.
- `theme-color` 메타는 라이트 `#ffffff` / 다크 `#1c1c1c`로 SEO 컴포넌트가 출력합니다.
