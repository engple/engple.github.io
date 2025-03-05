import React from "react"

const BtnText = {
  EXPAND: "🙈 모두 숨기기",
  COLLAPSE: "👀 모두 펼치기",
}

const DetailsToggle: React.FC = () => {
  React.useEffect(() => {
    const cleanupItems: Array<{ button: HTMLElement; cleanup: () => void }> = []

    const createToggleButton = () => {
      const button = document.createElement("button")
      button.className = "details-toggle-button"
      button.textContent = BtnText.COLLAPSE
      return button
    }

    const toggleAllDetails = (
      detailsElements: NodeListOf<HTMLDetailsElement>,
      expanded: boolean,
    ) => {
      for (const details of detailsElements) {
        if (expanded) {
          details.setAttribute("open", "")
        } else {
          details.removeAttribute("open")
        }
      }
    }

    const setupDetailsToggle = () => {
      const detailsElements =
        document.querySelectorAll<HTMLDetailsElement>("details")
      if (detailsElements.length === 0) return

      const firstDetails = detailsElements[0]
      if (firstDetails.querySelector(".details-toggle-button")) return

      const button = createToggleButton()

      const handleClick = () => {
        const newState = !button.classList.contains("expanded")
        button.classList.toggle("expanded")
        button.textContent = newState ? BtnText.EXPAND : BtnText.COLLAPSE
        toggleAllDetails(detailsElements, newState)
      }

      button.addEventListener("click", handleClick)

      // Create a wrapper div to handle positioning
      const wrapper = document.createElement("div")
      wrapper.style.position = "relative"

      // Insert wrapper before the first details
      firstDetails.parentNode?.insertBefore(wrapper, firstDetails)
      wrapper.append(button)

      cleanupItems.push({
        button: wrapper, // Change to remove the wrapper instead
        cleanup: () => button.removeEventListener("click", handleClick),
      })
    }

    setupDetailsToggle()

    return () => {
      for (const { button, cleanup } of cleanupItems) {
        cleanup()
        button.remove()
      }
    }
  }, [])

  return <></>
}

export default DetailsToggle
