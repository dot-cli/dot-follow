import { expect, test } from '@oclif/test'

describe('follow', () => {
  test
    .stdout()
    .command(['follow', 'chico'])
    .it('runs follow cmd', (ctx) => {
      expect(ctx.stdout).to.contain('Follow chico?')
    })
})
