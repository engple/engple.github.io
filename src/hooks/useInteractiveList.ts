import { type DependencyList, useEffect } from "react"

interface UseInteractiveListOptions {
  listSelector: string
  itemSelector: string
  togglerSelector: string
  translationSelector: string
  openAttribute: string
}

const defaultOptions: UseInteractiveListOptions = {
  listSelector: "[data-interactive-list]",
  itemSelector: "[data-interactive-item]",
  togglerSelector: "[data-toggler]",
  translationSelector: "[data-answer]",
  openAttribute: "data-open",
}

export function useInteractiveList(
  contentDependencies: DependencyList,
  options?: Partial<UseInteractiveListOptions>,
) {
  const currentOptions = { ...defaultOptions, ...options }

  useEffect(() => {
    const {
      itemSelector,
      togglerSelector,
      translationSelector,
      openAttribute,
    } = currentOptions

    const interactiveItems =
      document.querySelectorAll<HTMLElement>(itemSelector)

    // Initial setup: Ensure translations are hidden and items are not marked as open
    // CSS should handle the default appearance (icons, display none for translation)
    for (const item of interactiveItems) {
      const translationElement =
        item.querySelector<HTMLElement>(translationSelector)
      if (translationElement && item.getAttribute(openAttribute) !== "true") {
        // CSS should already hide this, but being explicit can prevent flashes if CSS loads late.
        // However, for this approach, we rely on CSS for initial hidden state.
      }
      // Ensure toggler has cursor pointer by default if not set by global CSS
      const toggler = item.querySelector<HTMLElement>(togglerSelector)
      if (toggler && !toggler.style.cursor) {
        toggler.style.cursor = "pointer"
      }
    }

    const handleClick = (event: MouseEvent) => {
      const togglerElement = event.currentTarget as HTMLElement
      const parentItem = togglerElement.closest(
        itemSelector,
      ) as HTMLElement | null

      if (!parentItem) return

      const isOpen = parentItem.getAttribute(openAttribute) === "true"
      if (isOpen) {
        parentItem.removeAttribute(openAttribute)
      } else {
        parentItem.setAttribute(openAttribute, "true")
      }
    }

    const togglers = document.querySelectorAll<HTMLElement>(togglerSelector)
    for (const toggler of togglers) {
      toggler.addEventListener("click", handleClick)
    }

    return () => {
      for (const toggler of togglers) {
        toggler.removeEventListener("click", handleClick)
      }
    }
  }, [contentDependencies, currentOptions]) // Removed exhaustive-deps comment, as currentOptions is now stable if options isn't changing frequently
}
