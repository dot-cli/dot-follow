import { expect, test } from '@oclif/test'
import * as fs from 'fs'
import * as sinon from 'sinon'

import {
  logBuildInPublicTwitterUsers,
  logBuildInPublicTwitterUsersWithFollowersCount,
  processUsersInTheBackground
} from 'lib/buildinpublic'
import * as users from 'lib/buildinpublic/users'
import * as command from 'lib/command'
import * as twitter from 'lib/twitter'

const TWITTER_USERS = [
  {
    id: '11111111',
    username: 'test'
  },
  {
    id: '22222222',
    username: 'test2',
    public_metrics: {
      followers_count: 1
    }
  }
]

const USERS = [
  { ...TWITTER_USERS[0], followers: -1 },
  {
    id: TWITTER_USERS[1].id,
    username: TWITTER_USERS[1].username,
    followers: TWITTER_USERS[1]?.public_metrics?.followers_count
  }
]

const twoDays = 48 * 60 * 60 * 1000
const twoDaysAgo = Date.now() - twoDays
const USERS_PROCESSED = [{ ...USERS[0], processed: twoDaysAgo }, USERS[1]]

describe('command', () => {
  beforeEach(() => {
    sinon.stub(console, 'error')
  })

  test.stdout().it('log twitter users who build in public', async (ctx) => {
    sinon.stub(twitter, 'getListMembers').resolves(TWITTER_USERS)
    await logBuildInPublicTwitterUsers()
    expect(ctx.stdout).to.contain(JSON.stringify(USERS[0]))
    expect(ctx.stdout).to.contain(JSON.stringify(USERS[1]))
  })

  test
    .stdout()
    .it(
      'log followers count for twitter users who build in public',
      async (ctx) => {
        const twitterUser = TWITTER_USERS[0]
        sinon.stub(users, 'getUsers').returns(USERS)
        const stub = sinon.stub(twitter, 'getUser').resolves({
          ...twitterUser,
          public_metrics: {
            followers_count: 10
          }
        })
        await logBuildInPublicTwitterUsersWithFollowersCount(0)
        expect(ctx.stdout).to.contain(
          JSON.stringify({ ...twitterUser, followers: 10 })
        )
        expect(stub.calledWith(twitterUser.username)).to.be.true
      }
    )

  test.stdout().it('process users', async (ctx) => {
    sinon.stub(fs.promises, 'readFile').resolves(JSON.stringify(USERS))
    sinon.stub(fs.promises, 'writeFile').resolves()

    sinon.stub(users, 'getUsers').returns(USERS_PROCESSED)
    const stub = sinon.stub(command, 'logAndPromptFollow').resolves()

    await processUsersInTheBackground(false, 0)

    const { username } = USERS_PROCESSED[1]
    expect(stub.calledWith([username])).to.be.true
    expect(ctx.stdout).to.contain(`Process ${username}`)
  })
})
