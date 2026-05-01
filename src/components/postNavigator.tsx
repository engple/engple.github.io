import React from "react"

import { Link } from "gatsby"
import { styled } from "styled-components"

import type Post from "../types/Post"

interface PostNavigatorProps {
  prevPost?: Post
  nextPost?: Post
}

const PostNavigator: React.FC<PostNavigatorProps> = ({
  prevPost,
  nextPost,
}) => {
  return (
    <Container aria-label="이전 다음 글">
      {nextPost ? (
        <NavigationCard
          description={nextPost.desc}
          direction="이전 글"
          post={nextPost}
        />
      ) : (
        <EmptyState aria-hidden="true" />
      )}
      {prevPost ? (
        <NavigationCard
          description={prevPost.desc}
          direction="다음 글"
          post={prevPost}
        />
      ) : (
        <EmptyState aria-hidden="true" />
      )}
    </Container>
  )
}

const NavigationCard = ({
  direction,
  post,
  description,
}: {
  direction: string
  post: Post
  description?: string | null
}) => {
  return (
    <CardLink to={post.slug as string}>
      <Card>
        {post.thumbnail ? (
          <Thumbnail
            alt={post.alt || post.title || ""}
            loading="lazy"
            src={post.thumbnail}
          />
        ) : (
          <ThumbnailFallback />
        )}
        <CardContent>
          <MetaRow>
            <Direction>{direction}</Direction>
            {post.category ? <Category>{post.category}</Category> : undefined}
          </MetaRow>
          <Title>{post.title}</Title>
          {description ? <Description>{description}</Description> : undefined}
        </CardContent>
      </Card>
    </CardLink>
  )
}

const Container = styled.nav`
  width: var(--post-width);
  margin: 0 auto var(--padding-sm);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--padding-sm);

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    width: 100%;
    padding: 0 var(--padding-sm);
    grid-template-columns: 1fr;
  }
`

const CardLink = styled(Link)`
  display: block;
  min-width: 0;

  &:hover,
  &:focus {
    text-decoration: none;
  }
`

const Card = styled.article`
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  min-height: 100%;
  overflow: hidden;
  border: 1px solid var(--color-gray-2);
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    var(--color-card) 0%,
    var(--color-gray-1) 100%
  );
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  ${CardLink}:hover &,
  ${CardLink}:focus & {
    transform: translateY(-2px);
    border-color: var(--color-gray-3);
    box-shadow: 0 18px 36px rgba(15, 23, 42, 0.1);
  }

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    grid-template-columns: 96px minmax(0, 1fr);
  }
`

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  background-color: var(--color-gray-1);
`

const ThumbnailFallback = styled.div`
  min-height: 100%;
  background:
    radial-gradient(
      circle at top left,
      rgba(10, 132, 255, 0.18),
      transparent 55%
    ),
    linear-gradient(180deg, var(--color-gray-1) 0%, var(--color-gray-2) 100%);
`

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  min-width: 0;
  padding: 16px 18px;
`

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const Direction = styled.span`
  color: var(--color-text-3);
  font-size: 0.75rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
`

const Category = styled.span`
  color: var(--color-text-3);
  font-size: 0.8125rem;
  font-weight: var(--font-weight-medium);
  line-height: 1.4;
`

const Title = styled.h2`
  font-size: 1.05rem;
  font-weight: var(--font-weight-bold);
  line-height: 1.45;
`

const Description = styled.p`
  color: var(--color-text-2);
  font-size: 0.875rem;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const EmptyState = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.device.sm}) {
    display: none;
  }
`

export default PostNavigator
