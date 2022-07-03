import { Sites } from 'lib/constants'
import { getUser as getGihubUser, getReadme } from 'lib/github'
import { parseLinks } from 'lib/markdown'
import { getUser as getTwitterUser } from 'lib/twitter'
import type { SocialUser, Link } from 'lib/types'

import DevLinks, { buildSocialLink } from './dev-links'

// TODO Read token from config or env variable?
const twitterAuthToken = process.env.TWITTER_AUTH_TOKEN

export const parseDevLinks = async (
  links: Link[],
  excludeDevLinks: string[] = []
): Promise<Link[]> => {
  const devLinks = new DevLinks(excludeDevLinks)
  devLinks.addLinks(links)

  const siteLinks = await devLinks.parseSites()
  devLinks.addLinks(siteLinks)

  return devLinks.getLinks()
}

// Get github user & add links from github, github readme & the user's website
export const getUserDevLinks = async (
  socialUser: SocialUser
): Promise<Link[]> => {
  const links: Link[] = []

  const { type, username } = socialUser

  if (type === Sites.Github.type) {
    const user = await getGihubUser(username)
    if (!user) {
      return links
    }

    links.push(buildSocialLink(Sites.Github.title, user.login))
    if (user.twitter_username) {
      links.push(buildSocialLink(Sites.Twitter.title, user.twitter_username))
    }
    if (user.blog) {
      links.push({ href: user.blog, title: Sites.Website.title })
    }
    const readme = await getReadme(username)
    if (readme) {
      const readmeLinks = parseLinks(readme)
      links.push(...readmeLinks)
    }
  } else if (type === Sites.Twitter.type && twitterAuthToken) {
    const user = await getTwitterUser(twitterAuthToken, username)
    if (user) {
      links.push(buildSocialLink(Sites.Twitter.title, user.username))
      const { url } = user
      if (url) {
        links.push({ href: url, title: Sites.Website.title })
      }
    }
  }

  return links
}
