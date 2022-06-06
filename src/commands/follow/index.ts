import { Command } from '@oclif/core'

// eslint-disable-next-line node/no-missing-import
import { getUser, getReadme } from 'lib/github'
// eslint-disable-next-line node/no-missing-import
import { parseDevLinks } from 'lib/links'
// eslint-disable-next-line node/no-missing-import
import { parseLinks } from 'lib/markdown'
// eslint-disable-next-line node/no-missing-import
import type { Link } from 'lib/types'

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

    // Add links from github & github readme
    const links: Link[] = []
    if (user.twitter_username) {
      links.push({
        href: `https://twitter.com/${user.twitter_username}`,
        title: 'Twitter'
      })
    }
    if (user.blog) {
      links.push({ href: user.blog, title: 'Website' })
    }
    const readme = await getReadme(developer)
    if (readme) {
      const readmeLinks = parseLinks(readme)
      links.push(...readmeLinks)
    }

    // Parse dev links & log them
    const devLinks = await parseDevLinks(links)
    for (const link of devLinks) {
      this.log(`${link.title}: ${link.href}`)
    }
  }
}
