import kebabCase from "lodash/kebabCase"
import {
  type DefinedTerm,
  type ItemList,
  type ListItem,
  type Question,
  type Quiz,
} from "schema-dts"

interface PostListItem {
  slug?: string | null
  title?: string | null
}

interface ExpressionSource {
  category?: string | null
  title?: string | null
  faqs?:
    | readonly {
        answer?: string | null
        question?: string | null
      }[]
    | readonly ({ answer?: string | null; question?: string | null } | null)[]
    | null
}

interface PracticeCard {
  question: string
  answer: string
}

export function createPostItemListJsonLd({
  id,
  name,
  posts,
  siteUrl,
}: {
  id: string
  name: string
  posts: readonly PostListItem[]
  siteUrl: string
}) {
  return {
    "@type": "ItemList",
    "@id": id,
    name,
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) =>
      createPostListItem(post, index, siteUrl),
    ),
  } as ItemList
}

function createPostListItem(
  post: PostListItem,
  index: number,
  siteUrl: string,
) {
  return {
    "@type": "ListItem",
    position: index + 1,
    name: post.title || "",
    url: post.slug ? `${siteUrl}${post.slug}` : siteUrl,
  } as ListItem
}

export function createDefinedTermJsonLd({
  category,
  description,
  expression,
  id,
  siteUrl,
  url,
}: {
  category?: string | null
  description: string
  expression: string
  id: string
  siteUrl: string
  url: string
}) {
  return {
    "@type": "DefinedTerm",
    "@id": id,
    name: expression,
    description,
    url,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: category ? `잉플 ${category} 표현 사전` : "잉플 영어 표현 사전",
      url: category ? `${siteUrl}/category/${kebabCase(category)}/` : siteUrl,
    },
  } as DefinedTerm
}

export function getExpressionTerm({ category, title, faqs }: ExpressionSource) {
  if (category !== "영어표현") return

  return getExpressionFromFaqs(faqs) ?? getExpressionFromTitle(title)
}

function getExpressionFromFaqs(
  faqs?:
    | readonly ({ answer?: string | null; question?: string | null } | null)[]
    | null,
) {
  for (const faq of faqs ?? []) {
    const expression =
      getFirstEnglishQuotedText(faq?.answer) ??
      getFirstEnglishQuotedText(faq?.question)

    if (expression) return expression
  }

  return
}

function getFirstEnglishQuotedText(text?: string | null) {
  const quotedTexts = text?.matchAll(/["'‘“]([^"'’”]+)["'’”]/g) ?? []

  for (const match of quotedTexts) {
    const expression = match[1]?.trim()

    if (expression && /[A-Za-z]/.test(expression)) return expression
  }

  return
}

function getExpressionFromTitle(title?: string | null) {
  return getFirstEnglishQuotedText(title)
}

export function createPracticeQuizJsonLd({
  aboutId,
  expression,
  html,
  id,
  title,
}: {
  aboutId?: string
  expression?: string
  html: string
  id: string
  title: string
}) {
  const cards = getPracticeCards(html)

  if (cards.length === 0) return

  return {
    "@type": "Quiz",
    "@id": id,
    name: `${title} 연습 문제`,
    about: aboutId
      ? { "@id": aboutId }
      : { "@type": "Thing", name: expression },
    educationalAlignment: {
      "@type": "AlignmentObject",
      alignmentType: "educationalSubject",
      targetName: "English language learning",
    },
    hasPart: cards.map(card => createPracticeQuestion(card)),
  } as Quiz
}

function getPracticeCards(html: string) {
  return [...html.matchAll(/<li\b[^>]*data-interactive-item[^>]*>([\S\s]*?)<\/li>/gi)]
    .map(match => createPracticeCard(match[1]))
    .filter(Boolean)
}

function createPracticeCard(block: string) {
  const question = getElementTextByDataAttribute(block, "data-toggler")
  const answer = getElementTextByDataAttribute(block, "data-answer")

  if (!question || !answer) return

  return { question, answer }
}

function getElementTextByDataAttribute(block: string, attribute: string) {
  const pattern = new RegExp(
    `<span[^>]*${attribute}[^>]*>([\\s\\S]*?)<\\/span>`,
    "i",
  )

  return normalizeText(pattern.exec(block)?.[1])
}

function normalizeText(html?: string) {
  return decodeHtmlEntities(stripHtml(html ?? ""))
}

function stripHtml(html: string) {
  return html
    .replaceAll(/<[^>]*>/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim()
}

function decodeHtmlEntities(text: string) {
  return text
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&apos;", "'")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
}

function createPracticeQuestion(card: PracticeCard) {
  return {
    "@type": "Question",
    eduQuestionType: "Flashcard",
    text: card.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: card.answer,
    },
  } as Question
}
