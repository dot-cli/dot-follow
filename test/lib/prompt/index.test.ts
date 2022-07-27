import { expect, test } from '@oclif/test'
import inquirer from 'inquirer'
import * as sinon from 'sinon'

import { keypress, question, choice } from 'lib/prompt'

describe('keypress', () => {
  test
    .stdin('\n')
    .stdout()
    .it('keypress', async (ctx) => {
      const msg = 'Press Enter...'
      await keypress(msg)
      expect(ctx.stdout).to.equal(`${msg}\n`)
    })

  test
    .stdin('\u0003')
    .stdout()
    .it('keypress exit', async (ctx) => {
      sinon.stub(process, 'exit')
      const msg = 'Press Enter or ^C to exit...'
      await keypress(msg)
      expect(ctx.stdout).to.equal(`${msg}\n^C\n`)
    })

  test.it('question', async () => {
    const result = 'test'
    sinon.stub(inquirer, 'prompt').resolves({ result })
    expect(await question()).to.equal(result)
  })

  test.it('choice', async () => {
    const result = 'A'
    sinon.stub(inquirer, 'prompt').resolves({ result })
    expect(await choice({ choices: ['A', 'B'] })).to.equal(result)
  })
})
