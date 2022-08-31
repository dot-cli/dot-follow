import axios from 'axios'
import { expect } from 'chai'
import * as sinon from 'sinon'

import * as config from 'lib/config'
import * as twitter from 'lib/twitter'
import {
  BASE_API_URL,
  AUTH_REFRESH_TOKEN_URL,
  USER_FIELDS,
  TWITTER_ERRORS,
  getAuthToken,
  getAuthUserId,
  getUser,
  getFollowingUserIdsByUserId,
  getFollowingByUserId,
  getFollowersByUserId,
  followUser,
  getLists,
  pinList,
  getOrCreateList,
  createList,
  getListMembers,
  addUsersToList,
  addUsersToListByName
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

    const apiUrl = `${BASE_API_URL}/users/by/username/${mockData.username}?expansions=pinned_tweet_id&user.fields=${USER_FIELDS}`

    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('get auth user id', async () => {
    const mockData = { data: { id: '24870588' } }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockData })

    expect(await getAuthUserId()).to.deep.equal(mockData.data.id)

    const apiUrl = `${BASE_API_URL}/users/me?user.fields=id`
    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('get following user IDs', async () => {
    const userId = '24870588'
    const followingUserIds = ['11111111', '22222222']
    const nextToken = 'testNextToken'
    const firstResponse = {
      data: [{ id: followingUserIds[0] }],
      meta: { next_token: nextToken }
    }
    const secondResponse = {
      data: [{ id: followingUserIds[1] }],
      meta: {}
    }
    const stub = sinon
      .stub(axios, 'get')
      .onCall(0)
      .resolves({ data: firstResponse })
      .onCall(1)
      .resolves({ data: secondResponse })

    expect(await getFollowingUserIdsByUserId(userId)).to.deep.equal(
      followingUserIds
    )

    const firstApiUrl = `${BASE_API_URL}/users/${userId}/following?user.fields=id,username&max_results=1000`
    const secondApiUrl = firstApiUrl + `&pagination_token=${nextToken}`
    expect(stub.calledWith(firstApiUrl) && stub.calledWith(secondApiUrl)).to.be
      .true
  })

  it('get following', async () => {
    const userId = '24870588'
    const following = [
      { id: '11111111', username: 'test' },
      { id: '22222222', username: 'test2' }
    ]
    const nextToken = 'testNextToken'
    const firstResponse = {
      data: [following[0]],
      meta: { next_token: nextToken }
    }
    const secondResponse = {
      data: [following[1]],
      meta: {}
    }
    const stub = sinon
      .stub(axios, 'get')
      .onCall(0)
      .resolves({ data: firstResponse })
      .onCall(1)
      .resolves({ data: secondResponse })

    expect(await getFollowingByUserId(userId)).to.deep.equal(following)

    const firstApiUrl = `${BASE_API_URL}/users/${userId}/following?user.fields=${USER_FIELDS}&max_results=1000`
    const secondApiUrl = firstApiUrl + `&pagination_token=${nextToken}`
    expect(stub.calledWith(firstApiUrl) && stub.calledWith(secondApiUrl)).to.be
      .true
  })

  it('get followers', async () => {
    const userId = '24870588'
    const followers = [
      { id: '11111111', username: 'test' },
      { id: '22222222', username: 'test2' }
    ]
    const nextToken = 'testNextToken'
    const firstResponse = {
      data: [followers[0]],
      meta: { next_token: nextToken }
    }
    const secondResponse = {
      data: [followers[1]],
      meta: {}
    }
    const stub = sinon
      .stub(axios, 'get')
      .onCall(0)
      .resolves({ data: firstResponse })
      .onCall(1)
      .resolves({ data: secondResponse })

    expect(await getFollowersByUserId(userId)).to.deep.equal(followers)

    const firstApiUrl = `${BASE_API_URL}/users/${userId}/followers?user.fields=${USER_FIELDS}&max_results=1000`
    const secondApiUrl = firstApiUrl + `&pagination_token=${nextToken}`
    expect(stub.calledWith(firstApiUrl) && stub.calledWith(secondApiUrl)).to.be
      .true
  })

  it('follow user', async () => {
    const getStub = sinon.stub(axios, 'get')
    const me = { id: '24870588' }

    let apiUrl = `${BASE_API_URL}/users/me?user.fields=id`
    let mockData = { data: { id: me.id } }
    getStub.withArgs(apiUrl).resolves({ data: mockData })

    const userToFollow = {
      id: '11111111',
      username: 'test'
    }
    apiUrl = `${BASE_API_URL}/users/by/username/${userToFollow.username}?expansions=pinned_tweet_id&user.fields=${USER_FIELDS}`
    mockData = { data: { id: userToFollow.id } }
    getStub.withArgs(apiUrl).resolves({ data: mockData })

    const stub = sinon.stub(axios, 'post').resolves()
    await followUser(userToFollow.username)

    apiUrl = `${BASE_API_URL}/users/${me.id}/following`
    expect(stub.calledWith(apiUrl, { target_user_id: userToFollow.id })).to.be
      .true
  })

  it('get lists', async () => {
    const me = { id: '24870588' }
    const lists = [
      { id: '11111111', name: 'test' },
      { id: '22222222', name: 'test2' }
    ]
    const nextToken = 'testNextToken'
    const authResponse = { data: { id: me.id } }
    const firstResponse = {
      data: [lists[0]],
      meta: { next_token: nextToken }
    }
    const secondResponse = {
      data: [lists[1]],
      meta: {}
    }
    const stub = sinon
      .stub(axios, 'get')
      .onCall(0)
      .resolves({ data: authResponse })
      .onCall(1)
      .resolves({ data: firstResponse })
      .onCall(2)
      .resolves({ data: secondResponse })

    expect(await getLists()).to.deep.equal(lists)

    const firstApiUrl = `${BASE_API_URL}/users/${me.id}/owned_lists`
    const secondApiUrl = firstApiUrl + `?pagination_token=${nextToken}`
    expect(stub.calledWith(firstApiUrl) && stub.calledWith(secondApiUrl)).to.be
      .true
  })

  it('get list members', async () => {
    const listId = '11111111'
    const members = [
      { id: '11111111', username: 'test' },
      { id: '22222222', username: 'test2' }
    ]
    const nextToken = 'testNextToken'
    const firstResponse = {
      data: [members[0]],
      meta: { next_token: nextToken }
    }
    const secondResponse = {
      data: [members[1]],
      meta: {}
    }
    const stub = sinon
      .stub(axios, 'get')
      .onCall(0)
      .resolves({ data: firstResponse })
      .onCall(1)
      .resolves({ data: secondResponse })

    expect(await getListMembers(listId)).to.deep.equal(members)

    const firstApiUrl = `${BASE_API_URL}/lists/${listId}/members`
    const secondApiUrl = firstApiUrl + `?pagination_token=${nextToken}`
    expect(stub.calledWith(firstApiUrl) && stub.calledWith(secondApiUrl)).to.be
      .true
  })

  it('pin list', async () => {
    const getStub = sinon.stub(axios, 'get')
    const me = { id: '24870588' }

    let apiUrl = `${BASE_API_URL}/users/me?user.fields=id`
    let mockData = { data: { id: me.id } }
    getStub.withArgs(apiUrl).resolves({ data: mockData })

    const listToPin = {
      id: '11111111',
      name: 'Test'
    }
    apiUrl = `${BASE_API_URL}/users/${me.id}/pinned_lists`
    mockData = { data: listToPin }

    const stub = sinon.stub(axios, 'post').resolves({ data: mockData })
    await pinList(listToPin.id)

    apiUrl = `${BASE_API_URL}/users/${me.id}/pinned_lists`
    expect(stub.calledWith(apiUrl, { list_id: listToPin.id })).to.be.true
  })

  it('get or create list', async () => {
    const list = { id: '44444444', name: 'NewList' }
    sinon.stub(twitter, 'getLists').resolves([{ id: '33333333', name: 'Test' }])
    sinon.stub(twitter, 'createList').resolves(list)
    expect(await getOrCreateList(list.name)).to.be.equal(list)
  })

  it('create list', async () => {
    const getStub = sinon.stub(axios, 'get')
    const me = { id: '24870588' }

    let apiUrl = `${BASE_API_URL}/users/me?user.fields=id`
    let mockData = { data: { id: me.id } }
    getStub.withArgs(apiUrl).resolves({ data: mockData })

    const listToCreate = { name: 'Test', private: true }
    apiUrl = `${BASE_API_URL}/lists`
    mockData = { data: { id: '11111111', ...listToCreate } }

    const stub = sinon.stub(axios, 'post').resolves({ data: mockData })
    await createList(listToCreate.name, false)

    apiUrl = `${BASE_API_URL}/lists`
    expect(stub.calledWith(apiUrl, listToCreate)).to.be.true
  })

  it('add users to list', async () => {
    const stub = sinon.stub(axios, 'post').resolves()

    const listId = '33333333'
    const users = [
      { id: '11111111', username: 'test1' },
      { id: '22222222', username: 'test2' }
    ]
    await addUsersToList(listId, users, 0)

    const apiUrl = `${BASE_API_URL}/lists/${listId}/members`
    expect(
      stub.calledWith(apiUrl, { user_id: users[0].id }) &&
        stub.calledWith(apiUrl, { user_id: users[1].id })
    ).to.be.true
  })

  it('add users to list by name', async () => {
    const list = { id: '33333333' }
    const users = [
      { id: '11111111', username: 'test1' },
      { id: '22222222', username: 'test2' }
    ]
    sinon.stub(twitter, 'getOrCreateList').resolves(list)
    sinon
      .stub(twitter, 'getListMembers')
      .resolves([{ id: '22222222', username: 'test2' }])
    const stub = sinon.stub(twitter, 'addUsersToList').resolves()

    await addUsersToListByName('Test', users, 0)

    expect(stub.calledWith(list.id, [users[0]], 0)).to.be.true
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
