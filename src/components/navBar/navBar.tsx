import React, { useContext, useRef, useState } from "react"

import { Link, navigate } from "gatsby"
import styled, { ThemeContext } from "styled-components"

import type { UseSiteMetaDataReturnType } from "~/src/hooks/useSiteMetadata"
import Background from "~/src/styles/background"
import {
  curtainAnimationCSS,
  navBackgroundAnimationCSS,
} from "~/src/styles/navBarAnimation"

import LinkList from "./linkList"
import MenuIcon from "./menuIcon"
import SearchBar from "./searchBar"
import SearchIcon from "./searchIcon"
import useMenu, { type UseMenuReturnType } from "./useMenu"

const MENU_LIST_ID = "global-navigation-menu"

interface NavBarProperties {
  links: UseSiteMetaDataReturnType["menuLinks"]
  title?: string | null
}

const NavBar: React.FC<NavBarProperties> = ({ links, title }) => {
  const brandName = title?.split("|")[0]?.trim() || title
  const { device } = useContext(ThemeContext)!
  const navReference = useRef<HTMLElement>(null)
  const curtainReference = useRef<HTMLDivElement>(null)
  const listReference = useRef<HTMLUListElement>(null)
  const searchTriggerReference = useRef<HTMLButtonElement>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const { handleClick, toggle, setToggle } = useMenu({
    navRef: navReference,
    curtainRef: curtainReference,
    listRef: listReference,
    device,
  })

  const handleSearch = (searchTerm: string) => {
    setIsSearchOpen(false)
    void navigate(`/search/?q=${encodeURIComponent(searchTerm)}`)
  }

  const handleOpenSearch = () => {
    setIsSearchOpen(true)
  }

  const handleCloseSearch = () => {
    setIsSearchOpen(false)
    window.requestAnimationFrame(() => {
      searchTriggerReference.current?.focus()
    })
  }

  return (
    <Nav ref={navReference} aria-label="Global Navigation">
      <NavBackground toggle={toggle} />
      <Content>
        <Title onClick={() => setToggle(false)}>
          <Link to="/" aria-label={title ?? undefined}>
            {brandName}
            <BrandDot aria-hidden="true">.</BrandDot>
          </Link>
        </Title>
        <List id={MENU_LIST_ID} ref={listReference} toggle={toggle}>
          <LinkList links={links} setToggle={setToggle} />
        </List>
        <Curtain ref={curtainReference} toggle={toggle} />
        <IconWrapper>
          <MenuIcon
            controlsId={MENU_LIST_ID}
            handleClick={handleClick}
            toggle={toggle}
          />
          <SearchIcon
            buttonRef={searchTriggerReference}
            onClick={handleOpenSearch}
          />
        </IconWrapper>
      </Content>
      {isSearchOpen && (
        <SearchBar
          onClickOutside={handleCloseSearch}
          onEscape={handleCloseSearch}
          onSearch={handleSearch}
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
  font-family: var(--font-display);
  font-size: var(--text-title);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);

  a {
    color: inherit;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    font-size: var(--text-md);
  }
`

const BrandDot = styled.span`
  color: var(--color-accent);
`

const List = styled.ul<Toggleable>`
  display: flex;
  gap: var(--sizing-md);
  align-items: center;
  margin-left: auto;
  margin-right: var(--sizing-base);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);

  a {
    color: var(--color-text-3);
    transition: color 0.2s ease;
  }

  a:hover {
    color: var(--color-text);
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    position: fixed;
    top: var(--nav-height);
    left: 0;
    z-index: 9998;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    height: calc(100vh - var(--nav-height));
    box-sizing: border-box;
    padding: var(--sizing-lg) var(--padding-lg);
    margin: 0;
    gap: var(--sizing-md);
    background-color: var(--color-post-background);
    opacity: ${({ toggle }) => (toggle ? 1 : 0)};
    pointer-events: ${({ toggle }) => (toggle ? "auto" : "none")};
    transform: translateY(${({ toggle }) => (toggle ? "0" : "-8px")});
    transition:
      opacity 0.2s ease,
      transform 0.2s ease;

    a {
      display: block;
      font-size: var(--text-lg);
      color: var(--color-text);
    }
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
