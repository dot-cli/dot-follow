import { Command } from '@oclif/core'

import { handleError } from 'lib/command'
import { getUsersThatExist as getGithubUsersThatExist } from 'lib/github'
import {
  getAuthUserId as getTwitterAuthUserId,
  getFollowingByUserId as getTwitterFollowingByUserId,
  addUsersToListByName
} from 'lib/twitter'

export default class Lists extends Command {
  static description = 'Lists'

  static examples = ['$ oex lists']

  async catch(error: Error): Promise<void> {
    handleError(error)
  }

  async run(): Promise<void> {
    const twitterUserId = await getTwitterAuthUserId()
    if (!twitterUserId) {
      this.log('Please run setup first')
      return
    }

    console.log('Check Twitter users who are being followed')
    const twitterFollowingUsers = await getTwitterFollowingByUserId(
      twitterUserId
    )
    console.log(
      `Found ${twitterFollowingUsers.length} Twitter user${
        twitterFollowingUsers.length === 1 ? '' : 's'
      }`
    )

    if (twitterFollowingUsers.length === 0) {
      return
    }

    const twitterUsernames = twitterFollowingUsers.map(
      (twitterFollowingUser) => twitterFollowingUser.username
    )

    const githubUsersOnTwitter: string[] = []
    const chunkSize = 1000
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < twitterUsernames.length; i += chunkSize) {
      const chunk = twitterUsernames.slice(i, i + chunkSize)
      console.log(
        `Check ${chunk.length} Twitter user${
          chunk.length === 1 ? '' : 's'
        } for Github accounts`
      )
      const githubUsersOnTwitterChunk = await getGithubUsersThatExist(chunk)
      githubUsersOnTwitter.push(...githubUsersOnTwitterChunk)
    }
    /* eslint-enable no-await-in-loop */

    // Use case insensitive twitter/github username matching
    //
    // TODO It's expected that twitterUsersToAddToDevList.length
    // will be the same as githubUsersOnTwitter.length but it's not? :/
    const twitterUsersToAddToDevList = twitterFollowingUsers.filter(
      (twitterFollowingUser) =>
        githubUsersOnTwitter.some(
          (githubUserOnTwitter) =>
            githubUserOnTwitter.toLowerCase() ===
            twitterFollowingUser.username.toLowerCase()
        )
    )

    // e.g. 836 out of 2191 (38%) of twitter users being followed have Github accounts
    console.log(
      `${twitterUsersToAddToDevList.length} out of ${
        twitterFollowingUsers.length
      } (${Math.round(
        (twitterUsersToAddToDevList.length * 100) / twitterFollowingUsers.length
      )}%) of twitter users being followed have Github accounts`
    )

    await addUsersToListByName('Devs', twitterUsersToAddToDevList)

    this.log('Done')
  }
}
