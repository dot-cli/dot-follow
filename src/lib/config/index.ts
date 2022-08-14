import appConfig from 'application-config'

// On OSX: ~/Library/Application\ Support/dot-follow/config.json
// See https://github.com/LinusU/node-application-config#config-location
const config = appConfig('dot-follow')

enum Keys {
  AUTH = 'auth'
}

export enum AuthKeys {
  TEST = 'test',
  TWITTER = 'twitter',
  GITHUB = 'github'
}

const getData = async (): Promise<Record<string, any>> => {
  return ((await config.read()) as Record<string, any>) || {}
}

const getAuthValue = async (): Promise<Record<string, any>> => {
  return ((await getValue(Keys.AUTH)) || {}) as Record<string, any>
}

export const getValue = async (key: string): Promise<unknown> => {
  const configData = await getData()
  return configData[key]
}

export const setValue = async (key: string, value: unknown): Promise<void> => {
  const configData = await getData()
  configData[key] = value
  await config.write(configData)
}

export const getAuth = async (key: AuthKeys): Promise<unknown> => {
  const auth = await getAuthValue()
  return auth[key]
}

export const setAuth = async (key: AuthKeys, value: unknown): Promise<void> => {
  const auth = await getAuthValue()
  auth[key] = value
  await setValue(Keys.AUTH, auth)
}
