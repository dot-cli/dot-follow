// @ts-ignore
import getHandles from 'social-media-scraper'

import { Sites } from 'lib/constants'
import type { Link } from 'lib/types'

export const buildSocialLink = (title: string, username: string): Link => {
  const href = `https://${title.toLowerCase()}.com/${username}`.replace(
    'linkedin.com',
    'linkedin.com/in'
  )
  return { href, title, username }
}

export default class DevLinks {
  private devLinks: Link[] = []
  private excludeDevLinks: string[] = []

  readonly linkTypes = Object.values(Sites)

  readonly titles = [Sites.Website.title, Sites.Blog.title]

  public constructor(excludeDevLinks: string[]) {
    this.excludeDevLinks = excludeDevLinks
  }

  public matchesLinkType = (link: Link): boolean =>
    this.linkTypes.some((linkType) =>
      linkType.urlPrefix
        ? link.href?.toLowerCase().includes(linkType.urlPrefix)
        : false
    )

  public addLinks = (links: Link[]): void => {
    for (const link of links) {
      this.addLink(link)
      this.addSiteLink(link)
    }
  }

  public getLinks = (): Link[] => {
    return this.devLinks
  }

  public addLink = (link: Link): void => {
    for (const linkType of this.linkTypes) {
      const { title, urlPrefix } = linkType
      if (
        !this.excludeDevLinks.includes(title.toLowerCase()) &&
        urlPrefix &&
        link.href?.includes(urlPrefix) &&
        !this.devLinks.some((l) => l.title === title)
      ) {
        this.devLinks.push({ href: link.href, title, isSocialLink: true })
      }
    }
  }

  public addSiteLink = (link: Link): void => {
    for (const title of this.titles) {
      if (
        !this.excludeDevLinks.includes(title.toLowerCase()) &&
        !this.devLinks.some((l) => l.title === title) &&
        link.title?.trim().toLowerCase() === title.toLowerCase() &&
        !this.matchesLinkType(link)
      ) {
        this.devLinks.push({ href: link.href, title, isSocialLink: false })
      }
    }
  }

  public parseSites = async (): Promise<Link[]> => {
    const siteLinks = this.devLinks
      .filter((link) => !link.isSocialLink)
      .map((link) => link.href)
    if (!siteLinks) {
      return []
    }

    let handles = []
    try {
      handles = await getHandles.default(siteLinks)
    } catch {
      // TODO Ignore error
      // console.error(`ERROR: Failed to parse ${siteLinks}`, error)
    }

    const links: Link[] = []
    for (const handle of handles) {
      for (const site in handle) {
        for (const key in handle[site]) {
          const usernames = handle[site][key]
          // If more than one username then could have false positives
          if (usernames.length === 1) {
            links.push(buildSocialLink(key, usernames[0]))
          }
        }
      }
    }
    return links
  }
}
