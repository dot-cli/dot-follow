import axios from 'axios'

import { AuthKeys, getAuth, setAuth } from 'lib/config'
import type { TwitterUser } from 'lib/types'

import { getPaginatedResponse, mapResponseToUser } from './helper'
import type { TwitterAuthToken, FollowingUserIds, Followers } from './types'

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
  setAuth(AuthKeys.TWITTER, token)
}

export const refreshAndSaveAuthToken = async (
  token: TwitterAuthToken | null
): Promise<TwitterAuthToken | null> => {
  const updatedToken = await refreshAuthToken(token?.refresh_token)
  if (updatedToken) {
    setAuth(AuthKeys.TWITTER, updatedToken)
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
    AuthKeys.TWITTER
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

export const getAuthUserId = async (): Promise<string | null> => {
  const headers = await getAuthHeaders()
  const url = `${BASE_API_URL}/users/me?user.fields=id`
  const response = await axios.get(url, { headers })
  return response?.data?.data?.id
}

export const getUser = async (
  username: string
): Promise<TwitterUser | null> => {
  try {
    const headers = await getAuthHeaders()
    const url = `${BASE_API_URL}/users/by/username/${username}?expansions=pinned_tweet_id&user.fields=${USER_FIELDS}`
    const response = await axios.get(url, { headers })
    if (response?.data?.errors) {
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

const getFollowingUserIdsByUserIdAndNextToken = async (
  userId: string,
  nextToken?: string
): Promise<FollowingUserIds> => {
  const followingUserIds: string[] = []

  const url = `${BASE_API_URL}/users/${userId}/following?user.fields=id&max_results=1000`
  const headers = await getAuthHeaders()
  const { data, meta } = await getPaginatedResponse(url, headers, nextToken)

  followingUserIds.push(...data.map((user: TwitterUser) => user.id))
  return { followingUserIds, nextPageToken: meta?.next_token }
}

export const getFollowingUserIdsByUserId = async (
  userId: string
): Promise<string[]> => {
  const followingUserIds: string[] = []
  let nextToken
  /* eslint-disable no-await-in-loop */
  do {
    const followingUserIdsData: FollowingUserIds =
      await getFollowingUserIdsByUserIdAndNextToken(userId, nextToken)
    followingUserIds.push(...followingUserIdsData.followingUserIds)
    nextToken = followingUserIdsData.nextPageToken
  } while (nextToken)
  /* eslint-enable no-await-in-loop */
  return followingUserIds
}

const getFollowersByUserIdAndNextToken = async (
  userId: string,
  nextToken?: string
): Promise<Followers> => {
  const followers: TwitterUser[] = []

  const url = `${BASE_API_URL}/users/${userId}/followers?user.fields=${USER_FIELDS}&max_results=1000`
  const headers = await getAuthHeaders()
  const { data, meta } = await getPaginatedResponse(url, headers, nextToken)

  followers.push(
    ...data.map((user: TwitterUser) => mapResponseToUser({ data: user }))
  )
  return { followers, nextPageToken: meta?.next_token }
}

export const getFollowersByUserId = async (
  userId: string
): Promise<TwitterUser[]> => {
  const followers: TwitterUser[] = []
  let nextToken
  /* eslint-disable no-await-in-loop */
  do {
    const followersData: Followers = await getFollowersByUserIdAndNextToken(
      userId,
      nextToken
    )
    followers.push(...followersData.followers)
    nextToken = followersData.nextPageToken
  } while (nextToken)
  /* eslint-enable no-await-in-loop */
  return followers
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
