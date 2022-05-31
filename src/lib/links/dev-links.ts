// eslint-disable-next-line node/no-missing-import
import type { Link } from 'lib/types'

export default class DevLinks {
  private devLinks: Link[] = []
  private excludeDevLinks: string[] = []

  readonly linkTypes = [
    { title: 'Twitter', match: 'twitter.com' },
    { title: 'LinkedIn', match: 'linkedin.com/in/' },
    { title: 'Dev.to', match: 'dev.to' },
    { title: 'Youtube', match: 'youtube.com' },
    { title: 'Twitch', match: 'twitch.tv' },
    { title: 'Instagram', match: 'instagram.com' }
  ]

  readonly titles = ['Website', 'Blog']

  public constructor(excludeDevLinks: string[]) {
    this.excludeDevLinks = excludeDevLinks
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
        this.devLinks.push({ href: link.href, title })
      }
    }
  }

  public addSiteLink = (link: Link): void => {
    for (const title of this.titles) {
      if (
        !this.excludeDevLinks.includes(title.toLowerCase()) &&
        !this.devLinks.some((l) => l.title === title) &&
        link.title?.trim().toLowerCase() === title.toLowerCase()
      ) {
        this.devLinks.push({ href: link.href, title })
      }
    }
  }
}
