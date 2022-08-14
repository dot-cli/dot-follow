export interface TwitterAuthToken {
  token_type: string // eslint-disable-line camelcase
  access_token: string // eslint-disable-line camelcase
  refresh_token: string // eslint-disable-line camelcase
  expires_at: string // eslint-disable-line camelcase
  scope: string
}

export interface TwitterUserData {
  id: string
  username: string
  description?: string
  url?: string
  entities?: {
    url: {
      urls: [
        {
          url: string
          expanded_url: string // eslint-disable-line camelcase
        }
      ]
    }
  }
}
