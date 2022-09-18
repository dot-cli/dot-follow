import chalk from 'chalk'

import { FollowingKey, getFollowing, setFollowing } from 'lib/config'
import { Sites } from 'lib/constants'
import { getFave, setFave, getFaveUsernames } from 'lib/faves'
import { FaveType } from 'lib/faves'
import {
  getUsers as getGithubUsers,
  followUser as followGithubUser,
  resolveCompanyHandles
} from 'lib/github'
import { getUsersThatExist as getGithubUsersThatExist } from 'lib/github'
import {
  getUserDevLinks,
  parseDevLinks,
  getTwitterUsernameFromDevLinks
} from 'lib/links'
import { confirm } from 'lib/prompt'
import { postMessage } from 'lib/slack'
import {
  getUser as getTwitterUser,
  followUser as followTwitterUser,
  getAuthUser as getTwitterAuthUser,
  getFollowingUserIdsByUserId as getTwitterFollowingUserIdsByUserId,
  getFollowingByUserId as getTwitterFollowingByUserId
} from 'lib/twitter'
import { Link } from 'lib/types'

const TAB = '  '

// From https://stackoverflow.com/a/51506718
const wrap = (text: string, maxWidth: number): string =>
  text.replace(
    new RegExp(`(?![^\\n]{1,${maxWidth}}$)([^\\n]{1,${maxWidth}})\\s`, 'g'),
    '$1\n'
  )

const colorifyURLs = (text: string): string => {
  const urlRegex = /(https?:\/\/\S+)/g
  return text.replace(urlRegex, (url) => {
    return `${chalk.blue(url)}`
  })
}

export const logProps = (
  obj: Record<string, any>,
  longTextKeys: string[]
): void => {
  for (const key in obj) {
    if (obj[key] || typeof obj[key] === 'boolean') {
      const keyName = `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`
      if (longTextKeys.includes(key)) {
        console.log(`${TAB}${keyName}:`)
        const text = wrap(obj[key], 100)
        for (const line of text.split('\n')) {
          console.log(
            `${TAB}${TAB}${chalk.green.bold('│')} ${colorifyURLs(line)}`
          )
        }
      } else {
        console.log(
          `${TAB}${keyName}: ${
            typeof obj[key] === 'string' ? colorifyURLs(obj[key]) : obj[key]
          }`
        )
      }
    }
  }
}

export const buildSlackMessage = (
  link: Link,
  obj: Record<string, any>,
  longTextKeys: string[]
): string => {
  let text = `*${link.title}*: ${link.href}\n`
  for (const key in obj) {
    if (obj[key] || typeof obj[key] === 'boolean') {
      const keyName = `${key.slice(0, 1).toUpperCase()}${key.slice(1)}`
      if (longTextKeys.includes(key)) {
        text += `\t*${keyName}*:\n`
        const value = wrap(obj[key], 100)
        for (const line of value.split('\n')) {
          text += `\t\t${line}\n`
        }
      } else {
        text += `\t*${keyName}*: ${obj[key]}\n`
      }
    }
  }
  return text
}

export const handleError = (error: Error): void => {
  const isTwitterRateLimitExceeded =
    error?.message === 'Request failed with status code 429'
  if (isTwitterRateLimitExceeded) {
    console.log(
      'Whoa there! Twitter rate limit exceeded, try again in a few minutes.'
    )
    throw error
  }
  if (error?.message) {
    // TODO Log errors in red
    console.log(`Error: ${error.message}`)
  }
  // TODO Only do console.error when verbose is true & is supported?
  console.error(error)
  throw error
}

export const logAndPromptFollow = async (
  githubUsersToFollow: string[],
  runInBackground = false,
  slackChannel = '#follow'
): Promise<void> => {
  if (githubUsersToFollow.length === 0) {
    console.log('Found no new Twitter users to follow who are also developers')
  }

  if (githubUsersToFollow.length > 0) {
    console.log(
      `Found ${githubUsersToFollow.length} Github user${
        githubUsersToFollow.length > 1 ? 's' : ''
      } to review`
    )
    /* eslint-disable no-await-in-loop */
    for (const login of githubUsersToFollow) {
      console.log(`\nScanning ${login}...`)

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
      const slackMessages: string[] = []
      for (const link of parsedDevLinks) {
        console.log(`${link.title}: ${colorifyURLs(link.href)}`)

        if (link.title === Sites.Github.title) {
          const githubUsers = await getGithubUsers(login)
          const { name, company, blog, bio, followers, following } =
            githubUsers[0]
          const props = {
            name,
            company: resolveCompanyHandles(company),
            website: blog,
            followers,
            following,
            bio
          }
          const longTextKeys = ['bio']
          logProps(props, longTextKeys)
          slackMessages.push(buildSlackMessage(link, props, longTextKeys))
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
          const props = {
            name,
            url,
            followers: public_metrics?.followers_count,
            following: public_metrics?.following_count,
            tweets: public_metrics?.tweet_count,
            protected: protectedFlag,
            verified,
            description,
            pinnedTweet
          }
          const longTextKeys = ['description', 'pinnedTweet']
          logProps(props, longTextKeys)
          slackMessages.push(buildSlackMessage(link, props, longTextKeys))
        }
      }

      postMessage({ text: slackMessages.join('\n'), channel: slackChannel })

      if (runInBackground) {
        continue
      }

      // Prompt to confirm follow
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
        console.log(`You're now following ${login} 🎉`)
      }
    }
    /* eslint-enable no-await-in-loop */
  }
}

export const findDevelopersToFollowByFaves = async (
  runInBackground = false,
  silent = false
): Promise<void> => {
  const twitterUser = await getTwitterAuthUser()
  if (!twitterUser) {
    console.log('Please run setup first')
    return
  }

  const twitterUsersFaves = await getFaveUsernames(FaveType.Twitter)

  // Get auth user's following
  let twitterFollowing = await getFollowing(FollowingKey.TWITTER)
  if (
    !twitterFollowing ||
    twitterFollowing.following.length !==
      twitterUser.public_metrics?.following_count
  ) {
    if (!silent) {
      console.log('\nFetching Twitter users that you follow')
    }
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
      if (!silent) {
        console.log(`Failed to find ${twitterUserFave} on Twitter`)
      }
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
      if (!silent) {
        console.log(
          `\nFound no new Twitter users that ${twitterUserFave} follows`
        )
      }
      continue
    }

    // Update fave's followingCount
    fave.followingCount = twitterUser.public_metrics?.following_count
    setFave(FaveType.Twitter, fave)

    // Get latest twitter users, exclude those the authenticated user
    // is already following
    if (!silent) {
      console.log(
        `\nFetching latest Twitter users that ${twitterUserFave} follows`
      )
    }
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
      if (!silent) {
        console.log(
          `Found no new Twitter users that ${twitterUserFave} follows`
        )
      }
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

    if (!silent) {
      console.log('Checking Twitter users who are also developers')
    }
    const maxGithubUsersToEval = 10
    const githubUsersToFollow = (
      await getGithubUsersThatExist(
        twitterFollowingUsersNotYetEvaluated.map(
          (twitterFollowingUser) => twitterFollowingUser.username
        )
      )
    ).slice(0, maxGithubUsersToEval)

    await logAndPromptFollow(githubUsersToFollow, runInBackground)
  }
  /* eslint-enable no-await-in-loop */
}
