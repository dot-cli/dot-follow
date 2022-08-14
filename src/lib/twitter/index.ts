import axios from 'axios'

import { AuthKeys, getAuth, setAuth } from 'lib/config'
import type { TwitterUser } from 'lib/types'

import type { TwitterAuthToken, TwitterUserData } from './types'

const AUTH_URL_DEFAULT_PREFIX =
  'https://dot-follow-twitter-auth-production.up.railway.app/twitter'

export const AUTH_URL =
  process.env.TWITTER_AUTH_URL || `${AUTH_URL_DEFAULT_PREFIX}/auth`

export const AUTH_PIN_URL =
  process.env.TWITTER_AUTH_PIN_URL || `${AUTH_URL_DEFAULT_PREFIX}/token?pin=`

export const AUTH_REFRESH_TOKEN_URL =
  process.env.TWITTER_AUTH_REFRESH_TOKEN_URL ||
  `${AUTH_URL_DEFAULT_PREFIX}/refreshToken?refreshToken=`

const mapResponseToUser = (data: TwitterUserData) => {
  if (!data) {
    return null
  }
  const { id, username, description, url, entities } = data
  const unfurledUrl = entities?.url?.urls?.find(
    (u: { url: string }) => u.url === url
  )?.expanded_url
  return { id, username, description, url: unfurledUrl || url }
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
  const url = 'https://api.twitter.com/2/users/me?user.fields=id'
  const response = await axios.get(url, { headers })
  return response?.data?.data?.id
}

export const getUser = async (
  username: string
): Promise<TwitterUser | null> => {
  try {
    const headers = await getAuthHeaders()
    const fields = 'description,entities,id,name,url,username'
    const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=${fields}`
    const response = await axios.get(url, { headers })
    return mapResponseToUser(response?.data?.data)
  } catch (error) {
    if (error?.response?.status === 404 || error?.response?.status === 400) {
      return null
    }
    throw error
  }
}

export const followUser = async (username: string): Promise<void> => {
  const userId = await getAuthUserId()
  const userToFollow = await getUser(username)
  if (!userId || !userToFollow) {
    return
  }
  const headers = await getAuthHeaders()
  const url = `https://api.twitter.com/2/users/${userId}/following`
  const data = { target_user_id: userToFollow.id }
  await axios.post(url, data, { headers })
}
