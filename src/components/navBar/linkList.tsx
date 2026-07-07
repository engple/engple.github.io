import React from "react"

import { Link } from "gatsby"

import type { UseSiteMetaDataReturnType } from "~/src/hooks/useSiteMetadata"

import type { UseMenuReturnType } from "./useMenu"

const EXTERNAL_LINK_EXP =
  /(https?:\/\/)?[\w~-]+(\.[\w~-]+)+(\/[\w%:@~-]*)*(#[\w-]*)?(\?\S*)?/i

interface LinkListProperties extends Pick<UseMenuReturnType, "setToggle"> {
  links: UseSiteMetaDataReturnType["menuLinks"]
}

const LinkList: React.FC<LinkListProperties> = ({ links, setToggle }) => {
  const generateLink = (
    properties: Queries.SiteSiteMetadataMenuLinks | null,
  ) => {
    if (properties == null) {
      return
    }

    const { link, name } = properties
    const safeLink = link ?? ""
    const isExternalLink = EXTERNAL_LINK_EXP.test(safeLink)

    if (isExternalLink) {
      return (
        <li key={name}>
          <a target="_blank" rel="noreferrer" href={safeLink}>
            {name}
          </a>
        </li>
      )
    }
    return (
      <li key={name}>
        <Link to={safeLink} onClick={() => setToggle(false)}>
          {name}
        </Link>
      </li>
    )
  }

  return <>{links?.map(generateLink)}</>
}

export default LinkList
