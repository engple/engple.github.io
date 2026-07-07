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
            <SectionTitle>운영 주체</SectionTitle>
            <Paragraph>
              잉플은 solaqua가 운영하는 개인 영어 학습 프로젝트입니다. 사이트의
              목표는 한국어 사용자가 영어 표현을 검색하고, 문맥 안에서 이해하고,
              직접 말해볼 수 있도록 짧고 반복 가능한 학습 자료를 제공하는
              것입니다.
            </Paragraph>
            <Paragraph>
              개발과 콘텐츠 관리 이력은{" "}
              <ExternalLink href="https://github.com/engple" rel="noreferrer">
                GitHub의 Engple 조직
              </ExternalLink>
              에서 확인할 수 있습니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>콘텐츠 제작 방식</SectionTitle>
            <Paragraph>
              각 글은 하나의 영어 표현, 패턴, 어휘, 또는 주제를 중심으로
              구성됩니다. 한국어 설명, 영어 예문, 발음 정보, 연습 카드, 관련
              표현을 함께 배치해 학습자가 같은 표현을 여러 상황에서 확인할 수
              있게 합니다.
            </Paragraph>
            <Paragraph>
              일부 초안 작성과 예문 후보 수집에는 자동화 도구를 사용합니다. 게시
              전에는 표현의 자연스러움, 한국어 설명의 정확성, 내부 링크, 중복
              여부를 점검하며, 발견한 오류는 이후 수정합니다.
            </Paragraph>
          </Section>

          <Section>
            <SectionTitle>수정과 문의</SectionTitle>
            <Paragraph>
              영어 표현은 맥락과 지역에 따라 자연스러움이 달라질 수 있습니다.
              부정확한 번역, 어색한 예문, 깨진 링크, 저작권 또는 기타 문의가
              있으면{" "}
              <ExternalLink
                href="https://github.com/engple/engple.github.io/issues"
                rel="noreferrer"
              >
                GitHub Issues
              </ExternalLink>
              를 통해 알려주세요.
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
  margin-bottom: var(--sizing-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-blue);
`

const Title = styled.h1`
  margin-bottom: var(--sizing-md);
  font-size: 2.25rem;
  line-height: 1.25;
  font-weight: var(--font-weight-extra-bold);
  color: var(--color-text);

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

const ExternalLink = styled.a`
  color: var(--color-blue);
  text-decoration: underline;
  text-underline-offset: 0.2em;
`

const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--padding-sm);
  border: 1px solid var(--color-divider);
  border-radius: var(--border-radius-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
`

export default AboutPageTemplate
