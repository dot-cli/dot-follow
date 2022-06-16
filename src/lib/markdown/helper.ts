import type { Link } from 'lib/types'

const getHtmlAttribute = (html: string, attribute: string) => {
  const regex = `${attribute}=[\\"'](.*?)[\\"']`
  const altMatch = html.match(regex)
  return altMatch ? altMatch[1] : null
}

// eslint-disable-next-line complexity
export const parseLinksFromTokens = (tokens: any[]): Link[] => {
  const links: Link[] = []

  let currentLink = null
  let currentLinkTitle = null
  let isLinkOpen = false
  let isHtmlTagOpen = false

  for (const token of tokens) {
    if (token.type !== 'inline') continue
    if (!Array.isArray(token.children)) continue
    for (const child of token.children) {
      if (child.type === 'link_open') {
        isLinkOpen = true
        currentLink = child.href
        continue
      }
      if (child.type === 'link_close') {
        isLinkOpen = false
        if (currentLink) {
          links.push({ href: currentLink, title: currentLinkTitle })
        }
        currentLinkTitle = null
        continue
      }
      if (isLinkOpen && child.type === 'image') {
        currentLinkTitle = child.alt
        continue
      }

      if (
        isLinkOpen &&
        child.type === 'htmltag' &&
        child.content.startsWith('<img')
      ) {
        const alt = getHtmlAttribute(child.content, 'alt')
        if (alt) {
          currentLinkTitle = alt
        }
        continue
      }
      if (isLinkOpen && child.type === 'text') {
        currentLinkTitle = child.content
        continue
      }

      if (
        !isLinkOpen &&
        child.type === 'htmltag' &&
        child.content.startsWith('<a')
      ) {
        isHtmlTagOpen = true
        const href = getHtmlAttribute(child.content, 'href')
        if (href) {
          currentLink = href
        }
        continue
      }
      if (isHtmlTagOpen && child.type === 'text') {
        isHtmlTagOpen = false
        currentLinkTitle = child.content
        if (currentLink) {
          links.push({ href: currentLink, title: currentLinkTitle })
        }
        continue
      }
    }
  }

  return links
}
