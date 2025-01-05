import React from "react"

const Pronunciation: React.FC = () => {
  React.useEffect(() => {
    // Store references to created buttons and their handlers for cleanup
    const cleanupItems: { button: HTMLElement; handler: () => void }[] = []

    const pronunciationElements = document.querySelectorAll(
      "[data-pronunciation]",
    )

    for (const element of pronunciationElements) {
      const pronunciation = (element as HTMLElement).dataset.pronunciation
      if (!pronunciation) continue

      if (!element.querySelector(".pronunciation-button")) {
        const button = document.createElement("button")
        button.className = "pronunciation-button"
        button.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`

        const clickHandler = () => {
          const utterance = new SpeechSynthesisUtterance(pronunciation)
          utterance.lang = "en-US"

          const voices = window.speechSynthesis.getVoices()
          const samanthaVoice = voices.find(voice => voice.name === "Samantha")
          const enUSVoice = voices.find(
            voice =>
              voice.lang.includes("en-US") || voice.lang.includes("en_US"),
          )

          if (samanthaVoice) {
            utterance.voice = samanthaVoice
          } else if (enUSVoice) {
            utterance.voice = enUSVoice
          }

          window.speechSynthesis.speak(utterance)
        }

        button.addEventListener("click", clickHandler)
        element.append(button)

        // Store for cleanup
        cleanupItems.push({ button, handler: clickHandler })
      }
    }

    // Cleanup function
    return () => {
      for (const { button, handler } of cleanupItems) {
        button.removeEventListener("click", handler)
        button.remove()
      }
    }
  }, [])

  return <></>
}

export default Pronunciation
