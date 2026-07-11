import React from "react"

import styled from "styled-components"

import Category from "~/src/styles/category"
import DateTime from "~/src/styles/dateTime"
import type Post from "~/src/types/Post"

import CenteredImg from "./centeredImg"

type CardProperties = Pick<
  Post,
  "thumbnail" | "alt" | "category" | "title" | "desc" | "date"
>

const Card: React.FC<CardProperties> = ({
  thumbnail,
  alt,
  category,
  title,
  desc,
  date,
}) => {
  return (
    <Wrapper>
      <CenteredImg src={thumbnail} alt={alt} />
      <Text>
        <div>
          <Category>{category}</Category>
          <Title>{title}</Title>
          <Desc>{desc}</Desc>
        </div>
        <DateTime dateTime={date!}>{date}</DateTime>
      </Text>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  border: 1px solid var(--color-gray-2);
  border-radius: var(--border-radius-md);
  background-color: var(--color-card);
  box-shadow: var(--shadow-sm);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  /* Fix Safari overflow:hidden with border radius not working error */
  transform: translateZ(0);

  &:hover {
    transform: translateZ(0) translateY(-2px);
    border-color: var(--color-gray-3);
    box-shadow: var(--shadow-md);
  }
`

const Text = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  justify-content: space-between;
  padding: var(--sizing-md);

  & > * {
    display: block;
  }
`

const Title = styled.h3`
  margin-top: var(--sizing-xs);
  font-size: var(--text-md);
  font-weight: var(--font-weight-bold);
  line-height: 1.3;

  @media (max-width: ${({ theme }) => theme.device.md}) {
    font-size: var(--text-base);
  }
`

const Desc = styled.p`
  line-height: 1.5;
  margin-top: var(--sizing-sm);
  margin-bottom: var(--sizing-sm);
  color: var(--color-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
`

export default React.memo(Card)
