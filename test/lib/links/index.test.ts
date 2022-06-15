import { expect } from 'chai'

// eslint-disable-next-line node/no-missing-import
import { buildSocialLink } from 'lib/links/dev-links'

describe('build social links', () => {
  it('github social link', async () => {
    expect(buildSocialLink('github', 'test')).to.deep.equal({
      title: 'github',
      href: 'https://github.com/test'
    })
  })
  it('linkedin social link', async () => {
    expect(buildSocialLink('linkedin', 'test')).to.deep.equal({
      title: 'linkedin',
      href: 'https://linkedin.com/in/test'
    })
  })
})
