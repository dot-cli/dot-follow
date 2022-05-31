import { Command } from '@oclif/core'

// eslint-disable-next-line node/no-missing-import
import { getUser, getReadme } from 'lib/github'
// eslint-disable-next-line node/no-missing-import
import { devLinks } from 'lib/links'
// eslint-disable-next-line node/no-missing-import
import { parseLinks } from 'lib/markdown'

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

    const excludeDevLinks: string[] = []
    if (user.twitter_username) {
      excludeDevLinks.push('twitter')
      this.log(`Twitter: twitter.com/${user.twitter_username}`)
    }
    if (user.blog) {
      excludeDevLinks.push('website')
      this.log(`Website: ${user.blog}`)
    }

    const readme = await getReadme(developer)
    if (readme) {
      const links = devLinks(parseLinks(readme), excludeDevLinks)
      for (const link of links) {
        this.log(`${link.title}: ${link.href}`)
      }
    }
  }
}
