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
      --color-text: #1d1d1d;
      --color-text-2: #1d1d1d;
      --color-text-3: #696969;
      --color-white: #ffffff;
      --color-nav-bar: rgba(255, 255, 255, 0.7);
      --color-nav-border: rgba(200, 200, 200, 0.7);
      --color-category-button: #f2f2f2;
      --color-background: #f2f2f2;
      --color-post-background: #ffffff;
      --color-card: #ffffff;
      --color-code: #f2f2f2;
      --color-code-block: #fafafa;
      --color-code-highlight: rgba(0, 0, 0, 0.05);
      --color-code-highlight-border: rgba(0, 0, 0, 0.2);
      --color-gray-1: #f9f9f9;
      --color-gray-2: #e8e8e8;
      --color-gray-3: #dadada;
      --color-gray-4: #a3a3a3;
      --color-gray-5: #8e8e8e;
      --color-gray-6: #878787;
      --color-divider: rgba(0, 0, 0, 0.15);
      --color-dimmed: rgba(0, 0, 0, 0.15);
      --color-floating-button: rgba(255, 255, 255, 0.7);
      --color-floating-button-hover: rgba(50, 50, 50, 0.9);
      --color-floating-button-border: rgba(230, 230, 230, 0.7);
      --color-floating-button-border-hover: rgba(255, 255, 255, 0.2);
      --color-floating-button-text: #202020;
      --color-floating-button-text-hover: #f2f2f2;
      --color-floating-button-shadow: rgba(0, 0, 0, 0.2);
      --color-floating-button-shadow-hover: rgba(0, 0, 0, 0.4);
      --color-blue: #0066cc;
      --color-icon: #2c2c2c;
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
      --color-dimmed: rgba(0, 0, 0, 0.15);
      --color-floating-button: rgba(50, 50, 50, 0.7);
      --color-floating-button-hover: rgba(255, 255, 255, 0.9);
      --color-floating-button-border: rgba(255, 255, 255, 0.2);
      --color-floating-button-border-hover: rgba(230, 230, 230, 0.7);
      --color-floating-button-text: #d1d1d1;
      --color-floating-button-text-hover: #202020;
      --color-floating-button-shadow: rgba(0, 0, 0, 0.4);
      --color-floating-button-shadow-hover: rgba(0, 0, 0, 0.4);
      --color-blue: #0a84ff;
      --color-icon: #d1d1d1;
    }

    @media (min-width: ${({ theme }) => theme.device.xl}) {
      --max-width: 1096px;
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

  .inline-banner {
    margin: var(--sizing-lg) 0;
    
    a {
      text-decoration: none !important;
      display: block;
      padding: var(--sizing-lg) var(--sizing-md);
      background: linear-gradient(135deg, var(--color-gray-1) 0%, var(--color-gray-2) 50%, var(--color-gray-1) 100%);
      border-radius: var(--border-radius-lg);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(28, 73, 255, 0.2);
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(28, 73, 255, 0.1);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(0, 125, 250, 0.05) 0%, rgba(28, 73, 255, 0.08) 50%, rgba(0, 125, 250, 0.05) 100%);
        opacity: 1;
        transition: opacity 0.3s ease;
        border-radius: inherit;
      }

      &::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(135deg, rgba(28, 73, 255, 0.3), rgba(0, 125, 250, 0.3), rgba(28, 73, 255, 0.3));
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        background: linear-gradient(135deg, var(--color-gray-2) 0%, var(--color-gray-3) 50%, var(--color-gray-2) 100%);
        text-decoration: none;
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(28, 73, 255, 0.25);
        border-color: rgba(28, 73, 255, 0.6);

        &::before {
          opacity: 0.8;
          background: linear-gradient(135deg, rgba(0, 125, 250, 0.1) 0%, rgba(28, 73, 255, 0.15) 50%, rgba(0, 125, 250, 0.1) 100%);
        }

        &::after {
          opacity: 1;
        }

        .inline-banner-arrow {
          transform: translateX(6px);
        }

        .inline-banner-title {
          color: var(--speak-color);
        }
      }

      &:active {
        transform: translateY(-2px);
      }
    }

    .inline-banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sizing-md);
      position: relative;
      z-index: 1;
    }

    .inline-banner-text-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--sizing-xs);
      flex: 1;
    }

    .inline-banner-header {
      display: flex;
      align-items: center;
      gap: var(--sizing-xs);
    }

    .inline-banner-title {
      font-weight: var(--font-weight-bold);
      font-size: 1.2rem;
      background: linear-gradient(135deg, var(--color-text) 0%, var(--speak-color) 70%, var(--color-text) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: var(--sizing-xs);
      transition: all 0.3s ease;
      line-height: 1.3;
    }

    .inline-banner-subtext {
      font-size: 0.95rem;
      color: var(--color-text-2);
      line-height: 1.4;
      opacity: 0.85;
    }

    .inline-banner-arrow {
      color: var(--speak-color);
      font-size: 1.5rem;
      font-weight: bold;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
      filter: drop-shadow(0 1px 2px rgba(28, 73, 255, 0.3));
    }

    .inline-banner-caption {
      margin-top: var(--sizing-xs);
      padding: 0 var(--sizing-sm);
      font-size: 0.75rem;
      color: var(--color-gray-6);
      text-align: right;
    }
  }

  .inline-banner-first-paragraph {
    margin: var(--sizing-xl) 0;
    
    a {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
      border: 2px solid rgba(28, 73, 255, 0.25);
      box-shadow: 0 4px 12px rgba(28, 73, 255, 0.15);
      
      &::before {
        background: linear-gradient(135deg, rgba(0, 125, 250, 0.06) 0%, rgba(28, 73, 255, 0.1) 50%, rgba(0, 125, 250, 0.06) 100%);
        opacity: 1;
      }

      &::after {
        background: linear-gradient(135deg, rgba(28, 73, 255, 0.4), rgba(0, 125, 250, 0.4), rgba(28, 73, 255, 0.4));
      }

      &:hover {
        background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
        border-color: rgba(28, 73, 255, 0.7);
        box-shadow: 0 10px 30px rgba(28, 73, 255, 0.3);
      }
    }

    .inline-banner-title {
      font-size: 1.25rem;
      background: linear-gradient(135deg, var(--color-text) 0%, var(--speak-color) 60%, var(--color-text) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .inline-banner-caption {
      color: var(--speak-color);
      font-weight: var(--font-weight-semi-bold);
    }
  }

  /* Dark mode adjustments */
  body.dark {
    .inline-banner {
      a {
        background: linear-gradient(135deg, var(--color-gray-1) 0%, var(--color-gray-2) 50%, var(--color-gray-1) 100%);
        border-color: rgba(10, 132, 255, 0.3);
        box-shadow: 0 2px 8px rgba(10, 132, 255, 0.2);
        
        &::before {
          background: linear-gradient(135deg, rgba(10, 132, 255, 0.08) 0%, rgba(28, 73, 255, 0.12) 50%, rgba(10, 132, 255, 0.08) 100%);
        }

        &::after {
          background: linear-gradient(135deg, rgba(10, 132, 255, 0.4), rgba(28, 73, 255, 0.4), rgba(10, 132, 255, 0.4));
        }

        &:hover {
          background: linear-gradient(135deg, var(--color-gray-2) 0%, var(--color-gray-3) 50%, var(--color-gray-2) 100%);
          box-shadow: 0 8px 25px rgba(10, 132, 255, 0.3);
          border-color: rgba(10, 132, 255, 0.7);
        }
      }

      .inline-banner-title {
        background: linear-gradient(135deg, var(--color-text) 0%, var(--color-blue) 70%, var(--color-text) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .inline-banner-arrow {
        filter: drop-shadow(0 1px 2px rgba(10, 132, 255, 0.4));
      }

      .inline-banner-caption {
        color: var(--color-blue);
      }
    }

    .inline-banner-first-paragraph {
      a {
        background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #1e293b 100%);
        border-color: rgba(10, 132, 255, 0.4);
        box-shadow: 0 4px 12px rgba(10, 132, 255, 0.25);
        
        &::before {
          background: linear-gradient(135deg, rgba(10, 132, 255, 0.08) 0%, rgba(28, 73, 255, 0.12) 50%, rgba(10, 132, 255, 0.08) 100%);
          opacity: 1;
        }

        &::after {
          background: linear-gradient(135deg, rgba(10, 132, 255, 0.5), rgba(28, 73, 255, 0.5), rgba(10, 132, 255, 0.5));
        }

        &:hover {
          background: linear-gradient(135deg, #334155 0%, #475569 50%, #334155 100%);
          box-shadow: 0 10px 30px rgba(10, 132, 255, 0.4);
          border-color: rgba(10, 132, 255, 0.8);
        }
      }

      .inline-banner-title {
        background: linear-gradient(135deg, var(--color-text) 0%, var(--color-blue) 60%, var(--color-text) 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .inline-banner-caption {
        color: var(--color-blue);
      }
    }
  }
}`

export default GlobalStyle
