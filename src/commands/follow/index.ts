import { Command } from '@oclif/core'

// eslint-disable-next-line node/no-missing-import
import { getUser } from 'lib/github'

export default class Follow extends Command {
  static description = 'Follow a developer'

  static examples = ['$ oex follow chico']

  static args = [
    { name: 'developer', description: 'Developer to follow', required: true }
  ]

  async run(): Promise<void> {
    const {
      args: { developer }
    } = await this.parse(Follow)

    const user = await getUser(developer)
    if (!user) {
      this.log(`${developer} not found 🤷`)
      return
    }
    if (!user.twitter_username) {
      this.log(`${developer} has not twitter in their github profile 🤷`)
      return
    }
    this.log(`🐦 twitter.com/@${user.twitter_username}`)
  }
}
