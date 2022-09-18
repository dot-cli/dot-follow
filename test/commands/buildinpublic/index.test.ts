import { expect, test } from '@oclif/test'
import * as sinon from 'sinon'

import cmd from 'commands/buildinpublic'

import * as command from 'lib/buildinpublic'
import * as twitter from 'lib/twitter'

let getAuthUserIdStub = sinon.stub()

describe('faves', () => {
  beforeEach(() => {
    getAuthUserIdStub = sinon
      .stub(twitter, 'getAuthUserId')
      .resolves('11111111')
  })

  test.stdout().it('No auth user', async (ctx) => {
    getAuthUserIdStub.resolves(null)
    await cmd.run([])
    expect(ctx.stdout).to.contain('Please run setup first')
  })

  test.it('Found new Twitter users to follow who build in public', async () => {
    const stub = sinon.stub(command, 'processUsersInTheBackground').resolves()

    await cmd.run([])

    expect(stub.calledWith()).to.be.true
  })
})
