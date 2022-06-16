import { Command } from '@oclif/core'

import { getUsers } from 'lib/github'
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
    const users = await getUsers(developer)
    const usernames = users.map((user) => user.login)

    // TODO Add promise pool to getUserDevLinks inside the loop
    // for faster but controlled performance & also enable no-await-in-loop
    /* eslint-disable no-await-in-loop */
    for (const username of usernames) {
      const devLinks = await getUserDevLinks(username)
      if (devLinks.length === 0) {
        continue
      }
      devLinksFound = true
      this.log(`\nDev links for ${username}:`)
      for (const link of devLinks) {
        this.log(`${link.title}: ${link.href}`)
      }
    }
    if (!devLinksFound) {
      this.log('Not found 🤷')
    }
  }
}
