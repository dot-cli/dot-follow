// @ts-ignore
import { Remarkable } from 'remarkable'

// eslint-disable-next-line node/no-missing-import
import type { Link } from 'lib/types'

import { parseLinksFromTokens } from './helper'

// eslint-disable-next-line node/no-missing-import
export type { Link } from 'lib/types'

export const parseLinks = (markdown: string): Link[] => {
  const md = new Remarkable({ html: true })
  const tokens = md.parse(markdown, {})
  return parseLinksFromTokens(tokens)
}
