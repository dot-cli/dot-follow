import { Command } from '@oclif/core'

import { handleError } from 'lib/command'
import { setupAuthToken as setupGithubAuthToken } from 'lib/github'
import { keypress, question } from 'lib/prompt'
import { getAuthURL, getAuthTokenByPin, saveAuthToken } from 'lib/twitter'
import { openUrl } from 'lib/url'

export default class Setup extends Command {
  static description = 'Setup'

  static examples = ['$ oex setup']

  async catch(error: Error): Promise<void> {
    handleError(error)
  }

  async run(): Promise<void> {
    await setupGithubAuthToken()

    await keypress('\nPress any key to setup auth for your Twitter account')
    openUrl(getAuthURL())
    const pin = await question({ message: 'Type in the PIN' })
    const token = await getAuthTokenByPin(pin)
    if (!token) {
      this.log('Something went wrong')
      return
    }
    saveAuthToken(token)
    this.log('Setup done')
  }
}
