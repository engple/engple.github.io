import React, { useContext, useRef, useState } from "react"

import { Link } from "gatsby"
import styled, { ThemeContext } from "styled-components"

import Background from "~/src/styles/background"
import {
  curtainAnimationCSS,
  navBackgroundAnimationCSS,
} from "~/src/styles/navBarAnimation"

import SearchBar from "./searchBar"
import SearchIcon from "./searchIcon"
import useMenu, { type UseMenuReturnType } from "./useMenu"

interface NavBarProperties {
  title?: string | null
}

const NavBar: React.FC<NavBarProperties> = ({ title }) => {
  const { device } = useContext(ThemeContext)!
  const navReference = useRef<HTMLElement>(null)
  const curtainReference = useRef<HTMLDivElement>(null)
  const listReference = useRef<HTMLUListElement>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const { toggle, setToggle } = useMenu({
    navRef: navReference,
    curtainRef: curtainReference,
    listRef: listReference,
    device,
  })

  return (
    <Nav ref={navReference} aria-label="Global Navigation">
      <NavBackground toggle={toggle} />
      <Content>
        <Title onClick={() => setToggle(false)}>
          <Link to="/">{title}</Link>
        </Title>
        <Curtain ref={curtainReference} toggle={toggle} />
        <IconWrapper>
          <SearchIcon onClick={() => setIsSearchOpen(true)} />
        </IconWrapper>
      </Content>
      {isSearchOpen && (
        <SearchBar
          onClickOutside={() => setIsSearchOpen(false)}
          onEscape={() => setIsSearchOpen(false)}
          onSearch={() => setIsSearchOpen(false)}
        />
      )}
    </Nav>
  )
}

type Toggleable = Pick<UseMenuReturnType, "toggle">

const Nav = styled.nav`
  min-width: var(--min-width);
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--nav-height);
  z-index: 10;

  a:hover {
    text-decoration: none;
  }
`

const Content = styled.div`
  box-sizing: content-box;
  position: relative;
  margin: 0 auto;
  max-width: var(--max-width);
  padding: 0 var(--padding-lg);
  height: 100%;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;

  li {
    margin: 0;
    list-style-type: none;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: 0 var(--padding-sm);
  }
`

const Title = styled.div`
  z-index: 9999;
  padding: 0;
  border: none;
  font-size: var(--text-title);
  font-weight: var(--font-weight-semi-bold);
  color: var(--color-text);

  a {
    color: inherit;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: var(--text-md);
  }
`

const NavBackground = styled(Background)<Toggleable>`
  @media (max-width: ${({ theme }) => theme.device.sm}) {
    &::after {
      ${({ toggle }) => navBackgroundAnimationCSS(toggle)};
      content: "";
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--color-post-background);
    }
  }
`

const Curtain = styled.div<Toggleable>`
  display: none;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    ${({ toggle }) => curtainAnimationCSS(toggle)}
    display: block;
    position: fixed;
    top: calc(var(--nav-height) - 1px);
    left: 0;
    width: 100%;
    height: calc(100% - var(--nav-height) + 1px);
    background-color: var(--color-post-background);
  }
`

const IconWrapper = styled.div`
  display: flex;
`

export default NavBar
