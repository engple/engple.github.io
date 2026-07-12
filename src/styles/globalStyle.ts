import { createGlobalStyle } from "styled-components"
import reset from "styled-reset"

const GlobalStyle = createGlobalStyle`
  ${reset}

  :root {
    font-size: 100%;

    --min-width: 320px;
    --max-width: 760px;
    --post-width: 720px;
    --nav-height: 54px;
    --footer-height: 150px;

    --grid-gap-sm: 10px;
    --grid-gap-lg: 24px;
    --grid-gap-xl: 36px;
    
    --padding-xs: 8px;
    --padding-sm: 16px;
    --padding-md: 20px;
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

    --text-xs: 0.6875rem;
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

    --gradient-surface: linear-gradient(
      180deg,
      var(--color-card) 0%,
      var(--color-gray-1) 100%
    );

    body.light {
      --color-text: #1d1d1d;
      --color-text-2: #1d1d1d;
      --color-text-3: #64748b;
      --color-white: #ffffff;
      --color-nav-bar: rgba(255, 255, 255, 0.7);
      --color-nav-border: rgba(148, 163, 184, 0.65);
      --color-category-button: #eef2f7;
      --color-background: #f1f5f9;
      --color-post-background: #f8fafc;
      --color-card: #ffffff;
      --color-code: #eef2f7;
      --color-code-block: #f8fafc;
      --color-code-highlight: rgba(0, 0, 0, 0.05);
      --color-code-highlight-border: rgba(0, 0, 0, 0.2);
      --color-gray-1: #f4f7fa;
      --color-gray-2: #e2e8f0;
      --color-gray-3: #cbd5e1;
      --color-gray-4: #94a3b8;
      --color-gray-5: #64748b;
      --color-gray-6: #475569;
      --color-divider: rgba(51, 65, 85, 0.16);
      --color-inline-link-highlight: rgba(59, 91, 219, 0.13);
      --color-inline-link-highlight-hover: rgba(59, 91, 219, 0.2);
      --size-inline-link-highlight: 0.3em;
      --size-inline-link-highlight-hover: 0.5em;
      --color-dimmed: rgba(0, 0, 0, 0.15);
      --color-floating-button: rgba(255, 255, 255, 0.7);
      --color-floating-button-hover: rgba(50, 50, 50, 0.9);
      --color-floating-button-border: rgba(230, 230, 230, 0.7);
      --color-floating-button-border-hover: rgba(255, 255, 255, 0.2);
      --color-floating-button-text: #202020;
      --color-floating-button-text-hover: #f2f2f2;
      --color-floating-button-shadow: rgba(0, 0, 0, 0.2);
      --color-floating-button-shadow-hover: rgba(0, 0, 0, 0.4);
      --color-blue: var(--color-primary);
      --color-icon: #2c2c2c;
      --color-primary: #3b5bdb;
      --color-primary-strong: #2f4ac2;
      --color-primary-soft: rgba(59, 91, 219, 0.09);
      --color-accent: #b45309;
      --color-accent-soft: rgba(250, 204, 21, 0.32);
      --color-danger: #b42318;
      --shadow-sm: 0 2px 8px rgba(15, 23, 42, 0.06);
      --shadow-md: 0 10px 24px rgba(15, 23, 42, 0.07);
      --shadow-lg: 0 16px 40px rgba(15, 23, 42, 0.08);
      --shadow-hover: 0 20px 40px rgba(15, 23, 42, 0.1);
    }

    body.dark {
      --color-text: #e6e6e6;
      --color-text-2: #d1d1d1;
      --color-text-3: #8c8c8c;
      --color-white: #e6e6e6;
      --color-nav-bar: rgba(29, 29, 29, 0.7);
      --color-nav-border: rgba(255, 255, 255, 0.2);
      --color-category-button: #484848;
      --color-background: #1c1c1c;
      --color-post-background: #1c1c1c;
      --color-card: #2c2c2c;
      --color-code: #3a3a3a;
      --color-code-block: #242424;
      --color-code-highlight: rgba(255, 255, 255, 0.05);
      --color-code-highlight-border: rgba(255, 255, 255, 0.2);
      --color-gray-1: #2e2e2e;
      --color-gray-2: #3e3e3e;
      --color-gray-3: #4c4c4c;
      --color-gray-4: #5a5a5a;
      --color-gray-5: #767676;
      --color-gray-6: #989898;
      --color-divider: rgba(255, 255, 255, 0.15);
      --color-inline-link-highlight: rgba(116, 143, 252, 0.28);
      --color-inline-link-highlight-hover: rgba(116, 143, 252, 0.4);
      --size-inline-link-highlight: 0.48em;
      --size-inline-link-highlight-hover: 0.72em;
      --color-dimmed: rgba(0, 0, 0, 0.15);
      --color-floating-button: rgba(50, 50, 50, 0.7);
      --color-floating-button-hover: rgba(255, 255, 255, 0.9);
      --color-floating-button-border: rgba(255, 255, 255, 0.2);
      --color-floating-button-border-hover: rgba(230, 230, 230, 0.7);
      --color-floating-button-text: #d1d1d1;
      --color-floating-button-text-hover: #202020;
      --color-floating-button-shadow: rgba(0, 0, 0, 0.4);
      --color-floating-button-shadow-hover: rgba(0, 0, 0, 0.4);
      --color-blue: var(--color-primary);
      --color-icon: #d1d1d1;
      --color-primary: #748ffc;
      --color-primary-strong: #91a7ff;
      --color-primary-soft: rgba(116, 143, 252, 0.18);
      --color-accent: #fbbf24;
      --color-accent-soft: rgba(251, 191, 36, 0.28);
      --color-danger: #f97066;
      --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
      --shadow-md: 0 10px 24px rgba(0, 0, 0, 0.32);
      --shadow-lg: 0 16px 40px rgba(0, 0, 0, 0.38);
      --shadow-hover: 0 20px 44px rgba(0, 0, 0, 0.44);
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji';
    background-color: var(--color-post-background);
    -webkit-font-smoothing: antialiased;

    * {
      color: var(--color-text);
    }
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
