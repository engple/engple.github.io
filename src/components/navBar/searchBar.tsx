import React, { useEffect, useRef, useState } from "react"

import { useHotkeys } from "react-hotkeys-hook"
import styled from "styled-components"

import CloseIcon from "../icons/CloseIcon"

interface SearchBarProps {
  onClickOutside?: () => void
  onEscape?: () => void
  onSearch?: (searchTerm: string) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  onClickOutside = () => {},
  onEscape = () => {},
  onSearch = () => {},
}) => {
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClickOutside])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") return

    const focusableElements = [...(searchContainerRef.current?.querySelectorAll<HTMLElement>(
        'button, input, [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [])].filter(element => !element.hasAttribute("disabled"))

    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

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

  return (
    <SearchOverlay
      aria-labelledby="search-dialog-title"
      aria-modal="true"
      role="dialog"
      onKeyDown={handleKeyDown}
    >
      <SearchContainer ref={searchContainerRef}>
        <SearchForm role="search" onSubmit={handleSubmit}>
          <SearchTitle id="search-dialog-title">검색</SearchTitle>
          <SearchInput
            ref={searchInputRef}
            type="search"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={handleSearchTermChange}
            aria-label="검색어"
            aria-invalid={Boolean(errorMessage)}
            aria-describedby={errorMessage ? "search-error-message" : undefined}
            autoFocus
          />
          {errorMessage && (
            <SearchError id="search-error-message" role="alert">
              {errorMessage}
            </SearchError>
          )}
          <SearchSubmit type="submit">검색</SearchSubmit>
        </SearchForm>
        <CloseButton
          ref={closeButtonRef}
          type="button"
          onClick={onEscape}
          aria-label="검색 닫기"
        >
          <CloseIcon width={14} height={14} />
        </CloseButton>
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
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: calc(var(--nav-height) + var(--sizing-xxxl));
  z-index: 1000;
`

const SearchContainer = styled.div`
  position: relative;
  width: 80%;
  max-width: 600px;
  display: flex;
  align-items: center;
`

const SearchForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--sizing-sm);
`

const SearchTitle = styled.h2`
  margin: 0;
  color: white;
  font-size: var(--text-md);
  font-weight: var(--font-weight-bold);
`

const SearchInput = styled.input`
  width: 100%;
  padding: var(--padding-sm) var(--padding-lg);
  font-size: var(--text-md);
  border: none;
  border-radius: var(--border-radius-base);
  background-color: var(--color-post-background);
  color: var(--color-text);

  &::placeholder {
    color: var(--color-gray-6);
  }
`

const SearchError = styled.p`
  margin: 0;
  color: white;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
`

const SearchSubmit = styled.button`
  align-self: flex-end;
  padding: var(--padding-xs) var(--padding-md);
  border: none;
  border-radius: var(--border-radius-base);
  background-color: var(--color-card);
  color: var(--color-text);
  cursor: pointer;
  font-weight: var(--font-weight-semi-bold);
`

const CloseButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background-color: var(--color-post-background);
  color: var(--color-text);
  cursor: pointer;
`

export default SearchBar
