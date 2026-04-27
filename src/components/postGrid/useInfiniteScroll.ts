import { useEffect, useLayoutEffect, useRef, useState } from "react"

import type Post from "~/src/types/Post"

interface UseInfiniteScrollProperties {
  posts: Post[]
  scrollEdgeRef: React.RefObject<HTMLDivElement>
  maxPostNum: number
  offsetY: number
}

const useInfiniteScroll = ({
  posts,
  scrollEdgeRef,
  maxPostNum: maxPostNumber = 10,
  offsetY = 400,
}: UseInfiniteScrollProperties) => {
  const [hasMore, setHasMore] = useState(false)
  const [currentList, setCurrentList] = useState<Post[]>([])
  const [observerLoading, setObserverLoading] = useState(false)

  const observer = useRef<IntersectionObserver>()

  useLayoutEffect(() => {
    setHasMore(posts.length > maxPostNumber)
    setCurrentList(posts.slice(0, maxPostNumber))
    setObserverLoading(false)
  }, [posts, maxPostNumber])

  useEffect(() => {
    const loadEdges = () => {
      setCurrentList(previousList => {
        const currentLength = previousList.length
        const nextEdges = posts.slice(
          currentLength,
          currentLength + maxPostNumber,
        )
        const nextList = [...previousList, ...nextEdges]

        setHasMore(nextList.length < posts.length)

        return nextList
      })
    }

    const scrollEdgeElement = scrollEdgeRef.current
    if (!scrollEdgeElement) return

    const option = {
      rootMargin: `0px 0px ${offsetY}px 0px`,
      threshold: [0],
    }

    observer.current = new IntersectionObserver(entries => {
      if (!hasMore) return
      for (const entry of entries) {
        if (!observerLoading) {
          setObserverLoading(true)
          continue
        }
        if (entry.isIntersecting) loadEdges()
      }
    }, option)

    observer.current.observe(scrollEdgeElement!)

    return () => observer.current && observer.current.disconnect()
  }, [
    currentList.length,
    hasMore,
    maxPostNumber,
    observerLoading,
    offsetY,
    posts,
    scrollEdgeRef,
  ])

  return currentList
}

export default useInfiniteScroll
