import React from "react"

const Pronunciation: React.FC = () => {
  React.useEffect(() => {
    // Add click handlers to all pronunciation elements
    const pronunciationElements = document.querySelectorAll(
      "[data-pronunciation]",
    )

    for (const element of pronunciationElements) {
      const pronunciation = (element as HTMLElement).dataset.pronunciation
      if (!pronunciation) continue

      // Create and append button if it doesn't exist
      if (!element.querySelector(".pronunciation-button")) {
        const button = document.createElement("button")
        button.className = "pronunciation-button"
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`
        button.addEventListener("click", () => {
          const utterance = new SpeechSynthesisUtterance(pronunciation)
          utterance.lang = "en-US"
          window.speechSynthesis.speak(utterance)
        })
        element.append(button)
      }
    }
  }, [])

  return <></>
}

export default Pronunciation
