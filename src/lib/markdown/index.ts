// @ts-ignore
import { Remarkable } from 'remarkable'

import type { Link } from 'lib/types'

import { parseLinksFromTokens } from './helper'

export type { Link } from 'lib/types'

export const parseLinks = (markdown: string): Link[] => {
  const md = new Remarkable({ html: true })
  const tokens = md.parse(markdown, {})
  return parseLinksFromTokens(tokens)
}
