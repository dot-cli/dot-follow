import { Command } from '@oclif/core'

import { handleError, logAndPromptFollow } from 'lib/command'
import {
  getUserProfile as getGithubUserProfile,
  getUsers as getGithubUsers,
  getUsersThatExist as getGithubUsersThatExist
} from 'lib/github'
import {
  getAuthUserId as getTwitterAuthUserId,
  getFollowingUserIdsByUserId as getTwitterFollowingUserIdsByUserId,
  getFollowersByUserId as getTwitterFollowersByUserId
} from 'lib/twitter'

export default class Scan extends Command {
  static description = 'Scan'

  static examples = ['$ oex scan']

  async catch(error: Error): Promise<void> {
    handleError(error)
  }

  async run(): Promise<void> {
    const githubUsersToFollow: string[] = []

    // Find github users to follow from Twitter users
    const twitterUserId = await getTwitterAuthUserId()
    if (twitterUserId) {
      const twitterFollowingUserIds = await getTwitterFollowingUserIdsByUserId(
        twitterUserId
      )
      const twitterFollowers = await getTwitterFollowersByUserId(twitterUserId)
      const twitterUsersToFollow = twitterFollowers.filter(
        (twitterFollower) =>
          !twitterFollowingUserIds.includes(twitterFollower.id)
      )
      const githubUsersOnTwitterToFollow = await getGithubUsersThatExist(
        twitterUsersToFollow.map(
          (twitterUserToFollow) => twitterUserToFollow.username
        )
      )
      githubUsersToFollow.push(...githubUsersOnTwitterToFollow)
    }

    // Find github users to follow on Github
    const { login } = await getGithubUserProfile()
    const githubFollowers = await getGithubUsers(`${login}/followers`)
    const githubFollowing = await getGithubUsers(`${login}/following`)
    const githubFollowerLogins = githubFollowers.map((user) => user.login)
    const githubFollowingLogins = new Set(
      githubFollowing.map((user) => user.login)
    )
    githubUsersToFollow.push(
      ...githubFollowerLogins.filter(
        (login) =>
          !githubFollowingLogins.has(login) &&
          !githubUsersToFollow.includes(login)
      )
    )

    await logAndPromptFollow(githubUsersToFollow)

    /* eslint-enable no-await-in-loop */
    this.log('Scan done')
  }
}
