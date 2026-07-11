import React from "react"

import { Link } from "gatsby"
import styled from "styled-components"

import SEO from "~/src/components/seo"
import Layout from "~/src/layouts/layout"

const NotFound = () => {
  return (
    <Layout>
      <SEO title="페이지를 찾을 수 없어요" noIndex />
      <Main>
        <Eyebrow>404 — Page Not Found</Eyebrow>
        <Title>이 페이지는 사전에 없는 표현이네요</Title>
        <Desc>
          주소가 바뀌었거나 삭제된 페이지예요. 아래에서 학습을 이어가 보세요.
        </Desc>
        <Actions>
          <PrimaryAction to="/">홈으로 가기</PrimaryAction>
          <SecondaryAction to="/search/">표현 검색하기</SecondaryAction>
        </Actions>
      </Main>
    </Layout>
  )
}

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--nav-height) - var(--footer-height));
  padding: var(--sizing-xl) var(--padding-lg);
  text-align: center;
`

const Eyebrow = styled.p`
  margin-bottom: 10px;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.3;

  &::after {
    content: "";
    display: block;
    width: 4.5rem;
    height: 4px;
    margin: 16px auto 0;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--color-accent) 0%,
      var(--color-accent-soft) 100%
    );
    opacity: 0.75;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: 1.75rem;
  }
`

const Desc = styled.p`
  margin-top: var(--sizing-base);
  max-width: 26rem;
  color: var(--color-text-3);
  font-size: 1rem;
  line-height: 1.6;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: var(--sizing-md);
`

const ActionBase = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 18px;
  border-radius: 999px;
  font-size: 0.9375rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`

const PrimaryAction = styled(ActionBase)`
  border: 1px solid var(--color-primary);
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
`

const SecondaryAction = styled(ActionBase)`
  border: 1px solid var(--color-gray-2);
  background-color: var(--color-card);
  color: var(--color-text-2);

  &:hover {
    border-color: var(--color-gray-3);
    color: var(--color-text);
  }
`

export default NotFound
