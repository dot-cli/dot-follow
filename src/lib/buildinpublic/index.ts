import { promises as fs } from 'fs'
import { setTimeout } from 'timers/promises'

import { logAndPromptFollow } from 'lib/command'
import { getUser as getTwitterUser, getListMembers } from 'lib/twitter'

import { getUsers } from './users'

const ONE_HOUR = 60 * 60 * 1000
const ONE_DAY = 24 * ONE_HOUR

export const logBuildInPublicTwitterUsers = async (): Promise<void> => {
  console.log(
    'Grab Twitter users from https://twitter.com/i/lists/1368738285263159296'
  )
  const twitteUsersBuildingInPublic = await getListMembers(
    '1368738285263159296'
  )
  for (const user of twitteUsersBuildingInPublic) {
    const { id, username, public_metrics: publicMetrics } = user
    console.log(
      JSON.stringify({
        id,
        username,
        followers: publicMetrics?.followers_count || -1
      })
    )
  }
}

export const logBuildInPublicTwitterUsersWithFollowersCount = async (
  delay = 10000
): Promise<void> => {
  const users = getUsers()
  /* eslint-disable no-await-in-loop */
  for (const user of users) {
    if (user.followers && user.followers > 0) {
      continue
    }
    const twitterUser = await getTwitterUser(user.username)
    if (!twitterUser) {
      continue
    }
    const { id, username, public_metrics: publicMetrics } = twitterUser
    console.log(
      JSON.stringify({
        id,
        username,
        followers: publicMetrics?.followers_count || -1
      })
    )
    await setTimeout(delay)
  }
  /* eslint-enable no-await-in-loop */
}

// TODO VERY HACKY!!
export const saveProcessedUsers = async (
  usernames: string[]
): Promise<void> => {
  const users = getUsers()

  // eslint-disable-next-line unicorn/prefer-module
  const usersFilePath = `${__dirname}/users.ts`
  const data = await fs.readFile(usersFilePath, 'utf8')

  const processed = Date.now()
  let result = data
  for (const username of usernames) {
    const user = users.find((u) => u.username === username)
    if (user) {
      user.processed = processed
    }
    result = result.replace(
      `username: '${username}'`,
      `username: '${username}', processed: ${processed}`
    )
  }

  await fs.writeFile(usersFilePath, result)
}

export const processUser = async (username: string): Promise<void> => {
  console.log(`Process ${username}`)

  // TODO username will be twitter username (i.e. not github username)
  // so it'd be great to pass both the twitter & github usernames
  // to find accurate github profile data
  logAndPromptFollow([username], true, '#follow-buildinpublic')
}

export const processUsersInTheBackground = async (
  forever = true,
  delay = ONE_HOUR
): Promise<void> => {
  const users = getUsers()
  /* eslint-disable no-await-in-loop */
  do {
    // If no users processed then mostRecentlyProcessed = -Infinity
    const mostRecentlyProcessed = Math.max(
      ...(users.filter((u) => u.processed).map((u) => u.processed) as number[])
    )

    if (Date.now() >= mostRecentlyProcessed + ONE_DAY) {
      const usersNotYetProcessed = users.filter((u) => !u.processed)
      if (usersNotYetProcessed.length > 0) {
        const { username } = usersNotYetProcessed[0]
        try {
          await processUser(username)
          saveProcessedUsers([username])
        } catch (error) {
          console.log(`ERROR: Failed to process ${username} - ${error.message}`)
        }
      }
    }

    await setTimeout(delay)
    /* eslint-disable no-unmodified-loop-condition */
  } while (forever)
  /* eslint-enable no-await-in-loop */
}
