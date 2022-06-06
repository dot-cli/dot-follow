// eslint-disable-next-line node/no-missing-import
import type { Link } from 'lib/types'

import DevLinks from './dev-links'

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
