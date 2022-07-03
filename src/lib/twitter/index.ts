import axios from 'axios'

import type { TwitterUser } from 'lib/types'

import type { TwitterUserData } from './types'

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

export const getUser = async (
  token: string,
  username: string
): Promise<TwitterUser | null> => {
  try {
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
