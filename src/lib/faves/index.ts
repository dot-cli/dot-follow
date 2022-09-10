import appConfig from 'application-config'

import { Fave, FaveType } from './types'

// On OSX: ~/Library/Application\ Support/dot-follow-faves/config.json
// See https://github.com/LinusU/node-application-config#config-location
const config = appConfig('dot-follow-faves')

const getData = async (): Promise<Record<string, any>> => {
  return ((await config.read()) as Record<string, any>) || {}
}

export * from './types'

export const getFave = async (
  type: FaveType,
  key: string
): Promise<Fave | null> => {
  const configData = await getData()
  const configDataByType = configData[type]
  if (!configDataByType) {
    return null
  }
  const fave = configData[type][key]
  if (!fave) {
    return null
  }
  return {
    key,
    ...fave
  } as Fave
}

export const setFave = async (type: FaveType, fave: Fave): Promise<void> => {
  const configData = await getData()
  const configDataByType = configData[type] || {}
  // Create faveValue, which excludes key
  const { key, ...faveValue } = fave
  configDataByType[key] = faveValue
  configData[type] = configDataByType
  await config.write(configData)
}

// TODO Fave usernames should be fetched from the config
export const getFaveUsernames = async (type: FaveType): Promise<string[]> => {
  if (type === FaveType.Twitter) {
    return [
      'clidevs',
      'loige',
      'PadraigOBrien',
      'alexdotjs',
      'codestackr',
      'tonyennis',
      'rjrodger',
      'alexarena',
      'eoins',
      'whelton',
      'yongfook',
      'jherr',
      'romefort'
    ]
  }
  return []
}

// TODO Fave usernames should be set in the config at setup
// export const setFaveUsernames = async (
//   type: FaveType,
//   usernames: string[]
// ): Promise<void> => {
//   // TODO Implement
// }
