import styled from "styled-components"

import type typography from "./typography"

const Markdown = styled.article<{ rhythm: (typeof typography)["rhythm"] }>`
  min-width: 100%;
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    scroll-margin-top: var(--sizing-xl);
    font-weight: var(--font-weight-bold);
  }

  td,
  th {
    border-bottom: 1px solid var(--color-gray-3);
  }

  strong {
    font-weight: var(--font-weight-semi-bold);
  }

  a,
  p {
    font-weight: var(--font-weight-regular);
  }

  a {
    text-decoration: underline;
    font-weight: var(--font-weight-semi-bold);
    &:hover,
    &:active {
      text-decoration: underline;
    }
  }

  & > *:first-child {
    margin-top: 0;
  }

  h1 {
    font-size: 2.5rem;

    @media (max-width: ${({ theme }) => theme.device.sm}) {
      font-size: 2rem;
    }
  }

  h2 {
    font-size: 1.75rem;
    line-height: 1.3;
    margin-bottom: ${({ rhythm }) => rhythm(1)};
    margin-top: ${({ rhythm }) => rhythm(2.25)};

    @media (max-width: ${({ theme }) => theme.device.sm}) {
      font-size: 1.3125rem;
    }
  }

  h3 {
    font-size: 1.31951rem;
    line-height: 1.3;
    margin-bottom: ${({ rhythm }) => rhythm(1)};
    margin-top: ${({ rhythm }) => rhythm(1.5)};

    @media (max-width: ${({ theme }) => theme.device.sm}) {
      font-size: 1.1875rem;
    }
  }

  h4,
  h5,
  h6 {
    margin-bottom: ${({ rhythm }) => rhythm(0.5)};
    margin-top: ${({ rhythm }) => rhythm(1)};
  }

  ol {
    list-style-type: decimal;
  }

  ul,
  ol {
    margin-top: ${({ rhythm }) => rhythm(0.8)};
    margin-bottom: ${({ rhythm }) => rhythm(0.8)};
    margin-left: ${({ rhythm }) => rhythm(1)};
    padding-left: 0;
  }

  li > ul,
  li > ol {
    margin-top: ${({ rhythm }) => rhythm(0.3)};
    margin-bottom: 0;
  }

  li {
    margin-bottom: ${({ rhythm }) => rhythm(0.4)};
    line-height: 1.6;
    position: relative;

    &::before {
      content: "•";
      position: absolute;
      left: -${({ rhythm }) => rhythm(0.8)};
      color: var(--color-gray-6);
    }
  }

  ol li::before {
    content: none;
  }

  li > ol,
  li > ul {
    margin-left: ${({ rhythm }) => rhythm(1)};
  }

  li > p {
    margin-bottom: 0;
  }

  p,
  li,
  blockquote {
    font-size: 1.0625rem;
  }

  p {
    line-height: 1.68;
    text-align: left;
    margin-bottom: var(--sizing-md);
  }

  hr {
    margin: var(--sizing-lg) 0;
    background: var(--color-gray-3);
  }

  blockquote {
    border-left: 0.25rem solid var(--color-gray-2);
    padding-left: var(--sizing-base);
    margin: var(--sizing-md) 0;
    * {
      color: var(--color-gray-6);
    }
  }

  img {
    display: block;
    margin-bottom: var(--sizing-base);
  }

  pre,
  code {
    font-family:
      SFMono-Regular,
      Consolas,
      Liberation Mono,
      Menlo,
      monospace;
    background-color: var(--color-code-block);
  }

  pre {
    border: 1px solid var(--color-gray-3);
  }

  pre.grvsc-container {
    margin: var(--sizing-md) 0;
  }

  .grvsc-line-highlighted::before {
    background-color: var(--color-code-highlight) !important;
    box-shadow: inset 4px 0 0 0 var(--color-code-highlight-border) !important;
  }

  *:not(pre) > code {
    background-color: var(--color-code);
    padding: 0.2rem 0.4rem;
    margin: 0;
    font-size: 85%;
    border-radius: 3px;
  }

  details {
    border: 1px solid var(--color-gray-2);
    border-radius: 4px;
    line-height: 2;
    margin: 1em 0;
  }

  details > span {
    display: block;
    padding: 0 32px;
  }

  summary {
    cursor: pointer;
    font-weight: bold;
    padding: 0 8px;
    background-color: var(--color-gray-1);
    border-radius: 4px;
    display: flex;
    align-items: center;
    focus: none;
  }

  summary::before {
    content: "▶";
    width: 16px;
    height: 16px;
    font-size: 12px;
    color: black;
    transition: transform 0.3s ease;
    display: inline-block;
    text-align: center;
    margin-right: 8px;
    lien-height: 16px;
  }

  details[open] summary {
    border-radius: 4px 4px 0 0;
  }

  details[open] summary::before {
    transform: rotate(90deg);
  }

  details summary::-webkit-details-marker {
    display: none;
  }

  button.details-toggle-button,
  button.interactive-list-toggle-all-button {
    position: absolute;
    top: calc(-3.4rem);
    height: 2rem;
    right: 0;
    display: flex;
    align-items: center;
    padding: 6px 12px;
    border: 1px solid var(--color-gray-2);
    border-radius: 4px;
    background-color: var(--color-gray-1);
    color: var(--color-gray-8);
    font-size: var(--font-size-sm);
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px var(--color-gray-2);

    &:hover {
      background-color: var(--color-gray-2);
    }
  }

  iframe.youtube {
    width: 100% !important;
    aspect-ratio: 16 / 9 !important;
    margin-bottom: var(--sizing-sm);
  }

  iframe {
    max-width: 100%;
  }

  div[data-pronunciation] {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  button.pronunciation-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--color-primary);
    padding: 0 var(--sizing-sm);
    vertical-align: middle;

    &:hover {
      opacity: 0.8;
    }

    svg {
      width: 16px;
      height: 16px;
    }
  }

  /* Interactive list (연습해보기) */
  [data-interactive-list] {
    position: relative;
    margin: 0;
    padding-left: 0;
    list-style-type: none;
  }

  [data-interactive-item] {
    background-color: var(--color-gray-1);
    border: 1px solid var(--color-gray-2);
    border-radius: 6px;
    margin-bottom: 10px;
    position: relative;
    overflow: hidden;

    &::before {
      content: none;
    }
  }

  [data-toggler] {
    cursor: pointer;
    font-weight: var(--font-weight-semi-bold);
    color: var(--color-gray-8);
    font-size: 1rem;
    padding: 12px 15px;
    background-color: transparent;
    transition: background-color 0.2s ease-in-out;
    display: flex;
    align-items: center;

    &::before {
      content: "▶";
      font-size: 0.8em;
      color: var(--color-gray-6);
      margin-right: 8px;
    }
  }

  [data-interactive-item][data-open="true"] [data-toggler]::before {
    content: "▼";
  }

  [data-answer] {
    display: none;
    padding: 12px 15px;
    margin-top: 0;
    background-color: var(--color-post-background);
    font-size: 0.95rem;
    line-height: 1.6;

    a {
      color: var(--color-primary);
      text-decoration: underline;
      font-weight: var(--font-weight-semi-bold);
    }
  }

  [data-interactive-item][data-open="true"] [data-answer] {
    display: block;
  }

  /* 인라인 배너 */
  .inline-banner {
    margin: var(--sizing-lg) 0;

    a {
      text-decoration: none !important;
      display: block;
      padding: var(--sizing-lg) var(--sizing-md);
      background: linear-gradient(
        135deg,
        var(--color-gray-1) 0%,
        var(--color-gray-2) 50%,
        var(--color-gray-1) 100%
      );
      border-radius: var(--border-radius-lg);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 2px solid rgba(28, 73, 255, 0.2);
      position: relative;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(28, 73, 255, 0.1);

      &::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(
          135deg,
          rgba(0, 125, 250, 0.05) 0%,
          rgba(28, 73, 255, 0.08) 50%,
          rgba(0, 125, 250, 0.05) 100%
        );
        opacity: 1;
        transition: opacity 0.3s ease;
        border-radius: inherit;
      }

      &::after {
        content: "";
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(
          135deg,
          rgba(28, 73, 255, 0.3),
          rgba(0, 125, 250, 0.3),
          rgba(28, 73, 255, 0.3)
        );
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover {
        background: linear-gradient(
          135deg,
          var(--color-gray-2) 0%,
          var(--color-gray-3) 50%,
          var(--color-gray-2) 100%
        );
        text-decoration: none;
        transform: translateY(-4px);
        box-shadow: 0 8px 25px rgba(28, 73, 255, 0.25);
        border-color: rgba(28, 73, 255, 0.6);

        &::before {
          opacity: 0.8;
          background: linear-gradient(
            135deg,
            rgba(0, 125, 250, 0.1) 0%,
            rgba(28, 73, 255, 0.15) 50%,
            rgba(0, 125, 250, 0.1) 100%
          );
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
      background: linear-gradient(
        135deg,
        var(--color-text) 0%,
        var(--speak-color) 70%,
        var(--color-text) 100%
      );
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
      background: linear-gradient(
        135deg,
        #f8fafc 0%,
        #e2e8f0 50%,
        #f1f5f9 100%
      );
      border: 2px solid rgba(28, 73, 255, 0.25);
      box-shadow: 0 4px 12px rgba(28, 73, 255, 0.15);

      &::before {
        background: linear-gradient(
          135deg,
          rgba(0, 125, 250, 0.06) 0%,
          rgba(28, 73, 255, 0.1) 50%,
          rgba(0, 125, 250, 0.06) 100%
        );
        opacity: 1;
      }

      &::after {
        background: linear-gradient(
          135deg,
          rgba(28, 73, 255, 0.4),
          rgba(0, 125, 250, 0.4),
          rgba(28, 73, 255, 0.4)
        );
      }

      &:hover {
        background: linear-gradient(
          135deg,
          #e2e8f0 0%,
          #cbd5e1 50%,
          #e2e8f0 100%
        );
        border-color: rgba(28, 73, 255, 0.7);
        box-shadow: 0 10px 30px rgba(28, 73, 255, 0.3);
      }
    }

    .inline-banner-title {
      font-size: 1.25rem;
      background: linear-gradient(
        135deg,
        var(--color-text) 0%,
        var(--speak-color) 60%,
        var(--color-text) 100%
      );
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
        background: linear-gradient(
          135deg,
          var(--color-gray-1) 0%,
          var(--color-gray-2) 50%,
          var(--color-gray-1) 100%
        );
        border-color: rgba(10, 132, 255, 0.3);
        box-shadow: 0 2px 8px rgba(10, 132, 255, 0.2);

        &::before {
          background: linear-gradient(
            135deg,
            rgba(10, 132, 255, 0.08) 0%,
            rgba(28, 73, 255, 0.12) 50%,
            rgba(10, 132, 255, 0.08) 100%
          );
        }

        &::after {
          background: linear-gradient(
            135deg,
            rgba(10, 132, 255, 0.4),
            rgba(28, 73, 255, 0.4),
            rgba(10, 132, 255, 0.4)
          );
        }

        &:hover {
          background: linear-gradient(
            135deg,
            var(--color-gray-2) 0%,
            var(--color-gray-3) 50%,
            var(--color-gray-2) 100%
          );
          box-shadow: 0 8px 25px rgba(10, 132, 255, 0.3);
          border-color: rgba(10, 132, 255, 0.7);
        }
      }

      .inline-banner-title {
        background: linear-gradient(
          135deg,
          var(--color-text) 0%,
          var(--color-blue) 70%,
          var(--color-text) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .inline-banner-arrow {
        filter: drop-shadow(0 1px 2px rgba(10, 132, 255, 0.4));
      }
    }

    .inline-banner-first-paragraph {
      a {
        background: linear-gradient(
          135deg,
          #1e293b 0%,
          #334155 50%,
          #1e293b 100%
        );
        border-color: rgba(10, 132, 255, 0.4);
        box-shadow: 0 4px 12px rgba(10, 132, 255, 0.25);

        &::before {
          background: linear-gradient(
            135deg,
            rgba(10, 132, 255, 0.08) 0%,
            rgba(28, 73, 255, 0.12) 50%,
            rgba(10, 132, 255, 0.08) 100%
          );
          opacity: 1;
        }

        &::after {
          background: linear-gradient(
            135deg,
            rgba(10, 132, 255, 0.5),
            rgba(28, 73, 255, 0.5),
            rgba(10, 132, 255, 0.5)
          );
        }

        &:hover {
          background: linear-gradient(
            135deg,
            #334155 0%,
            #475569 50%,
            #334155 100%
          );
          box-shadow: 0 10px 30px rgba(10, 132, 255, 0.4);
          border-color: rgba(10, 132, 255, 0.8);
        }
      }

      .inline-banner-title {
        background: linear-gradient(
          135deg,
          var(--color-text) 0%,
          var(--color-blue) 60%,
          var(--color-text) 100%
        );
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .inline-banner-caption {
        color: var(--color-blue);
      }
    }
  }
`

export default Markdown
