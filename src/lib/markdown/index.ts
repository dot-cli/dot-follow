// @ts-ignore
import { Remarkable } from 'remarkable'

export interface Link {
  href: string
  title: string
}

export const parseLinks = (markdown: string): Link[] => {
  const links: Link[] = []

  const md = new Remarkable({ html: true })
  const tokens = md.parse(markdown, {})

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
        const regex = 'alt=[\\"\'](.*?)[\\"\']'
        const altMatch = child.content.match(regex)
        if (altMatch) {
          currentLinkTitle = altMatch[1]
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
        const regex = 'href=[\\"\'](.*?)[\\"\']'
        const altMatch = child.content.match(regex)
        if (altMatch) {
          currentLink = altMatch[1]
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
