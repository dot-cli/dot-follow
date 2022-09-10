import { expect, test } from '@oclif/test'
import * as sinon from 'sinon'

import cmd from 'commands/faves'

import * as command from 'lib/command'
import * as config from 'lib/config'
import * as faves from 'lib/faves'
import { FaveType } from 'lib/faves'
import * as github from 'lib/github'
import * as twitter from 'lib/twitter'

const TWITTER_AUTH_USER = {
  id: '55555555',
  username: 'test',
  public_metrics: {
    following_count: 1
  }
}

const TWITTER_USER_TEST1 = {
  id: '11111111',
  username: 'test1',
  public_metrics: {
    following_count: 0
  }
}

const TWITTER_USER_TEST2 = {
  id: '22222222',
  username: 'test2',
  public_metrics: {
    following_count: 1
  }
}

const TWITTER_USER_TEST3 = {
  id: '33333333',
  username: 'test3'
}

const TWITTER_USER_TEST4 = {
  id: '44444444',
  username: 'test4'
}

const TWITTER_USER_TEST1_FAVE = {
  key: TWITTER_USER_TEST1.username,
  id: TWITTER_USER_TEST1.id,
  followingCount: 0,
  following: []
}

const TWITTER_USER_TEST2_FAVE = {
  key: TWITTER_USER_TEST2.username,
  id: TWITTER_USER_TEST2.id,
  followingCount: 0,
  following: []
}

let getAuthUserStub = sinon.stub()
let getFaveUsernamesStub = sinon.stub()

describe('faves', () => {
  beforeEach(() => {
    getFaveUsernamesStub = sinon
      .stub(faves, 'getFaveUsernames')
      .resolves(['test1'])
    getAuthUserStub = sinon
      .stub(twitter, 'getAuthUser')
      .resolves(TWITTER_AUTH_USER)

    sinon.stub(config, 'getFollowing').resolves({
      following: [],
      evalTimestamp: Date.now()
    })

    sinon
      .stub(twitter, 'getFollowingUserIdsByUserId')
      .resolves([TWITTER_USER_TEST3.id])

    sinon
      .stub(twitter, 'getUser')
      .withArgs('test1')
      .resolves(TWITTER_USER_TEST1)
      .withArgs('test2')
      .resolves(TWITTER_USER_TEST2)

    sinon
      .stub(faves, 'getFave')
      .withArgs(FaveType.Twitter, 'test1')
      .resolves(TWITTER_USER_TEST1_FAVE)
      .withArgs(FaveType.Twitter, 'test2')
      .resolves(TWITTER_USER_TEST2_FAVE)

    sinon.stub(faves, 'setFave').resolves()

    sinon
      .stub(twitter, 'getFollowingByUserId')
      .resolves([TWITTER_USER_TEST3, TWITTER_USER_TEST4])
  })

  test.stdout().it('No auth user', async (ctx) => {
    getAuthUserStub.resolves(null)
    await cmd.run([])
    expect(ctx.stdout).to.contain('Please run setup first')
  })

  test.stdout().it('No new Twitter users to follow', async (ctx) => {
    await cmd.run([])
    expect(ctx.stdout).to.contain(
      'Found no new Twitter users that test1 follows'
    )
  })

  test.stdout().it('Found new Twitter users to follow', async (ctx) => {
    getFaveUsernamesStub.resolves(['test1', 'test2'])
    sinon
      .stub(github, 'getUsersThatExist')
      .resolves([TWITTER_USER_TEST4.username])
    const logAndPromptFollowStub = sinon
      .stub(command, 'logAndPromptFollow')
      .resolves()

    await cmd.run([])
    expect(ctx.stdout).to.contain('Fetching Twitter users that you follow')
    expect(ctx.stdout).to.contain(
      'Found no new Twitter users that test1 follows'
    )
    expect(ctx.stdout).to.contain(
      'Fetching latest Twitter users that test2 follows'
    )
    expect(ctx.stdout).to.contain(
      'Checking Twitter users who are also developers'
    )

    expect(logAndPromptFollowStub.calledWith([TWITTER_USER_TEST4.username])).to
      .be.true
  })
})
