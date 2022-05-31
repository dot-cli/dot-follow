import { expect } from 'chai'

// eslint-disable-next-line node/no-missing-import
import { readFile } from 'lib/file'
// eslint-disable-next-line node/no-missing-import
import { parseLinks } from 'lib/markdown'

import readmeLinks from './readme/links'

// eslint-disable-next-line unicorn/prefer-module
export const readme = readFile(__dirname, 'readme/index.md')

describe('parse links', () => {
  it('readme links', async () => {
    expect(await parseLinks(readme)).to.deep.equal(readmeLinks)
  })
})
