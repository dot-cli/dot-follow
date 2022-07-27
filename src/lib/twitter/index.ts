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

export const saveAuthToken = async (token: TwitterAuthToken): Promise<void> => {
  setAuth(AuthKeys.TWITTER, token)
}

export const getAuthToken = async (): Promise<string | null> => {
  const twitterAuthToken = (await getAuth(AuthKeys.TWITTER)) as TwitterAuthToken
  return process.env.TWITTER_AUTH_TOKEN || twitterAuthToken?.access_token
}

export const getUser = async (
  username: string
): Promise<TwitterUser | null> => {
  try {
    const token = await getAuthToken()
    if (!token) {
      return null
    }
    const headers = { Authorization: `Bearer ${token}` }
    const fields = 'description,entities,id,name,url,username'
    const url = `https://api.twitter.com/2/users/by/username/${username}?user.fields=${fields}`
    const response = await axios.get(url, { headers })
    return mapResponseToUser(response?.data?.data)
  } catch (error) {
    if (error?.response?.status === 404 || error?.response?.status === 400) {
      return null
    }
    // console.log(error)
    throw error
  }
}
