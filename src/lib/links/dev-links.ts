// @ts-ignore
import getHandles from 'social-media-scraper'

import type { Link } from 'lib/types'

export const buildSocialLink = (title: string, username: string): Link => {
  const href = `https://${title.toLowerCase()}.com/${username}`.replace(
    'linkedin.com',
    'linkedin.com/in'
  )
  return { href, title }
}

export default class DevLinks {
  private devLinks: Link[] = []
  private excludeDevLinks: string[] = []

  readonly linkTypes = [
    { title: 'Github', match: 'github.com/' },
    { title: 'Gitlab', match: 'gitlab.com/' },
    { title: 'Twitter', match: 'twitter.com/' },
    { title: 'LinkedIn', match: 'linkedin.com/in/' },
    { title: 'Dev.to', match: 'dev.to/' },
    { title: 'Youtube', match: 'youtube.com/' },
    { title: 'Twitch', match: 'twitch.tv/' },
    { title: 'Instagram', match: 'instagram.com/' }
  ]

  readonly titles = ['Website', 'Blog']

  public constructor(excludeDevLinks: string[]) {
    this.excludeDevLinks = excludeDevLinks
  }

  public matchesLinkType = (link: Link): boolean =>
    this.linkTypes.some((linkType) =>
      link.href?.toLowerCase().includes(linkType.match)
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
      const { title, match } = linkType
      if (
        !this.excludeDevLinks.includes(title.toLowerCase()) &&
        link.href?.includes(match) &&
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
      handles = await getHandles(siteLinks)
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
