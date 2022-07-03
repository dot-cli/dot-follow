import axios from 'axios'
import { expect } from 'chai'
import * as sinon from 'sinon'

import { getUser } from 'lib/twitter'

const token = 'mock_twitter_token'

describe('twitter', () => {
  afterEach(() => sinon.restore())

  it('get ccharlesworth user', async () => {
    const username = 'ccharlesworth'
    const mockData = {
      data: {
        id: '24870588',
        description:
          'CTO @ https://t.co/HmZI5D5Ooh. ♥️ Code, Robots & CLIs. What I do for fun 👉 @codeandrobots, @clidevs, @lenkacam.',
        username,
        url: 'chicocharlesworth.com'
      }
    }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockData })

    expect(await getUser(token, username)).to.deep.equal(mockData.data)

    const fields = 'description,entities,id,name,url,username'
    const apiUrl = `https://api.twitter.com/2/users/by/username/${username}?user.fields=${fields}`

    expect(stub.calledWith(apiUrl)).to.be.true
  })

  it('not found response', async () => {
    sinon.stub(axios, 'get').rejects({ response: { status: 404 } })
    expect(await getUser('token', 'not-a-twitter-user')).to.be.null
  })

  it('failed response', async () => {
    const errorResponse = { response: { status: 500 } }
    sinon.stub(axios, 'get').rejects(errorResponse)
    try {
      await getUser('token', 'api-error')
    } catch (error) {
      expect(error).to.equal(errorResponse)
      return
    }
    throw new Error('Error response expected')
  })
})
