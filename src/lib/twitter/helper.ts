import axios from 'axios'

import type { TwitterUser } from 'lib/types'
import { removeEmptyEntries } from 'lib/utils/obj'

import type {
  TwitterUserData,
  TwitterPaginatedData,
  PaginatedUsers
} from './types'

export const getPaginatedResponse = async (
  url: string,
  headers: Record<string, string>,
  nextToken?: string
): Promise<TwitterPaginatedData> => {
  const urlSymbol = url.indexOf('?') > 0 ? '&' : '?'
  const paginationParam = nextToken
    ? `${urlSymbol}pagination_token=${nextToken}`
    : ''
  const response = await axios.get(`${url}${paginationParam}`, { headers })
  return response.data
}

export const mapResponseToUser = (data: TwitterUserData): TwitterUser => {
  const { data: user, includes } = data
  const { description, url, entities } = user
  const { pinned_tweet_id: pinnedTweetId } = user

  // Unfurl URL
  const unfurledUrl = entities?.url?.urls?.find(
    (u: { url: string }) => u.url === url
  )?.expanded_url

  // Unfurl description
  let unfurledDescription = description
  for (const url of entities?.description?.urls || []) {
    if (url?.url && url?.expanded_url) {
      unfurledDescription = unfurledDescription?.replace(
        url.url,
        url.expanded_url
      )
    }
  }

  const pinnedTweet = pinnedTweetId
    ? includes?.tweets?.find((tweet) => tweet.id === pinnedTweetId)?.text
    : undefined

  return removeEmptyEntries({
    ...user,
    url: unfurledUrl || url,
    description: unfurledDescription,
    pinnedTweet
  }) as TwitterUser
}

export const getPaginatedUsers = async (
  url: string,
  headers: Record<string, string>,
  nextToken?: string
): Promise<PaginatedUsers> => {
  const users: TwitterUser[] = []

  const { data, meta } = await getPaginatedResponse(url, headers, nextToken)

  if (data?.length > 0) {
    users.push(
      ...data.map((user: TwitterUser) => mapResponseToUser({ data: user }))
    )
  }
  return { users, nextPageToken: meta?.next_token }
}
