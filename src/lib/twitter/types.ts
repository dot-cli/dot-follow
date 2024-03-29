import type { TwitterUser } from 'lib/types'

export interface TwitterAuthToken {
  token_type: string // eslint-disable-line camelcase
  access_token: string // eslint-disable-line camelcase
  refresh_token: string // eslint-disable-line camelcase
  expires_at: string // eslint-disable-line camelcase
  scope: string
}

export interface TwitterUserData {
  data: TwitterUser
  includes?: {
    tweets?: [
      {
        id: string
        text: string
      }
    ]
  }
}

export interface PaginatedUsers {
  users: TwitterUser[]
  nextPageToken?: string
}

export interface PaginatedLists {
  lists: TwitterList[]
  nextPageToken?: string
}

export interface TwitterPaginatedData {
  data: any
  meta: any
}

export interface TwitterList {
  id: string
  name?: string
}
