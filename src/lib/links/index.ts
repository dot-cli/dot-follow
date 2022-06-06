// eslint-disable-next-line node/no-missing-import
import { getUser, getReadme } from 'lib/github'
// eslint-disable-next-line node/no-missing-import
import { parseLinks } from 'lib/markdown'
// eslint-disable-next-line node/no-missing-import
import type { Link } from 'lib/types'

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
export const getUserDevLinks = async (username: string): Promise<Link[]> => {
  const links: Link[] = []

  const user = await getUser(username)
  if (!user) {
    return links
  }

  links.push(buildSocialLink('Github', user.login))
  if (user.twitter_username) {
    links.push(buildSocialLink('Twitter', user.twitter_username))
  }
  if (user.blog) {
    links.push({ href: user.blog, title: 'Website' })
  }
  const readme = await getReadme(username)
  if (readme) {
    const readmeLinks = parseLinks(readme)
    links.push(...readmeLinks)
  }

  return parseDevLinks(links)
}
