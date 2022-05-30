import axios from 'axios'
import { expect } from 'chai'
import * as sinon from 'sinon'

// eslint-disable-next-line node/no-missing-import
import { getUser } from 'lib/github'

describe('github', () => {
  afterEach(() => sinon.restore())

  it('get chico user', async () => {
    const username = 'chico'
    const mockData = { twitter_username: 'ccharlesworth' }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockData })

    expect(await getUser(username)).to.equal(mockData)

    expect(stub.calledWith(`https://api.github.com/users/${username}`)).to.be
      .true
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
