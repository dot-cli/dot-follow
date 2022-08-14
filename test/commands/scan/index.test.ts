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
  name: 'Follower',
  company: '@test',
  bio: 'Followe Bio',
  blog: 'Follower Blog',
  twitter_username: 'follower',
  followers: 10,
  following: 5
}
const FOLLOWERS: GithubUser[] = [FRIEND, FOLLOWER]
const FOLLOWING: GithubUser[] = [FRIEND]

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

    sinon.stub(links, 'getUserDevLinks').resolves(LINKS)
    sinon.stub(github, 'followUser').resolves()
    sinon.stub(twitter, 'followUser').resolves()
  })

  test.stdout().it('scan', async (ctx) => {
    await cmd.run([])
    expect(ctx.stdout).to.contain('Found 1 Github user to review')
    expect(ctx.stdout).to.contain(`You're now following ${FOLLOWER.login} 🎉`)
    expect(ctx.stdout).to.contain('Scan done')
  })
})
