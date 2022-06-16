import axios from 'axios'
import { expect } from 'chai'
import * as sinon from 'sinon'

import { getUser, getReadme } from 'lib/github'

describe('github', () => {
  afterEach(() => sinon.restore())

  it('get chico user', async () => {
    const username = 'chico'
    const mockData = { twitter_username: 'ccharlesworth' }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockData })

    expect(await getUser(username)).to.equal(mockData)

    const apiUrl = `https://api.github.com/users/${username}`
    expect(stub.calledWith(apiUrl)).to.be.true
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
