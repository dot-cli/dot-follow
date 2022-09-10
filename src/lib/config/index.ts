import appConfig from 'application-config'

import { Keys, AuthKey, FollowingKey } from './types'
import type { Following } from './types'

// On OSX: ~/Library/Application\ Support/dot-follow/config.json
// See https://github.com/LinusU/node-application-config#config-location
const config = appConfig('dot-follow')

const getData = async (): Promise<Record<string, any>> => {
  return ((await config.read()) as Record<string, any>) || {}
}

const getAuthValue = async (): Promise<Record<string, any>> => {
  return ((await getValue(Keys.AUTH)) || {}) as Record<string, any>
}

const getFollowingValue = async (): Promise<Record<string, any>> => {
  return ((await getValue(Keys.FOLLOWING)) || {}) as Record<string, any>
}

export { Keys, AuthKey, FollowingKey }

export const getValue = async (key: string): Promise<unknown> => {
  const configData = await getData()
  return configData[key]
}

export const setValue = async (key: string, value: unknown): Promise<void> => {
  const configData = await getData()
  configData[key] = value
  await config.write(configData)
}

export const getAuth = async (key: AuthKey): Promise<unknown> => {
  const auth = await getAuthValue()
  return auth[key]
}

export const setAuth = async (key: AuthKey, value: unknown): Promise<void> => {
  const auth = await getAuthValue()
  auth[key] = value
  await setValue(Keys.AUTH, auth)
}

export const getFollowing = async (
  key: FollowingKey
): Promise<Following | null> => {
  const following = await getFollowingValue()
  return following[key]
}

export const setFollowing = async (
  key: FollowingKey,
  value: Following
): Promise<void> => {
  const following = await getFollowingValue()
  following[key] = value
  await setValue(Keys.FOLLOWING, following)
}
