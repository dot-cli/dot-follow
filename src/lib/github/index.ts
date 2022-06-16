import axios from 'axios'

import type { GithubUser } from 'lib/types'

export const getUser = async (username: string): Promise<GithubUser | null> => {
  try {
    const response = await axios.get(`https://api.github.com/users/${username}`)
    return response.data
  } catch (error) {
    if (error?.response?.status === 404) {
      return null
    }
    throw error
  }
}

export const getUsers = async (path: string): Promise<GithubUser[]> => {
  const users: GithubUser[] = []
  try {
    const response = await axios.get(`https://api.github.com/users/${path}`)
    if (Array.isArray(response.data)) {
      for (let i = 0; i < response.data.length; i++) {
        users.push(response.data[i])
      }
    } else {
      users.push(response.data)
    }
  } catch (error) {
    if (error?.response?.status !== 404) {
      throw error
    }
  }
  return users
}

export const getReadme = async (username: string): Promise<string | null> => {
  const readmeURL = `https://raw.githubusercontent.com/${username}/${username}/master/README.md`
  try {
    const response = await axios.get(readmeURL)
    return response.data
  } catch (error) {
    if (error.response?.status === 404) {
      return null
    }
    throw error
  }
}
