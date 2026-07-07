#!/usr/bin/env node
"use strict"

// Naver, Bing, and other IndexNow-participating engines can pick up new or
// changed posts much faster than waiting for their next scheduled crawl of
// sitemap.xml. This pings the shared IndexNow endpoint with just the posts
// that changed in this deploy, right after the site goes live.
const { execSync } = require("child_process")

const SITE_HOST = "engple.solaqua.dev"
const SITE_URL = `https://${SITE_HOST}`
const INDEXNOW_KEY = "8741f96dfd427a60f4f080959aec0523"
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow"
const POSTS_DIR = "src/posts/blog"

function getChangedMarkdownFiles(baseSha, headSha) {
  const output = execSync(
    `git diff --name-only --diff-filter=ACM ${baseSha} ${headSha} -- ${POSTS_DIR}`,
    { encoding: "utf8" },
  )

  return output
    .split("\n")
    .map(line => line.trim())
    .filter(line => line.endsWith(".md"))
}

// Mirrors the slug gatsby-node.js derives via createFilePath({ basePath: "posts" })
function filePathToSlug(filePath) {
  const relativePath = filePath.replace(/^src\/posts\//, "")
  const withoutExtension = relativePath.replace(/\.md$/, "")

  return `/${withoutExtension}/`.replace("/season-1", "")
}

async function main() {
  const baseSha = process.env.BASE_SHA
  const headSha = process.env.HEAD_SHA

  if (!baseSha || !headSha || /^0+$/.test(baseSha)) {
    console.log("No usable commit range, skipping IndexNow ping.")
    return
  }

  const changedFiles = getChangedMarkdownFiles(baseSha, headSha)

  if (changedFiles.length === 0) {
    console.log("No changed blog posts, skipping IndexNow ping.")
    return
  }

  const urlList = changedFiles.map(
    filePath => `${SITE_URL}${filePathToSlug(filePath)}`,
  )

  console.log(`Pinging IndexNow for ${urlList.length} URL(s):`)
  for (const url of urlList) console.log(`  - ${url}`)

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  })

  console.log(`IndexNow responded with status ${response.status}`)
}

main().catch(error => {
  // Never fail the deploy over a best-effort ping.
  console.error("IndexNow ping failed:", error)
})
