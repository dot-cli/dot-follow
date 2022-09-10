import chalk from 'chalk'

import { Sites } from 'lib/constants'
import {
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
  githubUsersToFollow: string[]
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
      for (const link of parsedDevLinks) {
        console.log(`${link.title}: ${colorifyURLs(link.href)}`)

        if (link.title === Sites.Github.title) {
          const githubUsers = await getGithubUsers(login)
          const { name, company, blog, bio, followers, following } =
            githubUsers[0]
          logProps(
            {
              name,
              company: resolveCompanyHandles(company),
              website: blog,
              followers,
              following,
              bio
            },
            ['bio']
          )
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
          logProps(
            {
              name,
              url,
              followers: public_metrics?.followers_count,
              following: public_metrics?.following_count,
              tweets: public_metrics?.tweet_count,
              protected: protectedFlag,
              verified,
              description,
              pinnedTweet
            },
            ['description', 'pinnedTweet']
          )
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
        console.log(`You're now following ${login} 🎉`)
      }
    }
  }
}
