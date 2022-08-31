import { expect, test } from '@oclif/test'
import * as sinon from 'sinon'

import cmd from 'commands/lists'

import * as github from 'lib/github'
import * as twitter from 'lib/twitter'

const TWITTER_AUTH_ID = '33333333'

const TWITTER_FOLLOWING = [
  {
    id: '11111111',
    username: 'following'
  }
]

describe('lists', () => {
  beforeEach(() => {
    sinon.stub(twitter, 'getAuthUserId').resolves(TWITTER_AUTH_ID)

    sinon.stub(twitter, 'getFollowingByUserId').resolves(TWITTER_FOLLOWING)

    sinon
      .stub(github, 'getUsersThatExist')
      .resolves([TWITTER_FOLLOWING[0].username])

    sinon.stub(twitter, 'addUsersToListByName').resolves()
  })

  test.stdout().it('lists', async (ctx) => {
    await cmd.run([])
    expect(ctx.stdout).to.contain('Found 1 Twitter user')
    expect(ctx.stdout).to.contain('Check 1 Twitter user for Github accounts')
    expect(ctx.stdout).to.contain(
      '1 out of 1 (100%) of twitter users being followed have Github accounts'
    )
    expect(ctx.stdout).to.contain('Done')
  })
})
