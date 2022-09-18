import { Command } from '@oclif/core'

import { processUsersInTheBackground } from 'lib/buildinpublic'
import { handleError } from 'lib/command'
import { getAuthUserId as getTwitterAuthUserId } from 'lib/twitter'

export default class BuildInPublic extends Command {
  static description = 'Build In Public'

  static examples = ['$ oex buildinpublic']

  async catch(error: Error): Promise<void> {
    handleError(error)
  }

  async run(): Promise<void> {
    const twitterUserId = await getTwitterAuthUserId()
    if (!twitterUserId) {
      this.log('Please run setup first')
      return
    }

    processUsersInTheBackground()
  }
}
