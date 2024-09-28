import React, { useEffect, useState } from "react"

import { Link } from "gatsby"
import { styled } from "styled-components"

const TableOfContents = ({
  headings,
}: {
  headings: {
    id: string
    depth: number
    value: string
  }[]
}) => {
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
      const element = document.querySelector(`#${heading.id}`)

      if (element) {
        observer.observe(element)
      }
    }

    return () => {
      for (const heading of headings) {
        const element = document.querySelector(`#${heading.id}`)
        if (element) {
          observer.unobserve(element)
        }
      }
    }
  }, [headings])

  return (
    <TocNav>
      <ul>
        {headings.map(heading => (
          <li
            key={heading.id}
            style={{
              marginLeft: `${(heading.depth - 2) * 1.5}rem`,
              fontWeight: activeId === heading.id ? "bold" : "inherit",
            }}
          >
            <Link to={`#${heading.id}`}>{heading.value}</Link>
          </li>
        ))}
      </ul>
    </TocNav>
  )
}

const TocNav = styled.nav`
  position: sticky;
  top: 124px;
  margin-left: var(--padding-xl);
  padding: var(--padding-xs);
  border-radius: var(--border-radius-sm);
  width: fit-content;
  min-width: 20rem;
  height: fit-content;
  max-height: 70rem;
  line-height: 1.8;
  overflow: hidden auto;
  background-color: var(--color-gray-1);
  display: none;

  @media (min-width: 1440px) {
    display: block;
  }
`

export default TableOfContents
