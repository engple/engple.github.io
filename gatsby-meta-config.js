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
 * @prop {string} gtagTrackingId Google Analytics Tracking ID
 * @prop {string} googleAdsense Google Adsense ID
 * @prop {string} naverSiteVerification Naver Site Verification ID
 */

/** @type {MetaConfig} */
const metaConfig = {
  title: "잉플 | 패턴으로 배우는 영어 공부 🍎",
  description: `영어 패턴 학습으로 자연스러운 영어 실력 향상! 🚀 잉플과 함께하는 효과적인 영어 공부법. 실용적인 영어 표현과, 즉각적인 연습 기회. 꾸준한 학습으로 영어가 술술 나오는 놀라운 경험을 해보세요. 지금 시작하세요! 😎`,
  author: "solaqua",
  siteUrl: "https://engple.github.io",
  lang: "ko-KR",
  utterances: "",
  links: {
    github: "https://github.com/engple/engple",
  },
  favicon: "src/images/icon.png",
  gtagTrackingId: "G-02627QJ9HV",
  googleAdsense: "ca-pub-1465612013356152",
  naverSiteVerification: "7f4cdd0b74209a3bbf5b0c15b445fa439a8a2b9c",
}

// eslint-disable-next-line no-undef
module.exports = metaConfig
