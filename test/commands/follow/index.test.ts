import { expect, test } from '@oclif/test'

// eslint-disable-next-line node/no-missing-import
import cmd from 'commands/follow'

describe('follow', () => {
  test.stdout().it('follow chico', async (ctx) => {
    await cmd.run(['chico'])
    expect(ctx.stdout).to.contain('Twitter: twitter.com/ccharlesworth')
    expect(ctx.stdout).to.contain('Website: http://chicocharlesworth.com')
    expect(ctx.stdout).to.contain(
      'LinkedIn: https://www.linkedin.com/in/chicocharlesworth'
    )
  })

  test.stdout().it('github user not found', async (ctx) => {
    const notAGithubUser = 'not-a-github-user'
    await cmd.run([notAGithubUser])
    expect(ctx.stdout).to.contain(`${notAGithubUser} not found 🤷`)
  })
})
