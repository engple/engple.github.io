import React, { useEffect, useRef, useState } from "react"

import styled from "styled-components"

interface SearchBarProps {
  onClickOutside: () => void
}

const SearchBar: React.FC<SearchBarProps> = ({ onClickOutside }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const searchContainerRef = useRef<HTMLDivElement>(null)

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

  return (
    <SearchOverlay>
      <SearchContainer ref={searchContainerRef}>
        <SearchInput
          type="text"
          placeholder="🔍 검색어를 입력하세요"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          autoFocus
        />
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
  padding-top: 100px;
  z-index: 1000;
`

const SearchContainer = styled.div`
  width: 80%;
  max-width: 600px;
  display: flex;
  align-items: center;
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

export default SearchBar
