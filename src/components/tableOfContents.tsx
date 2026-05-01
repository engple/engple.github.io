import React, { useEffect, useState } from "react"

import { Link } from "gatsby"
import { styled } from "styled-components"

interface TableOfContentsProps {
  headings: {
    id: string
    depth: number
    value: string
  }[]
}

const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState("")

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: "0% 0% -80% 0%" },
    )

    for (const heading of headings) {
      const element = document.querySelector(`#${CSS.escape(heading.id)}`)

      if (element) {
        observer.observe(element)
      }
    }

    return () => {
      for (const heading of headings) {
        const element = document.querySelector(`#${CSS.escape(heading.id)}`)

        if (element) {
          observer.unobserve(element)
        }
      }
    }
  }, [headings])

  return (
    <TocNav aria-label="이 글의 목차">
      <Header>
        <Eyebrow>On This Page</Eyebrow>
        <Title>이 글에서 바로 보기</Title>
      </Header>
      <List>
        {headings.map(heading => (
          <Item
            key={heading.id}
            $depth={heading.depth}
            $isActive={activeId === heading.id}
          >
            <StyledLink to={`#${heading.id}`}>{heading.value}</StyledLink>
          </Item>
        ))}
      </List>
    </TocNav>
  )
}

const TocNav = styled.nav`
  width: 100%;
  max-height: min(23rem, calc(100vh - 420px));
  padding: 12px;
  border: 1px solid var(--color-gray-2);
  border-radius: var(--border-radius-md);
  background: linear-gradient(
    180deg,
    var(--color-card) 0%,
    var(--color-gray-1) 100%
  );
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  overflow: hidden auto;
  display: none;

  @media (min-width: ${({ theme }) => theme.device.lg}) {
    display: block;
  }
`

const Header = styled.div`
  padding-bottom: 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--color-gray-2);
`

const Eyebrow = styled.p`
  margin-bottom: 4px;
  color: var(--color-text-3);
  font-size: 0.6875rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
`

const Title = styled.h2`
  font-size: 0.9375rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.4;
`

const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
`

const Item = styled.li<{ $depth: number; $isActive: boolean }>`
  margin-left: ${({ $depth }) => `${Math.max($depth - 2, 0) * 0.65}rem`};

  a {
    color: ${({ $isActive }) =>
      $isActive ? "var(--color-text)" : "var(--color-text-2)"};
    background-color: ${({ $isActive }) =>
      $isActive ? "var(--color-post-background)" : "transparent"};
    border-color: ${({ $isActive }) =>
      $isActive ? "var(--color-gray-2)" : "transparent"};
    box-shadow: ${({ $isActive }) =>
      $isActive ? "0 6px 18px rgba(15, 23, 42, 0.08)" : "none"};
    font-weight: ${({ $isActive }) =>
      $isActive ? "var(--font-weight-semi-bold)" : "var(--font-weight-medium)"};
  }
`

const StyledLink = styled(Link)`
  display: block;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-size: 0.875rem;
  line-height: 1.45;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: var(--color-text);
    background-color: var(--color-post-background);
    border-color: var(--color-gray-2);
    transform: translateX(2px);
  }
`

export default TableOfContents
