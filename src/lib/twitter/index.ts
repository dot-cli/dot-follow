import axios from 'axios'
import { setTimeout } from 'timers/promises'

import { AuthKey, getAuth, setAuth } from 'lib/config'
import type { TwitterUser } from 'lib/types'

import {
  getPaginatedResponse,
  mapResponseToUser,
  getPaginatedUsers
} from './helper'
import type {
  TwitterAuthToken,
  PaginatedUsers,
  PaginatedLists,
  TwitterList
} from './types'

const AUTH_URL_DEFAULT_PREFIX =
  'https://dot-follow-twitter-auth-production.up.railway.app/twitter'

export const BASE_API_URL = 'https://api.twitter.com/2'

export const AUTH_URL =
  process.env.TWITTER_AUTH_URL || `${AUTH_URL_DEFAULT_PREFIX}/auth`

export const AUTH_PIN_URL =
  process.env.TWITTER_AUTH_PIN_URL || `${AUTH_URL_DEFAULT_PREFIX}/token?pin=`

export const AUTH_REFRESH_TOKEN_URL =
  process.env.TWITTER_AUTH_REFRESH_TOKEN_URL ||
  `${AUTH_URL_DEFAULT_PREFIX}/refreshToken?refreshToken=`

export const USER_FIELDS =
  'id,username,name,description,url,protected,verified,public_metrics,pinned_tweet_id,entities'

export const TWITTER_ERRORS = {
  NotFound: 'Not Found Error',
  Forbidden: 'Forbidden'
}

export const TWITTER_NOT_AUTHORIZED_ERRORS = {
  notAuthorizedForTweet: {
    type: 'https://api.twitter.com/2/problems/not-authorized-for-resource',
    resource_type: 'tweet'
  }
}

export const isNotAuthorizedTweetError = (errors: any[]): boolean => {
  return (
    errors?.length === 1 &&
    errors[0].type ===
      TWITTER_NOT_AUTHORIZED_ERRORS.notAuthorizedForTweet.type &&
    errors[0].resource_type ===
      TWITTER_NOT_AUTHORIZED_ERRORS.notAuthorizedForTweet.resource_type
  )
}

export const getAuthURL = (): string => {
  return AUTH_URL
}

export const getAuthTokenByPin = async (
  pin: string
): Promise<TwitterAuthToken | null> => {
  try {
    const url = `${AUTH_PIN_URL}${pin}`
    const response = await axios.get(url)
    return response?.data?.token
  } catch (error) {
    if (error?.response?.status === 404 || error?.response?.status === 400) {
      return null
    }
    throw error
  }
}

export const refreshAuthToken = async (
  refreshToken: string | undefined
): Promise<TwitterAuthToken | null> => {
  if (!refreshToken) {
    return null
  }
  const url = `${AUTH_REFRESH_TOKEN_URL}${refreshToken}`
  const response = await axios.get(url)
  return response?.data?.token
}

export const saveAuthToken = async (token: TwitterAuthToken): Promise<void> => {
  setAuth(AuthKey.TWITTER, token)
}

export const refreshAndSaveAuthToken = async (
  token: TwitterAuthToken | null
): Promise<TwitterAuthToken | null> => {
  const updatedToken = await refreshAuthToken(token?.refresh_token)
  if (updatedToken) {
    setAuth(AuthKey.TWITTER, updatedToken)
  }
  return updatedToken
}

export const hasAuthTokenExpired = (
  twitterAuthToken: TwitterAuthToken | null
): boolean => {
  if (!twitterAuthToken || !twitterAuthToken.expires_at) {
    return false
  }
  return Date.now() >= new Date(twitterAuthToken.expires_at).getTime()
}

export const getAuthToken = async (): Promise<string | null> => {
  if (process.env.TWITTER_AUTH_TOKEN) {
    return process.env.TWITTER_AUTH_TOKEN
  }
  let twitterAuthToken = (await getAuth(
    AuthKey.TWITTER
  )) as TwitterAuthToken | null
  if (hasAuthTokenExpired(twitterAuthToken)) {
    twitterAuthToken = await refreshAndSaveAuthToken(twitterAuthToken)
  }
  if (!twitterAuthToken) {
    return null
  }
  return twitterAuthToken.access_token
}

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken()
  if (!token) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

export const getAuthUser = async (
  userFields = USER_FIELDS
): Promise<TwitterUser | null> => {
  const headers = await getAuthHeaders()
  const url = `${BASE_API_URL}/users/me?user.fields=${userFields}`
  const response = await axios.get(url, { headers })
  return mapResponseToUser(response?.data)
}

export const getAuthUserId = async (): Promise<string | undefined> => {
  const user = await getAuthUser('id')
  return user?.id
}

export const getUser = async (
  username: string
): Promise<TwitterUser | null> => {
  try {
    const headers = await getAuthHeaders()
    const url = `${BASE_API_URL}/users/by/username/${username}?expansions=pinned_tweet_id&user.fields=${USER_FIELDS}`
    const response = await axios.get(url, { headers })
    if (
      response?.data?.errors &&
      !isNotAuthorizedTweetError(response?.data?.errors)
    ) {
      const knownErrors = new Set(Object.values(TWITTER_ERRORS))
      if (
        response?.data?.errors.find((error: any) =>
          knownErrors.has(error?.title)
        )
      ) {
        return null
      }
      throw new Error(response?.data?.errors[0])
    }
    return mapResponseToUser(response?.data)
  } catch (error) {
    if (error?.response?.status === 404 || error?.response?.status === 400) {
      return null
    }
    throw error
  }
}

export const getPaginatedUsersByUrl = async (
  url: string,
  maxResults?: number | undefined
): Promise<TwitterUser[]> => {
  const headers = await getAuthHeaders()
  const users: TwitterUser[] = []
  let nextToken
  /* eslint-disable no-await-in-loop */
  do {
    const data: PaginatedUsers = await getPaginatedUsers(
      url,
      headers,
      nextToken
    )
    users.push(...data.users)
    nextToken = data.nextPageToken
    /* eslint-disable no-unmodified-loop-condition */
  } while (nextToken && (!maxResults || users.length < maxResults))
  /* eslint-enable no-await-in-loop */

  return maxResults && users.length > maxResults
    ? users.slice(0, maxResults)
    : users
}

export const getFollowingUserIdsByUserId = async (
  userId: string,
  maxResults?: number | undefined
): Promise<string[]> => {
  const maxResultsParam = maxResults && maxResults < 1000 ? maxResults : '1000'
  const url = `${BASE_API_URL}/users/${userId}/following?user.fields=id,username&max_results=${maxResultsParam}`
  const users = await getPaginatedUsersByUrl(url, maxResults)
  return users.map((user) => user.id)
}

export const getFollowingByUserId = async (
  userId: string,
  maxResults?: number | undefined
): Promise<TwitterUser[]> => {
  const maxResultsParam = maxResults && maxResults < 1000 ? maxResults : '1000'
  const url = `${BASE_API_URL}/users/${userId}/following?user.fields=${USER_FIELDS}&max_results=${maxResultsParam}`
  return getPaginatedUsersByUrl(url, maxResults)
}

export const getFollowersByUserId = async (
  userId: string
): Promise<TwitterUser[]> => {
  const url = `${BASE_API_URL}/users/${userId}/followers?user.fields=${USER_FIELDS}&max_results=1000`
  return getPaginatedUsersByUrl(url)
}

export const followUser = async (username: string): Promise<void> => {
  const userId = await getAuthUserId()
  const userToFollow = await getUser(username)
  if (!userId || !userToFollow) {
    return
  }
  const headers = await getAuthHeaders()
  const url = `${BASE_API_URL}/users/${userId}/following`
  const data = { target_user_id: userToFollow.id }
  await axios.post(url, data, { headers })
}

const getListsByNextToken = async (
  userId: string,
  headers: Record<string, string>,
  nextToken?: string
): Promise<PaginatedLists> => {
  const lists: TwitterList[] = []

  const url = `${BASE_API_URL}/users/${userId}/owned_lists`
  const { data, meta } = await getPaginatedResponse(url, headers, nextToken)

  lists.push(...data)
  return { lists, nextPageToken: meta?.next_token }
}

export const getLists = async (): Promise<TwitterList[]> => {
  const userId = await getAuthUserId()
  const headers = await getAuthHeaders()
  const lists: TwitterList[] = []
  if (!userId) {
    return lists
  }
  let nextToken
  /* eslint-disable no-await-in-loop */
  do {
    const data: PaginatedLists = await getListsByNextToken(
      userId,
      headers,
      nextToken
    )
    lists.push(...data.lists)
    nextToken = data.nextPageToken
  } while (nextToken)
  /* eslint-enable no-await-in-loop */
  return lists
}

export const getListMembers = async (
  listId: string
): Promise<TwitterUser[]> => {
  const url = `${BASE_API_URL}/lists/${listId}/members`
  return getPaginatedUsersByUrl(url)
}

export const pinList = async (listId: string): Promise<void> => {
  const userId = await getAuthUserId()
  const headers = await getAuthHeaders()
  const url = `${BASE_API_URL}/users/${userId}/pinned_lists`
  const data = { list_id: listId }
  await axios.post(url, data, { headers })
}

export const createList = async (
  name: string,
  pinIt = true
): Promise<TwitterList> => {
  const headers = await getAuthHeaders()
  const url = `${BASE_API_URL}/lists`
  const data = { name, private: true }
  const response = await axios.post(url, data, { headers })
  if (!response?.data?.data) {
    throw new Error(`Failed to create ${name} Twitter list`)
  }
  if (pinIt) {
    await pinList(response.data.data.id)
  }
  return response.data.data
}

export const getOrCreateList = async (name: string): Promise<TwitterList> => {
  const lists = await getLists()
  const list = lists.find((item) => item.name === name)
  if (list) {
    return list
  }
  return createList(name)
}

// Due to rate limits, only one member will be added every 5 seconds
export const addUsersToList = async (
  listId: string,
  users: TwitterUser[],
  delayBetweenRequests = 5000
): Promise<void> => {
  const headers = await getAuthHeaders()
  const url = `${BASE_API_URL}/lists/${listId}/members`
  /* eslint-disable no-await-in-loop */
  for (const user of users) {
    const data = { user_id: user.id }
    await axios.post(url, data, { headers })
    await setTimeout(delayBetweenRequests)
  }
  /* eslint-enable no-await-in-loop */
}

export const addUsersToListByName = async (
  listName: string,
  users: TwitterUser[],
  delayBetweenRequests = 5000
): Promise<TwitterList> => {
  const list = await getOrCreateList(listName)

  // Get users in Devs list & filter them out from users to be added
  const usersInList = await getListMembers(list.id)
  const usernamesInList = new Set(usersInList.map((user) => user.username))
  const usersToAdd = users.filter((user) => !usernamesInList.has(user.username))

  await addUsersToList(list.id, usersToAdd, delayBetweenRequests)

  return list
}
