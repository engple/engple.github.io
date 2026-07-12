import React from "react"

import { Link } from "gatsby"
import styled from "styled-components"

import SEO from "~/src/components/seo"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import Layout from "~/src/layouts/layout"

const ABOUT_TITLE = "About"
const ABOUT_DESCRIPTION =
  "잉플은 한국어 사용자가 영어 표현과 패턴을 실제 예문으로 익힐 수 있도록 정리하는 영어 학습 사이트입니다."

const AboutPageTemplate = () => {
  const site = useSiteMetadata()
  const siteUrl = site.siteUrl || ""
  const pageUrl = `${siteUrl}/about/`
  const organizationId = `${siteUrl}/about/#organization`

  return (
    <Layout>
      <SEO
        title={ABOUT_TITLE}
        desc={ABOUT_DESCRIPTION}
        url={pageUrl}
        pageType="AboutPage"
        mainEntityId={organizationId}
      />
      <Main>
        <Content>
          <Header>
            <Eyebrow>About Engple</Eyebrow>
            <Title>잉플은 영어 표현을 예문 중심으로 정리합니다.</Title>
            <Lead>{ABOUT_DESCRIPTION}</Lead>
          </Header>

          <Section>
            <SectionTitle>잉플 소개</SectionTitle>
            <Paragraph>
              잉플은 일상에서 바로 써볼 수 있는 영어 표현을 한국어 설명과 함께
              모아두는 학습 공간입니다. 짧은 글 안에서 뜻, 쓰임, 예문을 빠르게
              확인할 수 있게 정리합니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>학습 방식</SectionTitle>
            <Paragraph>
              하나의 표현을 여러 예문으로 반복해서 보고, 연습 카드로 한 번 더
              떠올려볼 수 있도록 구성했습니다. 어색한 표현이나 잘못된 설명은
              발견하는 대로 고쳐갑니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>수정과 문의</SectionTitle>
            <Paragraph>
              영어 표현은 맥락과 지역에 따라 자연스러움이 달라질 수 있습니다.
              부정확한 번역, 어색한 예문, 깨진 링크를 발견하면 알려주세요.
            </Paragraph>
            <ActionLink to="/">최근 학습 글 보기</ActionLink>
          </Section>
        </Content>
      </Main>
    </Layout>
  )
}

const Main = styled.main`
  min-width: var(--min-width);
  min-height: calc(100vh - var(--nav-height) - var(--footer-height));
  background-color: var(--color-post-background);
`

const Content = styled.div`
  width: 87.5%;
  max-width: var(--post-width);
  margin: 0 auto;
  padding: var(--sizing-xl) 0 var(--sizing-xxl);
`

const Header = styled.header`
  margin-bottom: var(--sizing-xl);
`

const Eyebrow = styled.p`
  margin-bottom: 6px;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Title = styled.h1`
  margin-bottom: var(--sizing-md);
  font-size: 2.25rem;
  line-height: 1.25;
  font-weight: var(--font-weight-extra-bold);
  color: var(--color-text);

  &::after {
    content: "";
    display: block;
    width: 4.5rem;
    height: 4px;
    margin-top: 14px;
    border-radius: 999px;
    background: linear-gradient(
      90deg,
      var(--color-accent) 0%,
      var(--color-accent-soft) 100%
    );
    opacity: 0.75;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: var(--text-lg);
  }
`

const Lead = styled.p`
  font-size: var(--text-md);
  line-height: 1.8;
  color: var(--color-text-2);
`

const Section = styled.section`
  padding: var(--sizing-lg) 0;
  border-top: 1px solid var(--color-divider);
`

const SectionTitle = styled.h2`
  margin-bottom: var(--sizing-base);
  font-size: var(--text-title);
  line-height: 1.45;
  font-weight: var(--font-weight-bold);
`

const Paragraph = styled.p`
  margin-bottom: var(--sizing-base);
  font-size: var(--text-base);
  line-height: 1.9;
  color: var(--color-text-2);
`

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 18px;
  border: 1px solid var(--color-primary);
  border-radius: 999px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary-strong);
  font-size: 0.9375rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`

export default AboutPageTemplate
