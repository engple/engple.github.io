import React from "react"

import styled from "styled-components"

import Category from "~/src/styles/category"
import DateTime from "~/src/styles/dateTime"
import type Post from "~/src/types/Post"

import CenteredImg from "./centeredImg"

type CardProperties = Pick<
  Post,
  "thumbnail" | "alt" | "category" | "title" | "desc" | "date"
> & {
  featured?: boolean
}

const Card: React.FC<CardProperties> = ({
  thumbnail,
  alt,
  category,
  title,
  desc,
  date,
  featured = false,
}) => {
  return (
    <Wrapper $featured={featured}>
      <CenteredImg src={thumbnail} alt={alt} featured={featured} />
      <Text>
        <Header>
          <Category>{category}</Category>
          <Title $featured={featured}>{title}</Title>
          <Desc $featured={featured}>{desc}</Desc>
        </Header>
        <Footer>
          <DateTime dateTime={date!}>{date}</DateTime>
          <ReadMore>자세히 보기</ReadMore>
        </Footer>
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div<{ $featured: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  border: 1px solid var(--color-card-border);
  border-radius: var(--border-radius-md);
  background-color: var(--color-card);
  box-shadow: 0 24px 60px -42px var(--color-card-shadow);

  /* Fix Safari overflow:hidden with border radius not working error */
  transform: translateZ(0);

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      transparent 0%,
      transparent 52%,
      var(--color-accent-soft) 100%
    );
    opacity: ${({ $featured }) => ($featured ? 1 : 0.45)};
  }
`

const Text = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  justify-content: space-between;
  gap: var(--sizing-md);
  padding: 22px;
  position: relative;
  z-index: 1;

  & > * {
    display: block;
  }
`

const Header = styled.div`
  display: grid;
  gap: 12px;
`

const Title = styled.h3<{ $featured: boolean }>`
  margin-top: 0;
  font-size: ${({ $featured }) =>
    $featured ? "clamp(1.6rem, 2vw, 2rem)" : "var(--text-md)"};
  font-weight: var(--font-weight-bold);
  line-height: 1.22;

  @media (max-width: ${({ theme }) => theme.device.md}) {
    font-size: ${({ $featured }) =>
      $featured ? "1.5rem" : "var(--text-base)"};
  }
`

const Desc = styled.p<{ $featured: boolean }>`
  line-height: 1.5;
  color: var(--color-text-2);
  display: -webkit-box;
  -webkit-line-clamp: ${({ $featured }) => ($featured ? 3 : 2)};
  -webkit-box-orient: vertical;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sizing-sm);
`

const ReadMore = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-blue);

  &::after {
    content: "→";
    color: inherit;
  }
`

export default React.memo(Card)
