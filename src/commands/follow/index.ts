import { Command } from '@oclif/core'

import { Sites } from 'lib/constants'
import { getUsers as getGithubUsers } from 'lib/github'
import { getUserDevLinks } from 'lib/links'

export default class Follow extends Command {
  static description = 'Follow developers'

  static examples = ['$ oex follow chico', '$ oex follow chico/following']

  static args = [
    {
      name: 'developer',
      description: 'Developer(s) to follow, e.g. chico or chico/following',
      required: true
    }
  ]

  async run(): Promise<void> {
    const {
      args: { developer }
    } = await this.parse(Follow)

    let devLinksFound = false

    const githubUsers = await getGithubUsers(developer)
    const socialUsers = githubUsers.map((user) => ({
      type: Sites.Github.type,
      username: user.login
    }))

    // TODO Add promise pool to getUserDevLinks inside the loop
    // for faster but controlled performance & also enable no-await-in-loop
    /* eslint-disable no-await-in-loop */
    for (const socialUser of socialUsers) {
      const devLinks = await getUserDevLinks(socialUser)
      if (devLinks.length === 0) {
        continue
      }
      devLinksFound = true
      this.log(`\nDev links for ${socialUser.username}:`)
      for (const link of devLinks) {
        this.log(`${link.title}: ${link.href}`)
      }
    }
    if (!devLinksFound) {
      this.log('Not found 🤷')
    }
  }
}
