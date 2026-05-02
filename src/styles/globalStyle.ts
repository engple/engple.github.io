import { createGlobalStyle } from "styled-components"
import reset from "styled-reset"

const GlobalStyle = createGlobalStyle`
  ${reset}

  :root {
    font-size: 100%;

    --min-width: 320px;
    --max-width: 760px;
    --post-width: 720px;
    --nav-height: 68px;
    --footer-height: 60px;

    --grid-gap-sm: 10px;
    --grid-gap-lg: 24px;
    --grid-gap-xl: 36px;
    
    --padding-xs: 8px;
    --padding-sm: 16px;
    --padding-lg: 22px;
    --padding-xl: 32px;

    --border-radius-sm: 6px;
    --border-radius-base: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 28px;

    --sizing-xs: 4px;
    --sizing-sm: 8px;
    --sizing-base: 16px;
    --sizing-md: 24px;
    --sizing-lg: 40px;
    --sizing-xl: 64px;
    --sizing-xxl: 96px;
    --sizing-xxxl: 128px;

    --text-xs: 0.625rem;
    --text-sm: 0.75rem;
    --text-base: 1rem;
    --text-md: 1.125rem;
    --text-title: 1.25rem;
    --text-lg: 1.5rem; 
    --text-xl: 3rem;

    --device-xs-max-width: 419px;
    --device-sm-max-width: 767px;
    --device-md-max-width: 1023px;
    --device-lg-max-width: 1441px;

    --device-xs-max-width-query: (max-width: 419px);
    --device-sm-max-width-query: (max-width: 767px);
    --device-md-max-width-query: (max-width: 1023px);
    --device-lg-max-width-query: (max-width: 1441px);

    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semi-bold: 600;
    --font-weight-bold: 700;
    --font-weight-extra-bold: 800;

    --color-outline: rgba(0,125,250,0.6);
    --speak-color: rgb(28, 73, 255);

    body.light {
      --color-text: #1d241f;
      --color-text-2: #3e473f;
      --color-text-3: #6d746d;
      --color-white: #fffdf7;
      --color-nav-bar: rgba(247, 243, 235, 0.78);
      --color-nav-border: rgba(77, 89, 80, 0.14);
      --color-category-button: #ece3d6;
      --color-background: #f3ece0;
      --color-post-background: #f8f4ed;
      --color-card: rgba(255, 252, 245, 0.92);
      --color-surface-elevated: #fffcf6;
      --color-card-border: rgba(85, 94, 86, 0.12);
      --color-card-shadow: rgba(52, 62, 55, 0.12);
      --color-hero-bg: rgba(255, 251, 244, 0.82);
      --color-hero-highlight: rgba(214, 168, 88, 0.18);
      --color-accent: #1f6b52;
      --color-accent-soft: rgba(31, 107, 82, 0.1);
      --color-code: #f1e8dc;
      --color-code-block: #faf6ef;
      --color-code-highlight: rgba(0, 0, 0, 0.05);
      --color-code-highlight-border: rgba(0, 0, 0, 0.2);
      --color-gray-1: #f8f3ea;
      --color-gray-2: #e6ded1;
      --color-gray-3: #d4ccbe;
      --color-gray-4: #a9a292;
      --color-gray-5: #908878;
      --color-gray-6: #797163;
      --color-divider: rgba(0, 0, 0, 0.15);
      --color-dimmed: rgba(13, 20, 15, 0.18);
      --color-floating-button: rgba(255, 252, 245, 0.88);
      --color-floating-button-hover: rgba(29, 36, 31, 0.92);
      --color-floating-button-border: rgba(202, 193, 180, 0.85);
      --color-floating-button-border-hover: rgba(255, 255, 255, 0.2);
      --color-floating-button-text: #20261f;
      --color-floating-button-text-hover: #f8f4ed;
      --color-floating-button-shadow: rgba(42, 49, 43, 0.18);
      --color-floating-button-shadow-hover: rgba(0, 0, 0, 0.4);
      --color-blue: #1f6b52;
      --color-icon: #243027;
    }

    body.dark {
      --color-text: #edf1ea;
      --color-text-2: #d7ddd2;
      --color-text-3: #98a496;
      --color-white: #f2f6ee;
      --color-nav-bar: rgba(18, 22, 19, 0.78);
      --color-nav-border: rgba(255, 255, 255, 0.08);
      --color-category-button: #2a342d;
      --color-background: #121612;
      --color-post-background: #171c18;
      --color-card: rgba(30, 37, 32, 0.9);
      --color-surface-elevated: #1e2520;
      --color-card-border: rgba(181, 205, 188, 0.12);
      --color-card-shadow: rgba(0, 0, 0, 0.38);
      --color-hero-bg: rgba(27, 33, 29, 0.84);
      --color-hero-highlight: rgba(93, 154, 124, 0.2);
      --color-accent: #7ed3a7;
      --color-accent-soft: rgba(126, 211, 167, 0.14);
      --color-code: #2d352f;
      --color-code-block: #1d231f;
      --color-code-highlight: rgba(255, 255, 255, 0.05);
      --color-code-highlight-border: rgba(255, 255, 255, 0.2);
      --color-gray-1: #1d231f;
      --color-gray-2: #283029;
      --color-gray-3: #333d35;
      --color-gray-4: #516053;
      --color-gray-5: #748175;
      --color-gray-6: #9ba79c;
      --color-divider: rgba(255, 255, 255, 0.15);
      --color-dimmed: rgba(0, 0, 0, 0.15);
      --color-floating-button: rgba(35, 42, 37, 0.86);
      --color-floating-button-hover: rgba(242, 246, 238, 0.92);
      --color-floating-button-border: rgba(255, 255, 255, 0.1);
      --color-floating-button-border-hover: rgba(230, 230, 230, 0.7);
      --color-floating-button-text: #e2e8df;
      --color-floating-button-text-hover: #1c231d;
      --color-floating-button-shadow: rgba(0, 0, 0, 0.4);
      --color-floating-button-shadow-hover: rgba(0, 0, 0, 0.4);
      --color-blue: #7ed3a7;
      --color-icon: #e2e8df;
    }

    @media (min-width: ${({ theme }) => theme.device.xl}) {
      --max-width: 1096px;
    }

    @media (max-width: ${({ theme }) => theme.device.sm}) {
      --post-width: 100%;
    }
  }

  html, body, #___gatsby, #gatsby-focus-wrapper {
    min-height: 100%;
  }

  body {
    font-family: "Pretendard Variable", "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background-color: var(--color-post-background);
    background-image:
      radial-gradient(circle at top left, var(--color-hero-highlight), transparent 34%),
      radial-gradient(circle at top right, var(--color-accent-soft), transparent 28%),
      linear-gradient(180deg, var(--color-background) 0%, var(--color-post-background) 22%, var(--color-post-background) 100%);
    -webkit-font-smoothing: antialiased;
    line-height: 1.5;

    * {
      color: var(--color-text);
    }
  }

  h1, h2, h3, h4 {
    font-family: "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
    letter-spacing: -0.02em;
  }

  :lang(ko) {
    word-break: keep-all; 
  }

  ul, ol, li, dl, dt, dd, h1, h2, h3, h4, h5, h6, hgroup, p, blockquote, figure, form, fieldset, input, legend, pre, abbr, button {
    margin: 0;
    padding: 0;
  }

  h1 a, li a  {
    text-decoration: none;
  }

  a {
    text-decoration: none;
    transition:
      color 0.2s ease,
      opacity 0.2s ease,
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease;
  }

  ::selection {
    background-color: var(--color-accent-soft);
  }

  *:focus:not(:focus-visible) {
    outline: none;
  }

  :focus-visible {
    outline: 4px solid var(--color-outline);
    outline-offset: 1px;
  }

  .js-focus-visible :focus:not(.focus-visible) {
    outline: none;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(1px, 1px, 1px, 1px);
    white-space: no-wrap;
  }

  .lg-only-ads {
    display: none !important;
  }

  @media (min-width: ${({ theme }) => theme.device.lg}) {
    .lg-only-ads {
      display: block !important;
    }
  }
    
    div[data-inline-banner] {
    margin: var(--sizing-md) 0;
  }
}`

export default GlobalStyle
