import { type DependencyList, useEffect } from "react"

interface UseInteractiveListOptions {
  itemSelector: string
  togglerSelector: string
  openAttribute: string
}

const defaultOptions: UseInteractiveListOptions = {
  itemSelector: "[data-interactive-item]",
  togglerSelector: "[data-toggler]",
  openAttribute: "data-open",
}

export function useInteractiveList(
  contentDependencies: DependencyList,
  options?: Partial<UseInteractiveListOptions>,
) {
  useEffect(() => {
    const currentOptions = { ...defaultOptions, ...options }
    const { itemSelector, togglerSelector, openAttribute } = currentOptions

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
  }, [contentDependencies, options])
}
