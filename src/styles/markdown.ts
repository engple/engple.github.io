import styled, { css } from "styled-components"

import type typography from "./typography"

const Markdown = styled.article<{
  rhythm: (typeof typography)["rhythm"]
  $hideLeadVisualOnDesktop?: boolean
}>`
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

    > a.anchor {
      color: inherit;
      text-decoration: none;
      font-weight: inherit;
      background: none;
      background-image: none;
      box-shadow: none;
      transition: opacity 0.2s ease;

      &:hover,
      &:active {
        color: inherit;
        text-decoration: none;
        background: none;
        background-image: none;
      }
    }
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
    color: inherit;
    text-decoration: underline;
    text-decoration-thickness: 0.08em;
    text-underline-offset: 0.18em;
    font-weight: var(--font-weight-semi-bold);
    transition:
      color 0.2s ease,
      background-size 0.2s ease;
    background-image: linear-gradient(
      var(--color-inline-link-highlight),
      var(--color-inline-link-highlight)
    );
    background-position: 0 100%;
    background-repeat: no-repeat;
    background-size: 100% var(--size-inline-link-highlight);

    &:hover,
    &:active {
      color: inherit;
      text-decoration: underline;
      background-image: linear-gradient(
        var(--color-inline-link-highlight-hover),
        var(--color-inline-link-highlight-hover)
      );
      background-size: 100% var(--size-inline-link-highlight-hover);
    }
  }

  & > *:first-child {
    margin-top: 0;
  }

  ${({ $hideLeadVisualOnDesktop, theme }) =>
    $hideLeadVisualOnDesktop &&
    css`
      @media (min-width: ${theme.device.lg}) {
        > p:first-of-type {
          display: none;
        }

        > p:first-of-type + * {
          margin-top: 0;
        }
      }
    `}

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
    color: var(--color-text-2);
    font-size: var(--text-sm);
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
    counter-reset: interactive-item;
  }

  [data-interactive-item] {
    background-color: rgba(255, 255, 255, 0.94);
    border: 1px solid rgba(15, 23, 42, 0.08);
    border-radius: 14px;
    margin-bottom: 12px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background-color 0.2s ease,
      transform 0.2s ease;
    counter-increment: interactive-item;

    &::before {
      content: none;
    }

    &:hover {
      border-color: rgba(15, 23, 42, 0.12);
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
      transform: translateY(-1px);
    }
  }

  [data-interactive-item][data-open="true"] {
    border-color: rgba(15, 23, 42, 0.12);
    background-color: rgba(251, 250, 247, 0.98);
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
  }

  [data-toggler] {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    font-weight: var(--font-weight-semi-bold);
    color: var(--color-text-2);
    font-size: 0.9875rem;
    line-height: 1.65;
    padding: 2.25rem 2.75rem 1rem 1rem;
    background-color: transparent;
    transition: color 0.2s ease-in-out;
    display: block;
    position: relative;

    &::before {
      content: counter(interactive-item, decimal-leading-zero);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0.75rem;
      left: 1rem;
      min-width: 2rem;
      height: 1.5rem;
      padding: 0 0.5rem;
      border-radius: 999px;
      background-color: rgba(15, 23, 42, 0.05);
      color: var(--color-text-3);
      font-size: 0.6875rem;
      font-weight: var(--font-weight-bold);
      letter-spacing: 0.08em;
    }

    &::after {
      content: "";
      position: absolute;
      top: 50%;
      right: 1.125rem;
      width: 10px;
      height: 10px;
      border-right: 1.5px solid var(--color-text-3);
      border-bottom: 1.5px solid var(--color-text-3);
      transform: translateY(-60%) rotate(45deg);
      transition: transform 0.2s ease;
    }
  }

  [data-interactive-item][data-open="true"] [data-toggler] {
    color: var(--color-text);
  }

  [data-interactive-item][data-open="true"] [data-toggler]::before {
    background-color: rgba(15, 23, 42, 0.08);
    color: var(--color-text-2);
  }

  [data-interactive-item][data-open="true"] [data-toggler]::after {
    transform: translateY(-35%) rotate(-135deg);
  }

  [data-answer] {
    display: none;
    margin: 0 1rem 1rem;
    padding: 0.875rem 1rem;
    border: 1px solid rgba(15, 23, 42, 0.05);
    border-radius: 10px;
    background-color: rgba(255, 255, 255, 0.78);
    color: var(--color-text-2);
    font-size: 0.9375rem;
    line-height: 1.72;

    a {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: rgba(15, 23, 42, 0.24);
      font-weight: var(--font-weight-semi-bold);
    }
  }

  [data-interactive-item][data-open="true"] [data-answer] {
    display: block;
  }

  body.dark & {
    button.interactive-list-toggle-all-button {
      border-color: rgba(255, 255, 255, 0.12);
      background-color: var(--color-gray-2);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.28);

      &:hover {
        background-color: var(--color-gray-3);
      }
    }

    [data-interactive-item] {
      background-color: rgba(44, 44, 44, 0.96);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);

      &:hover {
        border-color: rgba(255, 255, 255, 0.18);
        box-shadow: 0 16px 34px rgba(0, 0, 0, 0.32);
      }
    }

    [data-interactive-item][data-open="true"] {
      background-color: rgba(34, 34, 34, 0.98);
      border-color: rgba(255, 255, 255, 0.16);
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.34);
    }

    [data-toggler]::before {
      background-color: rgba(255, 255, 255, 0.08);
      color: var(--color-text-3);
    }

    [data-interactive-item][data-open="true"] [data-toggler]::before {
      background-color: rgba(255, 255, 255, 0.12);
      color: var(--color-text-2);
    }

    [data-answer] {
      border-color: rgba(255, 255, 255, 0.08);
      background-color: rgba(255, 255, 255, 0.06);
      color: var(--color-text-2);

      a {
        color: inherit;
        text-decoration-color: rgba(255, 255, 255, 0.32);
      }
    }
  }

  @media (hover: none) and (pointer: coarse) {
    [data-interactive-item] {
      border-color: rgba(15, 23, 42, 0.1);
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.055);
    }

    [data-interactive-item][data-open="true"] {
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08);
    }

    [data-interactive-item]:active {
      transform: translateY(1px);
      box-shadow: 0 5px 12px rgba(15, 23, 42, 0.045);
    }

    [data-interactive-item]:active [data-toggler]::before {
      background-color: rgba(15, 23, 42, 0.08);
    }

    body.dark & [data-interactive-item]:active [data-toggler]::before {
      background-color: rgba(255, 255, 255, 0.12);
    }
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    [data-interactive-item] {
      border-radius: 12px;
      margin-bottom: 12px;
    }

    [data-toggler] {
      padding: 2.125rem 2.5rem 0.9375rem 0.9375rem;

      &::before {
        top: 0.6875rem;
        left: 0.9375rem;
        min-width: 1.875rem;
        height: 1.375rem;
        padding: 0 0.4375rem;
      }

      &::after {
        right: 1rem;
      }
    }

    [data-answer] {
      margin: 0 0.9375rem 0.9375rem;
      padding: 0.8125rem 0.875rem;
    }
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

  .inline-adsense__dev-placeholder {
    width: 100%;
    min-height: 90px;
    background-color: var(--color-gray-3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-gray-6);
    border-radius: 4px;
  }
`

export default Markdown
