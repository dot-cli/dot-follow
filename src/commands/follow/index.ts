import { Command } from '@oclif/core'

import { handleError } from 'lib/command'
import { Sites } from 'lib/constants'
import { getUsers as getGithubUsers } from 'lib/github'
import { getUserDevLinks, parseDevLinks } from 'lib/links'

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

  async catch(error: Error): Promise<void> {
    handleError(error)
  }

  async run(): Promise<void> {
    const {
      args: { developer }
    } = await this.parse(Follow)

    let devLinksFound = false
    let devLinkTwitterFound = false

    const githubUsers = await getGithubUsers(developer)
    const socialUsers = githubUsers.map((user) => ({
      type: Sites.Github.type,
      username: user.login
    }))

    // If socialUsers is empty (i.e. github user not found)
    // then revert to searching via Twitter instead
    if (socialUsers.length === 0) {
      socialUsers.push({
        type: Sites.Twitter.type,
        username: developer
      })
    }

    // TODO Add promise pool to getUserDevLinks inside the loop
    // for faster but controlled performance & also enable no-await-in-loop
    /* eslint-disable no-await-in-loop */
    for (const socialUser of socialUsers) {
      const devLinks = await getUserDevLinks(socialUser)
      if (devLinks.length === 0) {
        continue
      }
      devLinksFound = true

      devLinkTwitterFound = devLinks.some(
        (link) => link.title === Sites.Twitter.title
      )
      if (!devLinkTwitterFound) {
        const twitterDevLinks = await getUserDevLinks({
          type: Sites.Twitter.type,
          username: socialUser.username
        })
        devLinks.push(...twitterDevLinks)
      }

      this.log(`\nDev links for ${socialUser.username}:`)
      const parsedDevLinks = await parseDevLinks(devLinks)
      for (const link of parsedDevLinks) {
        this.log(`${link.title}: ${link.href}`)
      }
    }
    if (!devLinksFound) {
      this.log('Not found 🤷')
    }
  }
}
