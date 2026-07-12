import { useEffect, useState } from "react"

const HISTORY_KEY = "engple.readingHistory"
const STREAK_KEY = "engple.streak"
const HISTORY_LIMIT = 8

export interface ReadingHistoryEntry {
  slug: string
  title: string
  /** Epoch milliseconds of the last visit */
  visitedAt: number
}

interface StreakRecord {
  /** ISO date (YYYY-MM-DD) of the last counted study day */
  lastDate: string
  /** Number of consecutive study days including lastDate */
  count: number
}

/**
 * Read the stored reading history (most recent first).
 * Resolves after mount so SSR/hydration output stays stable.
 */
export function useReadingHistory(): {
  history: ReadingHistoryEntry[]
  loaded: boolean
} {
  const [history, setHistory] = useState<ReadingHistoryEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setHistory(readHistory())
    setLoaded(true)
  }, [])

  return { history, loaded }
}

/**
 * Current consecutive-study-day streak. 0 until a post has been read.
 * A streak survives one missed day boundary (today or yesterday counts).
 */
export function useStreak(): number {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    const record = readStreak()

    if (!record) return

    const today = toISODate(new Date())
    const yesterday = toISODate(addDays(new Date(), -1))

    if (record.lastDate === today || record.lastDate === yesterday) {
      setStreak(record.count)
    }
  }, [])

  return streak
}

/**
 * Record a post visit: prepend to reading history (deduped, capped)
 * and advance the daily study streak.
 */
export function recordPostVisit(slug: string, title: string): void {
  if (typeof window === "undefined") return

  const entry: ReadingHistoryEntry = { slug, title, visitedAt: Date.now() }
  const rest = readHistory().filter(item => item.slug !== slug)
  writeJSON(HISTORY_KEY, [entry, ...rest].slice(0, HISTORY_LIMIT))

  advanceStreak()
}

function advanceStreak(): void {
  const today = toISODate(new Date())
  const yesterday = toISODate(addDays(new Date(), -1))
  const record = readStreak()

  if (record?.lastDate === today) return

  const nextCount = record?.lastDate === yesterday ? record.count + 1 : 1
  writeJSON(STREAK_KEY, { lastDate: today, count: nextCount })
}

function readHistory(): ReadingHistoryEntry[] {
  const value = readJSON<ReadingHistoryEntry[]>(HISTORY_KEY)

  if (!Array.isArray(value)) return []

  return value.filter(
    item =>
      typeof item?.slug === "string" &&
      typeof item?.title === "string" &&
      typeof item?.visitedAt === "number",
  )
}

function readStreak(): StreakRecord | undefined {
  const value = readJSON<StreakRecord>(STREAK_KEY)

  if (
    typeof value?.lastDate === "string" &&
    typeof value?.count === "number" &&
    value.count > 0
  ) {
    return value
  }

  return undefined
}

function readJSON<T>(key: string): T | undefined {
  if (typeof window === "undefined") return undefined

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be unavailable (private mode, quota) — retention features
    // silently degrade instead of breaking the page.
  }
}

function toISODate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}
