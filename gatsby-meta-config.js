/**
 * @typedef {Object} Links
 * @prop {string} github Your github repository
 */

/**
 * @typedef {Object} MetaConfig
 * @prop {string} title Your website title
 * @prop {string} description Your website description
 * @prop {string} author Maybe your name
 * @prop {string} siteUrl Your website URL
 * @prop {string} lang Your website Language
 * @prop {string} utterances Github repository to store comments
 * @prop {Links} links
 * @prop {string} favicon Favicon Path
 */

/** @type {MetaConfig} */
const metaConfig = {
  title: "잉플 | 패턴으로 배우는 영어 공부 🍎",
  description: `잉플과 함께 패턴으로 영어 공부를 해봐요 🚀. 영어 표현 및 영어 패턴과 더불어 공부한 것들을 연습해볼 수 있는 기회를 제공해요. 영어 패턴을 배우다 보면 어느새 영어가 자연스럽게 나오는 날이 올 거예요 😎.`,
  author: "solaqua",
  siteUrl: "https://engple.github.io",
  lang: "ko",
  utterances: "",
  links: {
    github: "https://github.com/engple/engple",
  },
  favicon: "src/images/icon.png",
}

// eslint-disable-next-line no-undef
module.exports = metaConfig
