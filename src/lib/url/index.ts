import open from 'open'

export const openUrl = async (url: string): Promise<void> => {
  await open(url)
}

export default { openUrl }
