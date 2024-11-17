import React from "react"

import styled, { ThemeProvider } from "styled-components"

import NavBar from "~/src/components/navBar/navBar"
import useSiteMetadata from "~/src/hooks/useSiteMetadata"
import useTheme from "~/src/hooks/useTheme"
import ThemeContext from "~/src/stores/themeContext"
import GlobalStyle from "~/src/styles/globalStyle"
import styledTheme from "~/src/styles/styledTheme"

import ThemeToggleButton from "../components/navBar/themeToggleButton"

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { theme, themeToggler } = useTheme()
  const { title } = useSiteMetadata()
  const copyrightString = `Copyright © engple 2024`

  return (
    <ThemeProvider theme={styledTheme}>
      <ThemeContext.Provider value={theme}>
        <GlobalStyle />
        <Container>
          <NavBar title={title} />
          {children}
        </Container>
        <Footer role="contentinfo">
          <Copyright aria-label="Copyright">{copyrightString}</Copyright>
        </Footer>
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
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  height: var(--footer-height);
  background-color: var(--color-gray-1);
  margin-top: var(--sizing-xl);
`

const Copyright = styled.span`
  font-size: var(--text-sm);
  font-weight: var(--font-weight-regular);
  color: var(--color-gray-6);
`

export default Layout
