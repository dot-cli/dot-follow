import axios from 'axios'

// eslint-disable-next-line node/no-missing-import
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
