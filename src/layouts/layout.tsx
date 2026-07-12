import React from "react"

import styled, { ThemeProvider } from "styled-components"

import NavBar from "~/src/components/navBar/navBar"
import InstallPrompt from "~/src/components/retention/InstallPrompt"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import useTheme from "~/src/hooks/useTheme"
import ThemeContext from "~/src/stores/themeContext"
import GlobalStyle from "~/src/styles/globalStyle"
import styledTheme from "~/src/styles/styledTheme"

import ThemeToggleButton from "../components/navBar/themeToggleButton"

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme, themeToggler } = useTheme()
  const { menuLinks, title } = useSiteMetadata()
  const copyrightString = `Copyright © ${new Date().getFullYear()} 잉플 (Engple)`

  return (
    <ThemeProvider theme={styledTheme}>
      <ThemeContext.Provider value={theme}>
        <GlobalStyle />
        <Container>
          <NavBar links={menuLinks} title={title} />
          {children}
        </Container>
        <Footer role="contentinfo">
          <FooterInner>
            <FooterBrand>
              잉플<FooterBrandDot aria-hidden="true">.</FooterBrandDot>
            </FooterBrand>
            <FooterTagline>패턴으로 배우는 영어 공부</FooterTagline>
            <FooterLinks>
              <FooterLink href="/rss.xml" type="application/rss+xml">
                RSS 구독
              </FooterLink>
            </FooterLinks>
            <Copyright aria-label="Copyright">{copyrightString}</Copyright>
          </FooterInner>
        </Footer>
        <InstallPrompt />
        <ThemeToggleButton onClick={themeToggler} />
      </ThemeContext.Provider>
    </ThemeProvider>
  )
}

const Container = styled.div`
  width: 100%;
  height: 100%;
  min-height: calc(100vh - var(--footer-height));
  background-color: var(--color-post-background);
`

const Footer = styled.footer`
  border-top: 1px solid var(--color-divider);
  background-color: var(--color-gray-1);

  margin-top: var(--sizing-xxl);
  @media (min-width: ${({ theme }) => theme.device.sm}) {
    margin-top: var(--sizing-xl);
  }
`

const FooterInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--sizing-lg) var(--padding-lg);
  text-align: center;
`

const FooterBrand = styled.p`
  font-family: var(--font-display);
  font-size: var(--text-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
`

const FooterBrandDot = styled.span`
  color: var(--color-accent);
`

const FooterTagline = styled.p`
  font-size: var(--text-sm);
  color: var(--color-text-3);
`

const FooterLinks = styled.div`
  display: flex;
  gap: 14px;
  margin-top: 2px;
`

const FooterLink = styled.a`
  color: var(--color-text-3);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: underline;
  text-underline-offset: 0.2em;
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-text);
  }
`

const Copyright = styled.span`
  margin-top: 8px;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-6);
`

export default Layout
