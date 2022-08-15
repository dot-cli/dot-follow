import { expect, test } from '@oclif/test'
import * as sinon from 'sinon'

import cmd from 'commands/scan'

import { Sites } from 'lib/constants'
import * as github from 'lib/github'
import * as links from 'lib/links'
import { buildSocialLink } from 'lib/links/dev-links'
import * as prompt from 'lib/prompt'
import * as twitter from 'lib/twitter'
import type { GithubUser, Link } from 'lib/types'

const LOGIN = 'test_login'
const FRIEND = {
  login: 'friend',
  name: 'Friend',
  company: '@test',
  bio: 'Friend Bio',
  blog: 'Friend Blog',
  twitter_username: 'friend',
  followers: 10,
  following: 5
}
const FOLLOWER = {
  login: 'follower',
  name: 'Github Follower Name',
  company: '@test',
  bio: 'Follower bio https://follower.com',
  blog: 'http://follower.com',
  twitter_username: 'follower',
  followers: 10,
  following: 5
}
const FOLLOWERS: GithubUser[] = [FRIEND, FOLLOWER]
const FOLLOWING: GithubUser[] = [FRIEND]

const FOLLOWER_TWITTER_PROFILE = {
  id: '11111111',
  username: 'follower',
  name: 'Twitter Follower Name',
  description: 'Follower description https://follower.com',
  url: 'http://follower.com',
  protected: false,
  verified: false,
  pinnedTweet: 'Test pinned tweet https://test.com',
  public_metrics: {
    followers_count: 20,
    following_count: 15,
    tweet_count: 100
  }
}

const LINKS: Link[] = [
  buildSocialLink(Sites.Github.title, FOLLOWER.login),
  buildSocialLink(Sites.Twitter.title, FOLLOWER.login)
]

describe('scan', () => {
  beforeEach(() => {
    sinon.stub(prompt, 'keypress').resolves()
    sinon.stub(github, 'getUserProfile').resolves({ login: LOGIN })
    sinon.stub(prompt, 'confirm').resolves(true)

    const getGithubUsersStub = sinon.stub(github, 'getUsers')
    getGithubUsersStub.withArgs(`${LOGIN}/followers`).resolves(FOLLOWERS)
    getGithubUsersStub.withArgs(`${LOGIN}/following`).resolves(FOLLOWING)
    getGithubUsersStub.withArgs(FOLLOWER.login).resolves([FOLLOWER])

    sinon
      .stub(twitter, 'getUser')
      .withArgs(FOLLOWER.login)
      .resolves(FOLLOWER_TWITTER_PROFILE)

    sinon.stub(links, 'getUserDevLinks').resolves(LINKS)
    sinon.stub(github, 'followUser').resolves()
    sinon.stub(twitter, 'followUser').resolves()
  })

  test.stdout().it('scan', async (ctx) => {
    await cmd.run([])
    expect(ctx.stdout).to.contain('Found 1 Github user to review')
    expect(ctx.stdout).to.contain('Scanning follower...')
    expect(ctx.stdout).to.contain('Github: https://github.com/follower')
    expect(ctx.stdout).to.contain('Name: Github Follower Name')
    expect(ctx.stdout).to.contain('Company: https://github.com/test')
    expect(ctx.stdout).to.contain('Website: http://follower.com')
    expect(ctx.stdout).to.contain('Followers: 10')
    expect(ctx.stdout).to.contain('Following: 5')
    expect(ctx.stdout).to.contain('Bio:')
    expect(ctx.stdout).to.contain('│ Follower bio https://follower.com')
    expect(ctx.stdout).to.contain('Twitter: https://twitter.com/follower')
    expect(ctx.stdout).to.contain('Name: Twitter Follower Name')
    expect(ctx.stdout).to.contain('Followers: 20')
    expect(ctx.stdout).to.contain('Following: 15')
    expect(ctx.stdout).to.contain('Tweets: 100')
    expect(ctx.stdout).to.contain('Protected: false')
    expect(ctx.stdout).to.contain('Verified: false')
    expect(ctx.stdout).to.contain('Description:')
    expect(ctx.stdout).to.contain('│ Follower description https://follower.com')
    expect(ctx.stdout).to.contain('PinnedTweet:')
    expect(ctx.stdout).to.contain('│ Test pinned tweet https://test.com')
    expect(ctx.stdout).to.contain(`You're now following ${FOLLOWER.login} 🎉`)
    expect(ctx.stdout).to.contain('Scan done')
  })
})
