import { expect, test } from '@oclif/test'

import cmd from 'commands/follow'

describe('follow', () => {
  test.stdout().it('follow chico', async (ctx) => {
    await cmd.run(['chico'])
    expect(ctx.stdout).to.contain('Twitter: https://twitter.com/ccharlesworth')
    expect(ctx.stdout).to.contain('Website: chicocharlesworth.com')
    expect(ctx.stdout).to.contain(
      'LinkedIn: https://www.linkedin.com/in/chicocharlesworth'
    )
    expect(ctx.stdout).to.contain(
      'Instagram: https://instagram.com/ccharlesworth'
    )
  })

  test.stdout().it('github user not found', async (ctx) => {
    const notAGithubUser = 'not-a-github-user'
    await cmd.run([notAGithubUser])
    expect(ctx.stdout).to.contain('Not found 🤷')
  })
})
