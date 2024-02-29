import React from "react"

import { styled } from "styled-components"

const SearchBar = () => {
  return (
    <Container>
      <StyledInput placeholder="Search" />
      <StyledButton type="submit">
        <SearchIcon
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </SearchIcon>
      </StyledButton>
    </Container>
  )
}

const Container = styled.div`
  box-sizing: border-box;
  display: flex;
  min-width: 200px;
  max-width: 400px;
  align-items: center;
`

const StyledInput = styled.input`
  border: 1px solid var(--color-gray-3);
  border-radius: 3px;
  background: transparent;
  width: 100%;
  height: 32px;
  padding: 4px 8px;
  font-size: 14px;
  outline: none;
  &:placeholder: {
    color: var(--color-gray-5);
  }

  &:focus {
    outline: none;
  }
`

const StyledButton = styled.button`
  width: 32px;
  height: 32px;
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  border-radius: 3px;
  outline: none;
  cursor: pointer;

  &:hover {
    background-color: var(--color-gray-2);
  }
`

const SearchIcon = styled.svg`
  height: 16px;
  width: 16px;
  stroke-width: 2;
  stroke: var(--color-gray-5);
`

export default SearchBar
