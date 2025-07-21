import styled from "styled-components"

import type typography from "./typography"

const Markdown = styled.article<{ rhythm: (typeof typography)["rhythm"] }>`
  width: 100%;
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
      padding: var(--sizing-md);
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: var(--border-radius-md);
      transition: all 0.3s ease;
      border: 2px solid #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(59, 130, 246, 0.25);
        border-color: #2563eb;

        .inline-banner-button {
          transform: scale(1.05);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }
      }
    }

    .inline-banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sizing-md);
    }

    .inline-banner-text-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--sizing-sm);
      flex: 1;
    }

    .inline-banner-header {
      display: flex;
      align-items: center;
      gap: var(--sizing-sm);
    }

    .inline-banner-icon {
      font-size: 1.3rem;
      animation: sparkle 2s infinite ease-in-out;
    }

    .inline-banner-title {
      color: #1e293b;
      font-weight: var(--font-weight-bold);
      font-size: 1.3rem;
      line-height: 1.4;
    }

    .inline-banner-subtext {
      font-size: 1.05rem;
      color: #3b82f6;
      font-weight: 600;
      line-height: 1.4;
    }

    .inline-banner-cta {
      flex-shrink: 0;
    }

    .inline-banner-button {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      padding: 0.7rem 1.4rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1rem;
      white-space: nowrap;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
    }

    .inline-banner-caption {
      margin-top: var(--sizing-sm);
      padding: 0 var(--sizing-sm);
      font-size: 0.8rem;
      color: var(--color-gray-6);
      text-align: right;
    }

    @media (max-width: 768px) {
      .inline-banner-content {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--sizing-md);
      }

      .inline-banner-cta {
        align-self: flex-end;
      }

      .inline-banner-title {
        font-size: 1.2rem;
      }

      .inline-banner-subtext {
        font-size: 1rem;
      }

      .inline-banner-button {
        padding: 0.6rem 1.2rem;
        font-size: 0.95rem;
      }
    }
  }

  @keyframes sparkle {
    0%,
    100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.2) rotate(15deg);
      opacity: 0.7;
    }
  }

  body.dark {
    .inline-banner {
      a {
        background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
        border-color: #3b82f6;
      }

      .inline-banner-title {
        color: white;
      }

      .inline-banner-subtext {
        color: #60a5fa;
      }
    }

    .inline-banner-caption {
      color: var(--color-gray-5);
    }
  }

  .inline-adsense {
    width: 100%;
    margin-bottom: var(--sizing-md);
  }
`

export default Markdown
