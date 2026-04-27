export interface SearchRecord {
  body?: string | null
  category?: string | null
  desc?: string | null
  id: string
  title?: string | null
}

const EXTRACT_QUOTED_TERM_PATTERN = /^['"“‘]([^'"”’]+)['"”’]/u
const TITLE_SUFFIX_PATTERN = /\s+영어로 어떻게 표현할까.*$/u
export const normalizeSearchTerm = (value: string) => {
  return value.trim().toLocaleLowerCase().replaceAll(/\s+/g, " ")
}

export const matchesSearchRecord = (record: SearchRecord, rawQuery: string) => {
  const normalizedQuery = normalizeSearchTerm(rawQuery)

  if (!normalizedQuery) return false

  return [record.title, record.desc, record.category, record.body].some(field =>
    normalizeSearchTerm(field ?? "").includes(normalizedQuery),
  )
}

export const extractSearchSuggestionLabel = (title: string) => {
  const trimmedTitle = title.trim()
  const quotedTermMatch = trimmedTitle.match(EXTRACT_QUOTED_TERM_PATTERN)

  if (quotedTermMatch?.[1]) {
    return quotedTermMatch[1].trim()
  }

  return trimmedTitle.replace(TITLE_SUFFIX_PATTERN, "").split(" - ")[0].trim()
}

export const collectSearchSuggestionLabels = (
  titles: string[],
  rawQuery: string,
  limit: number,
) => {
  const seenLabels = new Set<string>()
  const normalizedQuery = normalizeSearchTerm(rawQuery)

  return titles
    .map(title => extractSearchSuggestionLabel(title))
    .filter(label => {
      const normalizedLabel = normalizeSearchTerm(label)

      if (!normalizedLabel) return false
      if (normalizedLabel === normalizedQuery) return false
      if (seenLabels.has(normalizedLabel)) return false

      seenLabels.add(normalizedLabel)

      return true
    })
    .slice(0, limit)
}
