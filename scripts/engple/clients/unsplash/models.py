from pydantic import BaseModel, HttpUrl, Field, ConfigDict
from typing import Optional, Generic, TypeVar
from datetime import datetime


class UserProfileImage(BaseModel):
    small: HttpUrl
    medium: HttpUrl
    large: HttpUrl


class UserLinks(BaseModel):
    self: HttpUrl
    html: HttpUrl
    photos: HttpUrl


class User(BaseModel):
    id: str
    username: str
    name: str
    first_name: str | None = None
    last_name: str | None = None
    instagram_username: str | None = None
    twitter_username: str | None = None
    portfolio_url: HttpUrl | None = None
    profile_image: UserProfileImage
    links: UserLinks


class Urls(BaseModel):
    raw: HttpUrl
    full: HttpUrl
    regular: HttpUrl
    small: HttpUrl
    thumb: HttpUrl


class PhotoLinks(BaseModel):
    self: HttpUrl
    html: HttpUrl
    download: HttpUrl


class Photo(BaseModel):
    id: str
    created_at: datetime
    width: int
    height: int
    color: str
    blur_hash: str
    description: Optional[str] = None
    user: User
    current_user_collections: list = Field(default_factory=list)
    urls: Urls
    links: PhotoLinks
    updated_at: Optional[datetime] = None
    promoted_at: Optional[datetime] = None


class SearchPhotosResponse(BaseModel):
    total: int
    total_pages: int
    results: list[Photo]


class UnleashHeader(BaseModel):
    x_ratelimit_limit: int = Field(alias="X-Ratelimit-Limit", default=0)
    x_ratelimit_remaining: int = Field(alias="X-Ratelimit-Remaining", default=0)

    model_config = ConfigDict(
        extra="ignore",
    )


T = TypeVar("T")


class UnsplashResponse(BaseModel, Generic[T]):
    headers: UnleashHeader
    data: T
