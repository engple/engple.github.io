import styled from "styled-components"

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  backdrop-filter: saturate(180%) blur(20px);
  background-color: var(--color-nav-bar);
  border-bottom: 1px solid var(--color-nav-border);
  box-shadow: 0 18px 40px -32px var(--color-card-shadow);
`

export default Background
