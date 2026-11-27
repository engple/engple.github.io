import React, { useMemo } from "react"

import { graphql, useStaticQuery } from "gatsby"
import { GatsbyImage, type IGatsbyImageData } from "gatsby-plugin-image"
import styled from "styled-components"

import type Post from "~/src/types/Post"

interface CenteredImgProperties extends Pick<Post, "alt"> {
  src: Post["thumbnail"]
}

const DEFAULT_ALT = "Thumbnail Image"

const CenteredImg: React.FC<CenteredImgProperties> = ({ src, alt }) => {
  const data = useStaticQuery<Queries.CenteredImgQuery>(graphql`
    query CenteredImg {
      allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/(posts/blog)/" } }
      ) {
        nodes {
          frontmatter {
            thumbnail {
              childImageSharp {
                id
                gatsbyImageData(
                  layout: CONSTRAINED
                  width: 640
                  aspectRatio: 1.77777777778
                  placeholder: BLURRED
                )
              }
            }
          }
        }
      }
    }
  `)

  const image = useMemo(() => {
    for (const node of data.allMarkdownRemark.nodes) {
      const thumbnail = node.frontmatter?.thumbnail?.childImageSharp
      if (thumbnail && thumbnail.id === src) {
        return thumbnail.gatsbyImageData as IGatsbyImageData | undefined
      }
    }
    return undefined
  }, [src, data.allMarkdownRemark.nodes])

  return (
    <ThumbnailWrapper>
      <InnerWrapper>
        {image && (
          <GatsbyImage
            image={image}
            loading="eager"
            alt={alt ?? DEFAULT_ALT}
            imgStyle={{ aspectRatio: "16 / 9", width: "100%" }}
          />
        )}
      </InnerWrapper>
    </ThumbnailWrapper>
  )
}

export const ThumbnailWrapper = styled.div`
  position: relative;
  width: 100%;
  &::after {
    content: "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    background-color: var(--color-dimmed);
    transition: 0.3s ease;
  }
`

const InnerWrapper = styled.div`
  overflow: hidden;
`

export default React.memo(CenteredImg)
