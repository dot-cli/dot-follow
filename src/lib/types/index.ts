export interface GithubUser {
  login: string
  name: string
  bio?: string
  blog?: string
  twitter_username?: string // eslint-disable-line camelcase
}

export interface Link {
  href: string
  title: string
}
