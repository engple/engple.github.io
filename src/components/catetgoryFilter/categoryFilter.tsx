import React, { useMemo, useRef } from "react"

import { type GatsbyLinkProps, Link } from "gatsby"
import kebabCase from "lodash/kebabCase"
import styled from "styled-components"

import useScrollCenter from "./useScrollCenter"

const ACTIVE = "active"
const ALL_CATEGORY_NAME = "All"

interface CategoryFilterProperties {
  categoryList: readonly Queries.MarkdownRemarkGroupConnection[]
}

type LinkPropertiesGetter = GatsbyLinkProps<unknown>["getProps"]

const CategoryFilter: React.FC<CategoryFilterProperties> = ({
  categoryList,
}) => {
  const categoryReference = useRef<HTMLUListElement>(null)
  const isActive: LinkPropertiesGetter = ({ isCurrent }) =>
    isCurrent ? { id: ACTIVE, tabIndex: -1 } : {}
  const totalPostCount = useMemo(() => {
    return categoryList.reduce(
      (count, category) => count + category.totalCount,
      0,
    )
  }, [categoryList])

  useScrollCenter({ ref: categoryReference, targetId: ACTIVE })

  const sortedCategoryList = useMemo(
    () => [...categoryList].sort((a, b) => b.totalCount - a.totalCount),
    [categoryList],
  )

  return (
    <Nav aria-label="Category Filter">
      <CategoryTitle>Browse Categories</CategoryTitle>
      <CategoryUl ref={categoryReference} className="invisible-scrollbar">
        <li>
          <CategoryButton getProps={isActive} to="/">
            <span>{ALL_CATEGORY_NAME}</span>
            <CategoryCount>{totalPostCount}</CategoryCount>
          </CategoryButton>
        </li>
        {sortedCategoryList.map(category => {
          const { fieldValue, totalCount } = category
          return (
            <li key={fieldValue}>
              <CategoryButton
                getProps={isActive}
                to={`/category/${kebabCase(fieldValue!)}/`}
              >
                <span>{fieldValue}</span>
                <CategoryCount>{totalCount}</CategoryCount>
              </CategoryButton>
            </li>
          )
        })}
      </CategoryUl>
    </Nav>
  )
}

const Nav = styled.nav`
  display: grid;
  gap: var(--sizing-sm);
  background-color: var(--color-card);
  margin-bottom: 40px;
  padding: var(--sizing-base);
  border: 1px solid var(--color-card-border);
  border-radius: var(--border-radius-md);
  box-shadow: 0 18px 50px -40px var(--color-card-shadow);

  a#active {
    color: var(--color-white);
    background-color: var(--color-blue);
    border-color: transparent;
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    margin-bottom: 28px;
    padding: 14px;
  }
`

const CategoryTitle = styled.em`
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semi-bold);
  font-style: normal;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-3);
`

const CategoryButton = styled(Link)`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background-color: var(--color-category-button);
  padding: 12px 16px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: var(--font-weight-semi-bold);
  white-space: nowrap;

  :focus {
    outline: none;
  }

  &:hover {
    color: var(--color-white);
    background-color: var(--color-blue);
  }

  &:focus-visible {
    color: var(--color-white);
    background-color: var(--color-blue);
  }
`

const CategoryCount = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border-radius: 999px;
  color: inherit;
  background-color: rgba(255, 255, 255, 0.18);
`

const CategoryUl = styled.ul`
  display: flex;
  list-style: none;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;

  li + li {
    margin-left: 8px;
  }
`

export default CategoryFilter
