import { expect, test } from '@oclif/test'

// eslint-disable-next-line node/no-missing-import
import cmd from 'commands/follow'

describe('follow', () => {
  test.stdout().it('follow chico', async (ctx) => {
    await cmd.run(['chico'])
    expect(ctx.stdout).to.contain('🐦 twitter.com/@ccharlesworth')
  })

  test.stdout().it('github user not found', async (ctx) => {
    const notAGithubUser = 'not-a-github-user'
    await cmd.run([notAGithubUser])
    expect(ctx.stdout).to.contain(`${notAGithubUser} not found 🤷`)
  })

  test.stdout().it('github user with no twitter', async (ctx) => {
    const githubUserWithNoTwitter = 'grahamoregan'
    await cmd.run([githubUserWithNoTwitter])
    expect(ctx.stdout).to.contain(
      `${githubUserWithNoTwitter} has not twitter in their github profile 🤷`
    )
  })
})
