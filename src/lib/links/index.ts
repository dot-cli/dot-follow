// eslint-disable-next-line node/no-missing-import
import type { Link } from 'lib/types'

import DevLinks from './dev-links'

export const devLinks = (links: Link[], excludeDevLinks: string[]): Link[] => {
  const devLinks = new DevLinks(excludeDevLinks)
  for (const link of links) {
    devLinks.addLink(link)
    devLinks.addSiteLink(link)
  }
  return devLinks.getLinks()
}
