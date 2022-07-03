export interface TwitterUserData {
  id: string
  username: string
  description: string
  url: string
  entities: {
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
