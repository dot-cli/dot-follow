export enum SiteType {
  Website = 'website',
  Blog = 'blog',
  Github = 'github',
  Gitlab = 'gitlab',
  Twitter = 'twitter',
  Linkedin = 'linkedin',
  Devto = 'devto',
  Youtube = 'youtube',
  Twitch = 'twitch',
  Instagram = 'instagram'
}

export interface SocialUser {
  type: SiteType
  username: string
}

export interface GithubUser {
  login: string
  name?: string
  bio?: string
  blog?: string
  twitter_username?: string // eslint-disable-line camelcase
}

export interface Site {
  type: SiteType
  title: string
  urlPrefix?: string
}

export interface Link {
  href: string
  title: string
  isSocialLink?: boolean
}
