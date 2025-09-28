import { type DependencyList, useEffect } from "react"

interface UseInteractiveListOptions {
  listSelector?: string
  itemSelector?: string
  togglerSelector?: string
  openAttribute?: string
  toggleAllButtonTextExpand?: string
  toggleAllButtonTextCollapse?: string
  toggleAllButtonClassName?: string
  useToggleAllBtn?: boolean
  initialState?: "expanded" | "collapsed"
}

export function useInteractiveList(
  contentDependencies: DependencyList,
  {
    listSelector = "[data-interactive-list]",
    itemSelector = "[data-interactive-item]",
    togglerSelector = "[data-toggler]",
    openAttribute = "data-open",
    toggleAllButtonTextExpand = "👀 모두 펼치기",
    toggleAllButtonTextCollapse = "🙈 모두 숨기기",
    toggleAllButtonClassName = "interactive-list-toggle-all-button",
    useToggleAllBtn = true,
    initialState = "expanded",
  }: UseInteractiveListOptions = {},
) {
  useItemTogglers({
    contentDependencies,
    itemSelector,
    togglerSelector,
    openAttribute,
    initialState,
  })
  useToggleAllButton({
    contentDependencies,
    listSelector,
    itemSelector,
    openAttribute,
    toggleAllButtonTextExpand,
    toggleAllButtonTextCollapse,
    toggleAllButtonClassName,
    useToggleAllBtn,
    initialState,
  })
}

function useItemTogglers({
  contentDependencies,
  itemSelector,
  togglerSelector,
  openAttribute,
  initialState,
}: {
  contentDependencies: DependencyList
  itemSelector: string
  togglerSelector: string
  openAttribute: string
  initialState: "expanded" | "collapsed"
}) {
  useEffect(() => {
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
    const items = document.querySelectorAll<HTMLElement>(itemSelector)

    if (initialState === "expanded") {
      for (const item of items) {
        item.setAttribute(openAttribute, "true")
      }
    }

    for (const toggler of togglers) {
      toggler.addEventListener("click", handleClick)
    }

    return () => {
      for (const toggler of togglers) {
        toggler.removeEventListener("click", handleClick)
      }
    }
  }, [
    contentDependencies,
    itemSelector,
    togglerSelector,
    openAttribute,
    initialState,
  ])
}

function useToggleAllButton({
  contentDependencies,
  listSelector,
  itemSelector,
  openAttribute,
  toggleAllButtonTextExpand,
  toggleAllButtonTextCollapse,
  toggleAllButtonClassName,
  useToggleAllBtn,
  initialState,
}: {
  contentDependencies: DependencyList
  listSelector: string
  itemSelector: string
  openAttribute: string
  toggleAllButtonTextExpand: string
  toggleAllButtonTextCollapse: string
  toggleAllButtonClassName: string
  useToggleAllBtn: boolean
  initialState: "expanded" | "collapsed"
}) {
  useEffect(() => {
    let toggleAllButton: {
      button: HTMLButtonElement | undefined
      handler: (() => void) | undefined
    } = { button: undefined, handler: undefined }

    if (useToggleAllBtn) {
      toggleAllButton = setupToggleAllButton({
        listSelector: listSelector || "[data-interactive-list]",
        itemSelector: itemSelector || "[data-interactive-item]",
        openAttribute: openAttribute || "data-open",
        toggleAllButtonTextExpand:
          toggleAllButtonTextExpand || "👀 모두 펼치기",
        toggleAllButtonTextCollapse:
          toggleAllButtonTextCollapse || "🙈 모두 숨기기",
        toggleAllButtonClassName:
          toggleAllButtonClassName || "interactive-list-toggle-all-button",
        initialState,
      })
    }

    return () => {
      if (toggleAllButton.button && toggleAllButton.handler) {
        toggleAllButton.button.removeEventListener(
          "click",
          toggleAllButton.handler,
        )
        toggleAllButton.button.remove()
      }
    }
  }, [
    contentDependencies,
    listSelector,
    itemSelector,
    openAttribute,
    toggleAllButtonTextExpand,
    toggleAllButtonTextCollapse,
    toggleAllButtonClassName,
    useToggleAllBtn,
    initialState,
  ])
}

function setupToggleAllButton({
  listSelector,
  itemSelector,
  openAttribute,
  toggleAllButtonTextExpand,
  toggleAllButtonTextCollapse,
  toggleAllButtonClassName,
  initialState,
}: {
  listSelector: string
  itemSelector: string
  openAttribute: string
  toggleAllButtonTextExpand: string
  toggleAllButtonTextCollapse: string
  toggleAllButtonClassName: string
  initialState: "expanded" | "collapsed"
}) {
  const listEl = document.querySelector(listSelector) as HTMLElement | null
  if (!listEl) return { button: undefined, handler: undefined }

  const button = document.createElement("button")
  button.className = toggleAllButtonClassName

  button.textContent =
    initialState === "expanded"
      ? toggleAllButtonTextCollapse
      : toggleAllButtonTextExpand
  button.dataset.state = initialState

  const handler = () => {
    const items = document.querySelectorAll<HTMLElement>(itemSelector)
    if (items.length === 0) return

    const currentStateIsExpanded = button.dataset.state === "expanded"

    if (currentStateIsExpanded) {
      // Action: Collapse All
      for (const item of items) {
        item.removeAttribute(openAttribute)
      }
      button.textContent = toggleAllButtonTextExpand
      button.dataset.state = "collapsed"
    } else {
      // Action: Expand All
      for (const item of items) {
        item.setAttribute(openAttribute, "true")
      }
      button.textContent = toggleAllButtonTextCollapse
      button.dataset.state = "expanded"
    }
  }

  button.addEventListener("click", handler)
  listEl.append(button)

  return { button, handler }
}
