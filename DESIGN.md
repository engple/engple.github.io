# Engple Design System

Use these tokens and rules for consistent UI across Engple. Tokens are defined in
`src/styles/globalStyle.ts`; `body.light` and `body.dark` provide the theme scopes.

## Design Direction

Engple uses a study-note visual language:

- Indigo is the primary educational color for links, active states, and learning UI.
- Amber is the highlighter accent for `strong` text, marker bars, and the brand dot.
- Light mode uses a pale cool gray-blue background (`--color-background: #f5f7fb`).
- Use the existing system sans-serif stack for UI and headings; do not introduce a display serif.

## Rules

1. Use tokens for colors, shadows, spacing, and type sizes. Do not add raw `rgba(...)` values for theme-dependent shadows or brand colors.
2. Prefer semantic tokens such as `--color-divider` and `--color-primary` over primitive gray tokens when available.
3. Solve theme differences in tokens before adding `body.dark &` component branches.
4. Cards use `translateY(-1px)` to `translateY(-2px)`, an elevated shadow, an emphasized border, and a default `0.2s ease` transition on hover.

## Colors

| Token                    | Light                           | Dark                    | Usage                                                 |
| ------------------------ | ------------------------------- | ----------------------- | ----------------------------------------------------- |
| `--color-primary`        | `#4f66c8`                       | `#748ffc`               | Links, pronunciation buttons, and active states       |
| `--color-primary-strong` | `#3f55ae`                       | `#91a7ff`               | Emphasized indigo text and hover states               |
| `--color-primary-soft`   | `rgba(79,102,200,.10)`          | `rgba(116,143,252,.18)` | Chips, active pills, blockquotes, and exercise badges |
| `--color-accent`         | `#b45309`                       | `#fbbf24`               | Brand dot and marker borders                          |
| `--color-accent-soft`    | `rgba(250,204,21,.32)`          | `rgba(251,191,36,.28)`  | `strong` highlights and marker bars                   |
| `--color-danger`         | `#b42318`                       | `#f97066`               | Error messages                                        |
| `--color-blue`           | Alias of `var(--color-primary)` | Same                    | Legacy alias; use `--color-primary` in new code       |

Existing text and surface tokens: `--color-text`, `--color-text-2`, `--color-text-3`,
`--color-background`, `--color-post-background`, `--color-card`, `--color-divider`,
and `--color-gray-1` through `--color-gray-6`. Use the gray scale only when no semantic token exists.

### Gradient

| Token                | Value                                                             | Usage                                                      |
| -------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| `--gradient-surface` | `linear-gradient(180deg, var(--color-card), var(--color-gray-1))` | TOC, side panels, continue cards, and feature-image frames |

## Elevation

Light shadows use a navy tint (`rgba(15,23,42,...)`); dark shadows use deep black
(`rgba(0,0,0,...)`).

| Token            | Usage                                              |
| ---------------- | -------------------------------------------------- |
| `--shadow-sm`    | List items and grid cards in their default state   |
| `--shadow-md`    | Card and button/pill hover                         |
| `--shadow-lg`    | Fixed panels, side panels, and modal-like surfaces |
| `--shadow-hover` | Elevated hover state for large cards               |

## Typography and Layout

| Token          | Size             | Usage                                           |
| -------------- | ---------------- | ----------------------------------------------- |
| `--text-xs`    | 0.6875rem (11px) | Hints and captions; smaller text is not allowed |
| `--text-sm`    | 0.75rem          | Metadata and labels                             |
| `--text-base`  | 1rem             | Default text                                    |
| `--text-md`    | 1.125rem         | Card titles                                     |
| `--text-title` | 1.25rem          | Navigation title                                |
| `--text-lg`    | 1.5rem           | Section headings                                |
| `--text-xl`    | 3rem             | Post H1                                         |

- Use the existing system font stack; do not add web fonts. Korean body text uses global `word-break: keep-all`.
- Padding: `--padding-xs(8)` / `sm(16)` / `md(20)` / `lg(22)` / `xl(32)`.
- Sizing: `--sizing-xs(4)` through `--sizing-xxxl(128)`.
- Radius: `--border-radius-sm(6)` / `base(8)` / `md(12)` / `lg(28)`; pills use `999px`.
- Breakpoints: `theme.device` `xs 419` / `sm 767` / `md 1023` / `lg 1496` / `xl 1920`. The `--device-*` variables are legacy.

## Accessibility

- Minimum touch target: `2.75rem` (44px); this applies to category pills and pagination.
- Use the global `:focus-visible` outline; do not remove it locally.
- Icon-only buttons require an `aria-label`.
- Do not use text smaller than `--text-xs` (11px).

## SEO

- Declare every page's metadata through `src/components/seo.tsx`: canonical, OG/Twitter, robots, and JSON-LD `@graph`.
- Posts output `BlogPosting`, `BreadcrumbList`, and `LearningResource`, plus optional FAQ, quiz, and defined-term data.
- Each page has exactly one H1: the collection title on the home page or the post title on a post page. Markdown starts at H2.
- Every image requires frontmatter `alt`; images outside the body use `loading="lazy"`.
- Post pages automatically emit `article:published_time`, `article:modified_time`, and `article:section`.
- SEO emits the active theme color: light `#f5f7fb` or dark `#1c1c1c`.
