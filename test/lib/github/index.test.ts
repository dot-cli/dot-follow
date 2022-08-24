import * as graphql from '@octokit/graphql'
import axios from 'axios'
import { expect } from 'chai'
// @ts-ignore
import Github from 'github-api'
import * as sinon from 'sinon'

import {
  getUserProfile,
  getUser,
  getUsersThatExist,
  followUser,
  getReadme
} from 'lib/github'

describe('github', () => {
  afterEach(() => sinon.restore())

  it('get profile', async () => {
    const mockProfile = {
      login: 'test',
      name: 'Test Tester',
      company: 'test.org',
      bio: 'Test bio',
      blog: 'Test blog',
      twitter_username: 'test',
      followers: 10,
      following: 5
    }
    sinon.stub(Github.prototype, 'getUser').returns({
      getProfile: async () => ({
        data: mockProfile
      })
    })

    expect(await getUserProfile()).to.deep.equal(mockProfile)
  })

  it('get chico user', async () => {
    const username = 'chico'
    const mockData = { twitter_username: 'ccharlesworth' }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockData })

    expect(await getUser(username)).to.equal(mockData)

    const apiUrl = `https://api.github.com/users/${username}`
    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('get users that exist', async () => {
    const users = ['user1', 'user2']
    sinon.stub(graphql, 'graphql').resolves({
      user1: { login: 'user1', name: 'Number 1' },
      user2: { login: 'user2' }
    })
    const usersThatExist = await getUsersThatExist(users)
    // user2 not included as it has no name
    expect(usersThatExist).to.eql(['user1'])
  })

  it('get users that exist where some do not exist', async () => {
    const users = ['user1', 'notfound']

    const data = [{ login: 'user1', name: 'Number 1' }, null]
    sinon.stub(graphql, 'graphql').throws(
      new graphql.GraphqlResponseError(
        { method: 'GET', url: '' },
        {},
        {
          data,
          errors: [
            {
              type: '',
              message: '',
              path: [''],
              extensions: {},
              locations: [{ line: 1, column: 1 }]
            }
          ]
        }
      )
    )

    const usersThatExist = await getUsersThatExist(users)
    expect(usersThatExist).to.eql(['user1'])
  })

  it('follow user', async () => {
    const stub = sinon.stub().resolves()
    sinon.stub(Github.prototype, 'getUser').returns({ follow: stub })

    const usernameToFollow = 'test'
    await followUser(usernameToFollow)

    expect(stub.calledWith(usernameToFollow)).to.be.true
  })

  it('not found response', async () => {
    sinon.stub(axios, 'get').rejects({ response: { status: 404 } })
    expect(await getUser('not-a-github-user')).to.be.null
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

describe('readme', () => {
  afterEach(() => sinon.restore())

  it('get readme for chico', async () => {
    const username = 'chico'
    const readmeText = 'Test Readme'
    const stub = sinon.stub(axios, 'get').resolves({ data: readmeText })

    expect(await getReadme(username)).to.equal(readmeText)

    const apiUrl = `https://raw.githubusercontent.com/${username}/${username}/master/README.md`
    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('not found readme', async () => {
    sinon.stub(axios, 'get').rejects({ response: { status: 404 } })
    expect(await getReadme('not-a-github-user')).to.be.null
  })

  it('failed response', async () => {
    const errorResponse = { response: { status: 500 } }
    sinon.stub(axios, 'get').rejects(errorResponse)
    try {
      await getReadme('api-error')
    } catch (error) {
      expect(error).to.equal(errorResponse)
      return
    }
    throw new Error('Error response expected')
  })
})
