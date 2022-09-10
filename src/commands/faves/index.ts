import { Command } from '@oclif/core'

import { handleError, logAndPromptFollow } from 'lib/command'
import { FollowingKey, getFollowing, setFollowing } from 'lib/config'
import { getFave, setFave, getFaveUsernames } from 'lib/faves'
import { FaveType } from 'lib/faves'
import { getUsersThatExist as getGithubUsersThatExist } from 'lib/github'
import {
  getUser as getTwitterUser,
  getAuthUser as getTwitterAuthUser,
  getFollowingUserIdsByUserId as getTwitterFollowingUserIdsByUserId,
  getFollowingByUserId as getTwitterFollowingByUserId
} from 'lib/twitter'

export default class Faves extends Command {
  static description = 'Faves'

  static examples = ['$ oex faves']

  async catch(error: Error): Promise<void> {
    handleError(error)
  }

  async run(): Promise<void> {
    const twitterUsersFaves = await getFaveUsernames(FaveType.Twitter)

    const twitterUser = await getTwitterAuthUser()
    if (!twitterUser) {
      this.log('Please run setup first')
      return
    }

    // Get auth user's following
    let twitterFollowing = await getFollowing(FollowingKey.TWITTER)
    if (
      !twitterFollowing ||
      twitterFollowing.following.length !==
        twitterUser.public_metrics?.following_count
    ) {
      this.log('\nFetching Twitter users that you follow')
      const following = await getTwitterFollowingUserIdsByUserId(twitterUser.id)
      twitterFollowing = {
        following,
        evalTimestamp: Date.now()
      }
      await setFollowing(FollowingKey.TWITTER, twitterFollowing)
    }

    // Find github users to follow from Twitter users who Twitter faves follow
    /* eslint-disable no-await-in-loop */
    for (const twitterUserFave of twitterUsersFaves) {
      const twitterUser = await getTwitterUser(twitterUserFave)
      if (!twitterUser) {
        this.log(`Failed to find ${twitterUserFave} on Twitter`)
        continue
      }

      // Get fave or set it if it's not already available
      const fave = (await getFave(FaveType.Twitter, twitterUserFave)) || {
        key: twitterUserFave,
        id: twitterUser.id,
        followingCount: 0,
        following: []
      }

      if (fave.followingCount === twitterUser.public_metrics?.following_count) {
        this.log(`\nFound no new Twitter users that ${twitterUserFave} follows`)
        continue
      }

      // Update fave's followingCount
      fave.followingCount = twitterUser.public_metrics?.following_count
      setFave(FaveType.Twitter, fave)

      // Get latest twitter users, exclude those the authenticated user
      // is already following
      this.log(
        `\nFetching latest Twitter users that ${twitterUserFave} follows`
      )
      const twitterFollowingUsers = (
        await getTwitterFollowingByUserId(fave.id, 100)
      ).filter(
        (twitterFollowingUser) =>
          !twitterFollowing?.following.includes(twitterFollowingUser.id)
      )

      const twitterFollowingUsersNotYetEvaluated = twitterFollowingUsers.filter(
        (twitterFollowingUser) =>
          !fave.following?.some((f) => f.key === twitterFollowingUser.username)
      )

      if (twitterFollowingUsersNotYetEvaluated.length === 0) {
        this.log(`Found no new Twitter users that ${twitterUserFave} follows`)
        continue
      }

      // Update fave's following
      fave.following.push(
        ...twitterFollowingUsersNotYetEvaluated.map((twitterFollowingUser) => ({
          key: twitterFollowingUser.username,
          evalTimestamp: Date.now()
        }))
      )
      setFave(FaveType.Twitter, fave)

      this.log('Checking Twitter users who are also developers')
      const maxGithubUsersToEval = 10
      const githubUsersToFollow = (
        await getGithubUsersThatExist(
          twitterFollowingUsersNotYetEvaluated.map(
            (twitterFollowingUser) => twitterFollowingUser.username
          )
        )
      ).slice(0, maxGithubUsersToEval)

      await logAndPromptFollow(githubUsersToFollow)
    }
    /* eslint-enable no-await-in-loop */

    this.log('Done')
  }
}
