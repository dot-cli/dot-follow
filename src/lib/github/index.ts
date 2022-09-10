import { graphql, GraphqlResponseError } from '@octokit/graphql'
import axios from 'axios'
// @ts-ignore
import ghauth from 'ghauth'
// @ts-ignore
import Github from 'github-api'

import { AuthKey, getAuth, setAuth } from 'lib/config'
import type { GithubUser } from 'lib/types'

import type { GithubAuthToken } from './types'

const perPage = 100 as const

export const getAuthTokenByOAuth = async (): Promise<string> => {
  const token = await ghauth({
    clientId: process.env.GITHUB_AUTH_CLIENT_ID || 'abacd0805b3167829f3b',
    scopes: ['read:user', 'user:follow'],
    noSave: true
  })
  return token
}

export const setupAuthToken = async (): Promise<void> => {
  const token = await getAuthTokenByOAuth()
  setAuth(AuthKey.GITHUB, token)
}

export const getAuthToken = async (): Promise<string | null> => {
  if (process.env.GITHUB_AUTH_TOKEN) {
    return process.env.GITHUB_AUTH_TOKEN
  }
  const githubAuthToken = (await getAuth(
    AuthKey.GITHUB
  )) as GithubAuthToken | null
  if (!githubAuthToken) {
    return null
  }
  return githubAuthToken.token
}

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAuthToken()
  if (!token) {
    return {}
  }
  return { Authorization: `Bearer ${token}` }
}

export const getUserProfile = async (): Promise<GithubUser> => {
  const token = await getAuthToken()
  const gh = new Github({ token })
  const { data: profile } = await gh.getUser().getProfile()
  return profile
}

export const followUser = async (username: string): Promise<void> => {
  const token = await getAuthToken()
  const gh = new Github({ token })
  await gh.getUser().follow(username)
}

export const getUser = async (username: string): Promise<GithubUser | null> => {
  try {
    const headers = await getAuthHeaders()
    const response = await axios.get(
      `https://api.github.com/users/${username}`,
      { headers }
    )
    return response.data
  } catch (error) {
    if (error?.response?.status === 404) {
      return null
    }
    throw error
  }
}

export const getUsersThatExist = async (
  usernames: string[]
): Promise<string[]> => {
  let users: GithubUser[] = []
  try {
    const headers = await getAuthHeaders()

    let query = '{'
    for (const [index, user] of usernames.entries()) {
      const login = user.replace(/_/g, '')
      query += `\nuser${index}: user(login: "${login}") { login name }`
    }
    query += '}'

    const data = await graphql(query, { headers })
    users = Object.values(data as Record<string, GithubUser>)
  } catch (error) {
    // GraphqlResponseError happens when some users aren't found,
    // but the users found are included in error.data
    if (error instanceof GraphqlResponseError && error.data) {
      users = Object.values(error.data)
    } else {
      throw error
    }
  }
  // Only return users who have a name
  return users
    .filter((user) => user?.login && user?.name)
    .map((user) => user.login)
}

export const getUsersByPage = async (
  path: string,
  page = 1
): Promise<GithubUser[]> => {
  const users: GithubUser[] = []
  try {
    const headers = await getAuthHeaders()
    const response = await axios.get(
      `https://api.github.com/users/${path}?per_page=${perPage}&page=${page}`,
      { headers }
    )
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

export const getUsers = async (path: string): Promise<GithubUser[]> => {
  const users: GithubUser[] = []
  let page = 1
  let hasMoreUsers = true
  /* eslint-disable no-await-in-loop */
  while (hasMoreUsers) {
    const usersByPage = await getUsersByPage(path, page++)
    users.push(...usersByPage)
    hasMoreUsers = usersByPage.length === perPage
  }
  /* eslint-enable no-await-in-loop */
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

export const resolveCompanyHandles = (
  company: string | undefined
): string | undefined => {
  if (!company) {
    return company
  }
  return company.replace(/@/g, 'https://github.com/')
}
