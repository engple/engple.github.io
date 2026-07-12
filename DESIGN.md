# Engple Design System

This document defines the design tokens and usage rules for keeping Engple's UI consistent.
All tokens are declared as CSS custom properties in `src/styles/globalStyle.ts`.
The light and dark themes are switched through the `body.light` and `body.dark` class scopes.

## Brand Mood — "Study Notes"

Engple is an English-learning site. Its UI follows a notebook-and-highlighter metaphor.

- **Indigo primary**: A trustworthy educational brand tone used for active states and learning UI, including exercise numbers, FAQ indexes, and active table-of-contents items.
- **Amber highlighter accent**: Used for highlighted `strong` text, title marker bars, and the brand dot. It visualizes the experience of highlighting key expressions.
- **Warm paper background**: The light-theme `--color-background` uses a paper tone (`#f7f5f0`).
- **Bookish display type** (`--font-display`): A system serif stack used only for page H1 headings and the brand logo. It evokes dictionaries and textbooks without adding web-font loading cost.

## Principles

1. **Tokens first**: Use tokens for colors, shadows, spacing, and font sizes instead of hardcoding values in components. In particular, do not introduce new raw `rgba(...)` values for shadows or brand colors because their values differ by theme.
2. **Use semantic names**: Prefer semantic tokens such as `--color-divider` and `--color-primary` over primitive scales such as `--color-gray-3` whenever a semantic token exists.
3. **Solve dark mode with tokens**: If a component needs a `body.dark &` branch, first consider whether the difference can be absorbed into a token.
4. **Keep interactions consistent**: Cards generally use `translateY(-1px)` to `translateY(-2px)` on hover, an elevated shadow, and emphasized borders. Use `0.2s ease` as the default transition.

## Color Tokens

### Brand and status

| Token                    | Light                           | Dark                    | Usage                                                               |
| ------------------------ | ------------------------------- | ----------------------- | ------------------------------------------------------------------- |
| `--color-primary`        | `#3b5bdb`                       | `#748ffc`               | Brand indigo: link highlights, pronunciation buttons, active states |
| `--color-primary-strong` | `#2f4ac2`                       | `#91a7ff`               | Emphasized indigo text and hover states                             |
| `--color-primary-soft`   | `rgba(59,91,219,.09)`           | `rgba(116,143,252,.18)` | Indigo tint for chips, active pills, blockquotes, exercise badges   |
| `--color-accent`         | `#b45309`                       | `#fbbf24`               | Amber accent text: brand dot and marker borders                     |
| `--color-accent-soft`    | `rgba(250,204,21,.32)`          | `rgba(251,191,36,.28)`  | Highlighter effect for `strong` text and marker bars                |
| `--color-danger`         | `#b42318`                       | `#f97066`               | Error messages                                                      |
| `--color-blue`           | Alias of `var(--color-primary)` | Same                    | Legacy compatibility; use `--color-primary` in new code             |

### Text and surfaces

Existing tokens include `--color-text` (body text), `--color-text-2` (secondary text),
`--color-text-3` (metadata), `--color-background`, `--color-post-background`,
`--color-card`, `--color-divider`, and `--color-gray-1` through `--color-gray-6`.
Use the primitive gray scale only when no semantic token exists.

### Gradients

| Token                | Value                                                             | Usage                                                                                  |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `--gradient-surface` | `linear-gradient(180deg, var(--color-card), var(--color-gray-1))` | Panel and card backgrounds: TOC, side panels, continue cards, and feature-image frames |

## Elevation (Shadows)

Shadows are defined per theme. Light mode uses a navy tint (`rgba(15,23,42,...)`),
while dark mode uses deep black (`rgba(0,0,0,...)`) to preserve depth.

| Token            | Usage                                                          |
| ---------------- | -------------------------------------------------------------- |
| `--shadow-sm`    | Default state for list items and grid cards                    |
| `--shadow-md`    | Card hover and button/pill hover                               |
| `--shadow-lg`    | Fixed panels such as TOC, side panels, and modal-like surfaces |
| `--shadow-hover` | Elevated hover state for large cards                           |

## Typography

| Token          | Size             | Usage                                                            |
| -------------- | ---------------- | ---------------------------------------------------------------- |
| `--text-xs`    | 0.6875rem (11px) | Hints and captions; smaller text is prohibited for accessibility |
| `--text-sm`    | 0.75rem          | Metadata and labels                                              |
| `--text-base`  | 1rem             | Default text                                                     |
| `--text-md`    | 1.125rem         | Card titles                                                      |
| `--text-title` | 1.25rem          | Navigation title                                                 |
| `--text-lg`    | 1.5rem           | Section headings                                                 |
| `--text-xl`    | 3rem             | Post H1                                                          |

Fonts use system stacks; no web fonts are loaded, which is intentional for CLS/LCP optimization.
Korean body text uses `word-break: keep-all` globally.

`--font-display` (the system serif stack) is reserved for page H1 headings—the home hero
and post titles—and the navigation brand. Do not use it for body, card, or button UI text.

## Spacing and Radius

- Padding: `--padding-xs(8)` / `sm(16)` / `md(20)` / `lg(22)` / `xl(32)`
- Sizing: `--sizing-xs(4)` through `--sizing-xxxl(128)`
- Radius: `--border-radius-sm(6)` / `base(8)` / `md(12)` / `lg(28)`; pill-shaped elements use `999px`

## Breakpoints

Use styled-components `theme.device`: `xs 419` / `sm 767` / `md 1023` / `lg 1496` / `xl 1920`.
The `--device-*` CSS variables are legacy; use `theme.device` in new code.

## Accessibility Checklist

- Minimum touch target: `2.75rem` (44px), applied to category pills and pagination.
- Delegate focus styling to the global `:focus-visible` outline; do not remove it locally.
- Icon-only buttons must have an `aria-label`.
- Do not use text smaller than `--text-xs` (11px).

## SEO Rules

- Declare metadata for every page through `src/components/seo.tsx` (canonical, OG/Twitter, robots, and JSON-LD `@graph`).
- Posts output `BlogPosting + BreadcrumbList + LearningResource` plus optional `FAQPage`, quiz, and defined-term structured data.
- Each page must have exactly one H1: the collection title on the home page and the post title on post pages. Markdown content starts at H2.
- Every image must have an `alt` value from frontmatter. Images outside the body must use `loading="lazy"`.
- `article:published_time`, `article:modified_time`, and `article:section` are emitted automatically by the post template.
- The SEO component outputs light `#ffffff` and dark `#1c1c1c` `theme-color` metadata.
