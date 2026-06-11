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
  title: "잉플 | 패턴으로 배우는 영어 공부",
  description:
    "잉플에서 실전 영어 표현과 영어 패턴을 한국어 예문으로 쉽게 익히세요. 발음, 상황별 예문, 연습 문제까지 한 번에 확인할 수 있습니다.",
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
