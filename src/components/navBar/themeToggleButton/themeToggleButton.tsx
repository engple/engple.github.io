import React, { useContext } from "react"

import styled from "styled-components"

import ThemeContext from "~/src/stores/themeContext"
import Background from "~/src/styles/background"

import ThemeIcon from "./themeIcon"

interface ThemeToggleButtonProperties {
  onClick: () => void
}

const ThemeToggleButton: React.FC<ThemeToggleButtonProperties> = ({
  onClick,
}) => {
  const theme = useContext(ThemeContext)

  return (
    <Button onClick={onClick}>
      <ButtonBackground />
      <Content>
        <Icon version="1.1" x="0px" y="0px" viewBox="0 0 24 24">
          <ThemeIcon theme={theme} />
        </Icon>
      </Content>
    </Button>
  )
}

const Icon = styled.svg`
  width: 1.125rem;
  height: 1.125rem;
  fill: var(--color-icon);
  transform: translateY(-1px);
`

const ButtonBackground = styled(Background)`
  border: none;
  background-color: var(--color-floating-button);
  border-radius: 100%;
  box-shadow: 0 3px 15px var(--color-floating-button-shadow);
`

const Content = styled.div`
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
`

const Button = styled.button`
  cursor: pointer;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  z-index: 100;
  right: var(--sizing-md);
  bottom: var(--sizing-md);
  padding: var(--sizing-base);
  border: none;
  font-weight: var(--font-weight-medium);
  outline: none;

  ${Icon} {
    color: var(--color-floating-button-text);
    fill: var(--color-floating-button-text);
  }

  ${ButtonBackground} {
    background-color: var(--color-floating-button);
  }

  &:hover {
    ${Icon} {
      color: var(--color-floating-button-text-hover);
      fill: var(--color-floating-button-text-hover);
    }

    ${ButtonBackground} {
      background-color: var(--color-floating-button-hover);
    }
  }
`

export default ThemeToggleButton
