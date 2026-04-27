import React, { useEffect, useId, useMemo, useRef, useState } from "react"

import { graphql, useStaticQuery } from "gatsby"
import { useHotkeys } from "react-hotkeys-hook"
import { useGatsbyPluginFusejs } from "react-use-fusejs"
import styled from "styled-components"

import {
  collectSearchSuggestionLabels,
  matchesSearchRecord,
  normalizeSearchTerm,
} from "../../utils/search"
import CloseIcon from "../icons/CloseIcon"

interface SearchBarProps {
  onClickOutside?: () => void
  onEscape?: () => void
  onSearch?: (searchTerm: string) => void
}

interface SearchBarQueryData {
  fusejs: {
    index: string
    data: SearchSuggestionItem[]
  } | null
  allMarkdownRemark: {
    edges: {
      node: {
        id: string
        frontmatter?: {
          title?: string | null
          category?: string | null
        } | null
      }
    }[]
  }
}

interface SearchSuggestionItem {
  id: string
  title: string
  desc?: string
  category?: string
  body: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onClickOutside = () => {},
  onEscape = () => {},
  onSearch = () => {},
}) => {
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const resultListId = useId()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeIndex, setActiveIndex] = useState<number | undefined>()
  const [errorMessage, setErrorMessage] = useState("")
  const data = useStaticQuery<SearchBarQueryData>(graphql`
    query SearchBar {
      fusejs {
        index
        data
      }
      allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
        sort: { frontmatter: { date: DESC } }
        limit: 6
      ) {
        edges {
          node {
            id
            frontmatter {
              title
              category
            }
          }
        }
      }
    }
  `)
  const indexedCommandItems = useMemo(() => {
    const seenLabels = new Set<string>()

    return (data.fusejs?.data ?? [])
      .map(item => {
        const label =
          collectSearchSuggestionLabels([item.title], "", 1)[0] || item.title

        return {
          id: item.id,
          title: item.title,
          label,
          category: item.category || "추천 검색어",
        }
      })
      .filter(item => {
        const normalizedLabel = normalizeSearchTerm(item.label)

        if (!normalizedLabel) return false
        if (seenLabels.has(normalizedLabel)) return false

        seenLabels.add(normalizedLabel)
        return true
      })
  }, [data.fusejs?.data])
  const suggestionResults = useGatsbyPluginFusejs(
    searchTerm.trim(),
    data.fusejs,
    {
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.34,
      minMatchCharLength: 2,
    },
    undefined,
    { limit: 5 },
  )
  const suggestions = useMemo(() => {
    const normalizedQuery = normalizeSearchTerm(searchTerm)
    const labelMatches = indexedCommandItems.filter(item =>
      normalizeSearchTerm(item.label).includes(normalizedQuery),
    )
    const directMatches =
      data.fusejs?.data.filter(item => matchesSearchRecord(item, searchTerm)) ??
      []
    const suggestionTitles = [
      ...labelMatches.map(item => item.title),
      ...directMatches.map(item => item.title),
      ...suggestionResults.map(result => result.item.title),
    ]

    return collectSearchSuggestionLabels(suggestionTitles, searchTerm, 6)
  }, [data.fusejs?.data, indexedCommandItems, searchTerm, suggestionResults])
  const fallbackSuggestions = useMemo(() => {
    return collectSearchSuggestionLabels(
      data.allMarkdownRemark.edges.map(
        ({ node }) => node.frontmatter?.title || "",
      ),
      "",
      6,
    )
  }, [data.allMarkdownRemark.edges])
  const recentCommandItems = useMemo(() => {
    return data.allMarkdownRemark.edges.map(({ node }) => ({
      id: node.id,
      title: node.frontmatter?.title || "",
      label:
        collectSearchSuggestionLabels(
          [node.frontmatter?.title || ""],
          "",
          1,
        )[0] ||
        node.frontmatter?.title ||
        "",
      category: node.frontmatter?.category || "최근 글",
    }))
  }, [data.allMarkdownRemark.edges])
  const commandItems = useMemo(() => {
    const baseItems = (
      suggestions.length > 0 ? suggestions : fallbackSuggestions
    ).map((label, index) => {
      const matchedPost =
        indexedCommandItems.find(item => item.label === label) ??
        recentCommandItems.find(item => item.label === label)

      return {
        id: matchedPost?.id || `search-command-${index}`,
        title: label,
        label,
        category: matchedPost?.category || "추천 검색어",
      }
    })

    if (!searchTerm.trim()) {
      return recentCommandItems.slice(0, 6)
    }

    return baseItems
  }, [
    fallbackSuggestions,
    indexedCommandItems,
    recentCommandItems,
    searchTerm,
    suggestions,
  ])

  useHotkeys("escape", onEscape, { enableOnFormTags: true })

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        onClickOutside()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.body.style.overflow = originalOverflow
    }
  }, [onClickOutside])

  useEffect(() => {
    setActiveIndex()
  }, [commandItems, searchTerm])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault()

      if (commandItems.length === 0) {
        setActiveIndex()
        return
      }

      setActiveIndex(currentIndex =>
        currentIndex === undefined
          ? 0
          : Math.min(currentIndex + 1, commandItems.length - 1),
      )
      return
    }

    if (event.key === "ArrowUp") {
      event.preventDefault()

      if (commandItems.length === 0) {
        setActiveIndex()
        return
      }

      setActiveIndex(currentIndex =>
        currentIndex === undefined
          ? commandItems.length - 1
          : Math.max(currentIndex - 1, 0),
      )
      return
    }

    if (
      event.key === "Enter" &&
      document.activeElement === searchInputRef.current
    ) {
      event.preventDefault()

      if (activeIndex !== undefined && commandItems[activeIndex]) {
        onSearch(commandItems[activeIndex].label)
        return
      }

      const trimmedSearchTerm = searchTerm.trim()
      if (trimmedSearchTerm.length < 2) {
        setErrorMessage("검색어는 2글자 이상 입력해주세요.")
        return
      }

      onSearch(trimmedSearchTerm)
      return
    }

    if (event.key !== "Tab") return

    const focusableElements = [
      ...(searchContainerRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      ) ?? []),
    ].filter(element => !element.hasAttribute("disabled"))

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

    if (!lastElement) return

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement.focus()
      return
    }

    if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement.focus()
    }
  }

  const handleSearchTermChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchTerm(event.currentTarget.value)
    setErrorMessage("")
    setActiveIndex()
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedSearchTerm = searchTerm.trim()
    if (trimmedSearchTerm.length < 2) {
      setErrorMessage("검색어는 2글자 이상 입력해주세요.")
      searchInputRef.current?.focus()
      return
    }

    onSearch(trimmedSearchTerm)
  }

  const handleClearSearchTerm = () => {
    setSearchTerm("")
    setErrorMessage("")
    searchInputRef.current?.focus()
  }

  return (
    <SearchOverlay
      aria-labelledby="search-dialog-title"
      aria-modal="true"
      role="dialog"
      onKeyDown={handleKeyDown}
    >
      <SearchContainer ref={searchContainerRef}>
        <OverlayCloseButton
          type="button"
          onClick={onEscape}
          aria-label="검색 닫기"
        >
          <CloseIcon width={14} height={14} />
        </OverlayCloseButton>
        <SearchTitle id="search-dialog-title">검색</SearchTitle>
        <SearchForm role="search" onSubmit={handleSubmit}>
          <SearchBarRow>
            <SearchField>
              <SearchFieldIcon aria-hidden="true">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </SearchFieldIcon>
              <SearchInput
                ref={searchInputRef}
                type="search"
                placeholder="예: somehow, 친근한 관계, 날씨 상태"
                value={searchTerm}
                onChange={handleSearchTermChange}
                aria-label="검색어"
                aria-invalid={Boolean(errorMessage)}
                aria-describedby={
                  errorMessage ? "search-error-message" : undefined
                }
                aria-controls={resultListId}
                aria-activedescendant={
                  activeIndex !== undefined && commandItems[activeIndex]?.id
                    ? commandItems[activeIndex].id
                    : undefined
                }
                aria-autocomplete="list"
                role="combobox"
                autoFocus
              />
              {searchTerm && (
                <FieldControlButton
                  type="button"
                  aria-label="검색어 지우기"
                  onClick={handleClearSearchTerm}
                >
                  <CloseIcon width={10} height={10} />
                </FieldControlButton>
              )}
            </SearchField>
          </SearchBarRow>
          {!errorMessage && commandItems.length > 0 && (
            <SearchResultSection>
              <SearchResultHeading>
                {searchTerm.trim() ? "추천 검색어" : "최근 표현"}
              </SearchResultHeading>
              <SearchResultList id={resultListId} role="listbox">
                {commandItems.map((item, index) => (
                  <SearchResultItem key={item.id}>
                    <SearchResultButton
                      id={item.id}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === index}
                      tabIndex={-1}
                      $active={activeIndex === index}
                      onMouseEnter={() => {
                        setActiveIndex(index)
                      }}
                      onClick={() => onSearch(item.label)}
                    >
                      <SearchResultBody>
                        <SearchResultTitle>{item.label}</SearchResultTitle>
                        <SearchResultMeta>{item.category}</SearchResultMeta>
                      </SearchResultBody>
                    </SearchResultButton>
                  </SearchResultItem>
                ))}
              </SearchResultList>
              <SearchHintBar aria-label="검색 단축키">
                <SearchHintItem>
                  <kbd>↑</kbd>
                  <kbd>↓</kbd>
                  <span>선택</span>
                </SearchHintItem>
                <SearchHintItem>
                  <kbd>Enter</kbd>
                  <span>열기</span>
                </SearchHintItem>
                <SearchHintItem>
                  <kbd>Esc</kbd>
                  <span>닫기</span>
                </SearchHintItem>
              </SearchHintBar>
            </SearchResultSection>
          )}
          {errorMessage && (
            <SearchError id="search-error-message" role="alert">
              {errorMessage}
            </SearchError>
          )}
        </SearchForm>
      </SearchContainer>
    </SearchOverlay>
  )
}

const SearchOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: calc(var(--nav-height) + 10px) var(--padding-lg) var(--padding-lg);
  z-index: 1000;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    padding: calc(var(--nav-height) + 48px) var(--padding-sm) var(--padding-sm);
  }
`

const OverlayCloseButton = styled.button`
  position: fixed;
  top: calc(env(safe-area-inset-top) + var(--padding-sm));
  right: calc(env(safe-area-inset-right) + var(--padding-sm));
  width: 2.5rem;
  height: 2.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background-color: rgba(255, 255, 255, 0.94);
  color: var(--color-text-2);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
  cursor: pointer;

  &:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px rgba(10, 132, 255, 0.14),
      0 10px 24px rgba(15, 23, 42, 0.14);
  }
`

const SearchContainer = styled.div`
  width: min(100%, 46rem);
  margin: 0 auto;
  padding: 14px;
  border: 1px solid color-mix(in srgb, var(--color-nav-border) 72%, white);
  border-radius: 24px;
  background: color-mix(in srgb, var(--color-card) 98%, white 2%);
  box-shadow:
    0 24px 54px rgba(15, 23, 42, 0.12),
    0 8px 20px rgba(15, 23, 42, 0.06);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    width: 100%;
    padding: 12px;
    border-radius: 20px;
  }
`

const SearchTitle = styled.h2`
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  white-space: nowrap;
`

const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const SearchBarRow = styled.div`
  display: block;
`

const SearchField = styled.div`
  display: flex;
  align-items: center;
  min-height: 3rem;
  padding: 0 6px 0 12px;
  border: 1px solid color-mix(in srgb, var(--color-gray-3) 92%, white);
  border-radius: 16px;
  background-color: var(--color-post-background);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;

  &:focus-within {
    border-color: color-mix(
      in srgb,
      var(--color-blue) 45%,
      var(--color-gray-3)
    );
    box-shadow:
      0 0 0 3px rgba(10, 132, 255, 0.08),
      0 8px 18px rgba(10, 132, 255, 0.04);
  }
`

const SearchFieldIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--color-gray-5);

  svg {
    width: 1.1rem;
    height: 1.1rem;
  }
`

const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  padding: 12px 0 12px 10px;
  border: none;
  background-color: transparent;
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.4;

  &::placeholder {
    color: var(--color-gray-6);
  }

  &:focus-visible {
    outline: none;
  }
`

const FieldControlButton = styled.button`
  width: 1.875rem;
  height: 1.875rem;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 999px;
  background-color: transparent;
  color: var(--color-text-3);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  &:hover {
    background-color: var(--color-gray-1);
    color: var(--color-text-2);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.14);
  }
`

const SearchResultSection = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--color-gray-2) 82%, white);
  border-radius: 18px;
  background-color: color-mix(in srgb, var(--color-card) 94%, white 6%);
`

const SearchResultHeading = styled.h3`
  margin: 0;
  padding: 14px 16px 8px;
  color: var(--color-text-3);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semi-bold);
  letter-spacing: 0.02em;
`

const SearchResultList = styled.ul`
  display: grid;
  gap: 2px;
  max-height: min(24rem, calc(100vh - 17rem));
  margin: 0;
  padding: 0 8px 8px;
  overflow-y: auto;
  list-style: none;
`

const SearchResultItem = styled.li`
  margin: 0;
`

const SearchError = styled.p`
  margin: 0;
  padding-left: 2px;
  color: #b42318;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
`

const SearchResultButton = styled.button<{ $active: boolean }>`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  padding: 12px;
  border: none;
  border-radius: 14px;
  background-color: ${({ $active }) =>
    $active
      ? "color-mix(in srgb, var(--color-blue) 10%, white 90%)"
      : "transparent"};
  color: var(--color-text);
  box-shadow: ${({ $active }) =>
    $active ? "inset 0 0 0 1px rgba(10, 132, 255, 0.12)" : "none"};
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:hover {
    background-color: color-mix(in srgb, var(--color-blue) 10%, white 90%);
  }

  &:focus-visible {
    outline: none;
  }
`

const SearchResultBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`

const SearchResultTitle = styled.span`
  color: var(--color-text);
  font-size: 0.9625rem;
  font-weight: var(--font-weight-semi-bold);
  line-height: 1.35;
`

const SearchResultMeta = styled.span`
  color: var(--color-text-3);
  font-size: var(--text-xs);
  line-height: 1.35;
`

const SearchHintBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 14px 14px;
  border-top: 1px solid color-mix(in srgb, var(--color-gray-2) 82%, white);
  background-color: color-mix(in srgb, var(--color-card) 96%, white 4%);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    display: none;
  }
`

const SearchHintItem = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--color-text-3);
  font-size: var(--text-xs);

  kbd {
    min-width: 1.6rem;
    height: 1.5rem;
    padding: 0 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid color-mix(in srgb, var(--color-gray-3) 88%, white);
    border-bottom-width: 2px;
    border-radius: 8px;
    background-color: var(--color-post-background);
    color: var(--color-text-2);
    font-size: 0.75rem;
    font-family: inherit;
    font-weight: var(--font-weight-semi-bold);
  }
`

export default SearchBar
