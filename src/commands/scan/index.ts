import { Command } from '@oclif/core'

import { Sites } from 'lib/constants'
import {
  getUserProfile as getGithubUserProfile,
  getUsers as getGithubUsers,
  followUser as followGithubUser,
  resolveCompanyHandles
} from 'lib/github'
import {
  getUserDevLinks,
  parseDevLinks,
  getTwitterUsernameFromDevLinks
} from 'lib/links'
import { confirm } from 'lib/prompt'
import {
  getUser as getTwitterUser,
  followUser as followTwitterUser
} from 'lib/twitter'

const log = (obj: Record<string, any>): void => {
  for (const key in obj) {
    if (obj[key] || typeof obj[key] === 'boolean') {
      const keyName = `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`
      console.log(`\t${keyName}: ${obj[key]}`)
    }
  }
}

export default class Setup extends Command {
  static description = 'Scan'

  static examples = ['$ oex scan']

  async catch(error: Error): Promise<void> {
    if (error?.message) {
      // TODO Log errors in red
      this.log(`Error: ${error.message}`)
    }
    // TODO Only do console.error when verbose is true & is supported?
    console.error(error)
    throw error
  }

  async run(): Promise<void> {
    const { login } = await getGithubUserProfile()

    const githubFollowers = await getGithubUsers(`${login}/followers`)
    const githubFollowing = await getGithubUsers(`${login}/following`)
    const githubFollowerLogins = githubFollowers.map((user) => user.login)
    const githubFollowingLogins = new Set(
      githubFollowing.map((user) => user.login)
    )
    const githubUsersToFollow = githubFollowerLogins.filter(
      (login) => !githubFollowingLogins.has(login)
    )

    if (githubUsersToFollow.length > 0) {
      this.log(
        `Found ${githubUsersToFollow.length} Github user${
          githubUsersToFollow.length > 1 ? 's' : ''
        } to review`
      )
      /* eslint-disable no-await-in-loop */
      for (const login of githubUsersToFollow) {
        this.log(`\nScanning ${login}...`)

        // Get dev links based on github username
        const devLinks = await getUserDevLinks({
          type: Sites.Github.type,
          username: login
        })

        let twitterUsername = getTwitterUsernameFromDevLinks(devLinks)
        const twitterDevLinks = await getUserDevLinks({
          type: Sites.Twitter.type,
          username: twitterUsername || login
        })
        devLinks.push(...twitterDevLinks)

        // Log dev links
        const parsedDevLinks = await parseDevLinks(devLinks)
        for (const link of parsedDevLinks) {
          this.log(`${link.title}: ${link.href}`)

          if (link.title === Sites.Github.title) {
            const githubUsers = await getGithubUsers(login)
            const { name, company, blog, bio, followers, following } =
              githubUsers[0]
            log({
              name,
              company: resolveCompanyHandles(company),
              blog,
              bio,
              followers,
              following
            })
          } else if (link.title === Sites.Twitter.title && link.username) {
            const {
              name,
              url,
              public_metrics, // eslint-disable-line camelcase
              protected: protectedFlag,
              verified,
              description,
              pinnedTweet
            } = (await getTwitterUser(link.username)) || {}
            log({
              name,
              url,
              followers: public_metrics?.followers_count,
              following: public_metrics?.following_count,
              tweetAndRetweets: public_metrics?.tweet_count,
              protected: protectedFlag,
              verified,
              description,
              pinnedTweet
            })
          }
        }

        const isFollowConfirmed = await confirm(`Follow ${login}?`)
        if (isFollowConfirmed) {
          followGithubUser(login)

          // Refetch twitter username from dev links if not already known
          if (!twitterUsername) {
            twitterUsername = getTwitterUsernameFromDevLinks(devLinks)
          }
          if (twitterUsername) {
            followTwitterUser(twitterUsername)
          }
          this.log(`You're now following ${login} 🎉`)
        }
      }
    }
    /* eslint-enable no-await-in-loop */
    this.log('Scan done')
  }
}
