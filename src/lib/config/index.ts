import appConfig from 'application-config'

// see https://github.com/LinusU/node-application-config#config-location
const config = appConfig('dot-follow')

const getData = async (): Promise<Record<string, any>> => {
  return ((await config.read()) as Record<string, any>) || {}
}

export const getValue = async (key: string): Promise<string> => {
  const configData = await getData()
  return configData[key]
}

export const setValue = async (key: string, value: string): Promise<void> => {
  const configData = await getData()
  configData[key] = value
  await config.write(configData)
}
