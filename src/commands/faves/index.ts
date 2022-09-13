import { Command, Flags } from '@oclif/core'
import { setTimeout } from 'timers/promises'

import { handleError, findDevelopersToFollowByFaves } from 'lib/command'

// 1 hour delay between runs when running in the background
const TIMEOUT = 60 * 60 * 1000

export default class Faves extends Command {
  static description = 'Faves'

  static examples = ['$ oex faves']

  static flags = {
    runInBackground: Flags.boolean({ char: 'b' })
  }

  async catch(error: Error): Promise<void> {
    handleError(error)
  }

  async run(): Promise<void> {
    const {
      flags: { runInBackground }
    } = await this.parse(Faves)

    /* eslint-disable no-await-in-loop */
    do {
      console.log('\nScanning...')
      const silent = runInBackground
      await findDevelopersToFollowByFaves(runInBackground, silent)
      console.log('\nScan finished')
      if (runInBackground) {
        await setTimeout(TIMEOUT)
      }
      /* eslint-disable no-unmodified-loop-condition */
    } while (runInBackground)
    /* eslint-enable no-await-in-loop */
  }
}
