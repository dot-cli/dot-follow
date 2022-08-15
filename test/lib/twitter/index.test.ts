import axios from 'axios'
import { expect } from 'chai'
import * as sinon from 'sinon'

import * as config from 'lib/config'
import {
  AUTH_REFRESH_TOKEN_URL,
  USER_FIELDS,
  TWITTER_ERRORS,
  getAuthToken,
  getAuthUserId,
  getUser,
  followUser
} from 'lib/twitter'

const ONE_MIN = 60 * 1000
const ONE_MIN_IN_THE_FUTURE = new Date(Date.now() + ONE_MIN).toISOString()
const AUTH_TOKEN = {
  token_type: 'bearer',
  access_token: 'test_access_token',
  refresh_token: 'test_refresh_token',
  expires_at: ONE_MIN_IN_THE_FUTURE,
  scope: 'users.read tweet.read offline.access follows.write'
}
const REFRESHED_AUTH_TOKEN = {
  token_type: 'bearer',
  access_token: 'refreshed_access_token',
  refresh_token: 'refreshed_refresh_token',
  expires_at: ONE_MIN_IN_THE_FUTURE,
  scope: 'users.read tweet.read offline.access follows.write'
}

let getAuthStub = sinon.stub()

describe('twitter', () => {
  beforeEach(() => {
    getAuthStub = sinon.stub(config, 'getAuth').resolves(AUTH_TOKEN)
    sinon.stub(config, 'setAuth').resolves()
  })
  afterEach(() => sinon.restore())

  it('get auth token', async () => {
    getAuthStub.resolves({
      ...AUTH_TOKEN,
      expires_at: new Date().toISOString()
    })

    const mockData = { data: { token: REFRESHED_AUTH_TOKEN } }
    const stub = sinon.stub(axios, 'get').resolves(mockData)

    expect(await getAuthToken()).to.deep.equal(
      REFRESHED_AUTH_TOKEN.access_token
    )

    const apiUrl = `${AUTH_REFRESH_TOKEN_URL}${AUTH_TOKEN.refresh_token}`
    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('get ccharlesworth user', async () => {
    const pinnedTweet =
      'The startup conversations podcast series by @gonsanchezs is great 🎙️, my first podcast interview, thank you Gonz!'
    const mockData = {
      id: '24870588',
      username: 'ccharlesworth',
      description:
        'CTO @ https://brdg.app. ♥️ Code, Robots & CLIs. What I do for fun 👉 @codeandrobots, @clidevs, @lenkacam.',
      url: 'http://chicocharlesworth.com',
      pinned_tweet_id: '1447849829967798277',
      pinnedTweet,
      entities: {
        url: {
          urls: [
            {
              url: 'https://t.co/mLvwvEunQX',
              expanded_url: 'http://chicocharlesworth.com'
            }
          ]
        },
        description: {
          urls: [
            {
              url: 'https://t.co/HmZI5D5Ooh',
              expanded_url: 'https://brdg.app'
            }
          ]
        }
      }
    }
    const mockResponse = {
      data: {
        ...mockData,
        url: 'https://t.co/mLvwvEunQX',
        description:
          'CTO @ https://brdg.app. ♥️ Code, Robots & CLIs. What I do for fun 👉 @codeandrobots, @clidevs, @lenkacam.'
      },
      includes: {
        tweets: [
          {
            id: '1447849829967798277',
            text: pinnedTweet
          }
        ]
      }
    }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockResponse })

    expect(await getUser(mockData.username)).to.deep.equal(mockData)

    const apiUrl = `https://api.twitter.com/2/users/by/username/${mockData.username}?expansions=pinned_tweet_id&user.fields=${USER_FIELDS}`

    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('get auth user id', async () => {
    const mockData = { data: { id: '24870588' } }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockData })

    expect(await getAuthUserId()).to.deep.equal(mockData.data.id)

    const apiUrl = 'https://api.twitter.com/2/users/me?user.fields=id'
    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('follow user', async () => {
    const getStub = sinon.stub(axios, 'get')
    const me = { id: '24870588' }

    let apiUrl = 'https://api.twitter.com/2/users/me?user.fields=id'
    let mockData = { data: { id: me.id } }
    getStub.withArgs(apiUrl).resolves({ data: mockData })

    const userToFollow = {
      id: '11111111',
      username: 'test'
    }
    apiUrl = `https://api.twitter.com/2/users/by/username/${userToFollow.username}?expansions=pinned_tweet_id&user.fields=${USER_FIELDS}`
    mockData = { data: { id: userToFollow.id } }
    getStub.withArgs(apiUrl).resolves({ data: mockData })

    const stub = sinon.stub(axios, 'post').resolves()
    await followUser(userToFollow.username)

    apiUrl = `https://api.twitter.com/2/users/${me.id}/following`
    expect(stub.calledWith(apiUrl, { target_user_id: userToFollow.id })).to.be
      .true
  })

  it('not found response', async () => {
    sinon.stub(axios, 'get').rejects({ response: { status: 404 } })
    expect(await getUser('not-a-twitter-user')).to.be.null
  })

  it('not found user', async () => {
    sinon.stub(axios, 'get').resolves({
      data: {
        errors: [{ title: TWITTER_ERRORS.NotFound }]
      }
    })
    expect(await getUser('not-found-user')).to.be.null
  })

  it('suspended user', async () => {
    sinon.stub(axios, 'get').resolves({
      data: {
        errors: [{ title: TWITTER_ERRORS.Forbidden }]
      }
    })
    expect(await getUser('suspended-user')).to.be.null
  })

  it('failed response', async () => {
    const errorResponse = { response: { status: 500 } }
    sinon.stub(axios, 'get').rejects(errorResponse)
    try {
      await getUser('api-error')
    } catch (error) {
      expect(error).to.equal(errorResponse)
      return
    }
    throw new Error('Error response expected')
  })
})
