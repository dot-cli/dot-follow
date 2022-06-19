import { Sites } from 'lib/constants'
import { getUser as getGihubUser, getReadme } from 'lib/github'
import { parseLinks } from 'lib/markdown'
import type { SocialUser, Link } from 'lib/types'

import DevLinks, { buildSocialLink } from './dev-links'

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
  }

  return parseDevLinks(links)
}
