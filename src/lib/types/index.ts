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
  company?: string
  bio?: string
  blog?: string
  twitter_username?: string // eslint-disable-line camelcase
  followers?: number
  following?: number
}

export interface TwitterUser {
  id: string
  username: string
  name: string
  description?: string
  url?: string
  protected?: boolean
  verified?: boolean
  pinned_tweet_id?: string // eslint-disable-line camelcase
  pinnedTweet?: string
  public_metrics?: // eslint-disable-line camelcase
  {
    followers_count?: number // eslint-disable-line camelcase
    following_count?: number // eslint-disable-line camelcase
    tweet_count?: number // eslint-disable-line camelcase
  }
  entities?: {
    url?: {
      urls: [
        {
          url: string
          expanded_url: string // eslint-disable-line camelcase
        }
      ]
    }
    description?: {
      urls: [
        {
          url: string
          expanded_url: string // eslint-disable-line camelcase
        }
      ]
    }
  }
}

export interface Site {
  type: SiteType
  title: string
  urlPrefix?: string
}

export interface Link {
  href: string
  title: string
  username?: string
  isSocialLink?: boolean
}
