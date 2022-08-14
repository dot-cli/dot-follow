import { expect, test } from '@oclif/test'
import axios from 'axios'
import * as sinon from 'sinon'

import cmd from 'commands/setup'

import * as config from 'lib/config'
import * as github from 'lib/github'
import * as prompt from 'lib/prompt'
import { AUTH_PIN_URL } from 'lib/twitter'
import * as url from 'lib/url'

const GITHUB_TOKEN = 'github_token'
const PIN = '1234567'

describe('setup', () => {
  beforeEach(() => {
    sinon.stub(prompt, 'keypress').resolves()
    sinon.stub(url, 'openUrl').resolves()
    sinon.stub(prompt, 'question').resolves(PIN)
    sinon.stub(github, 'getAuthTokenByOAuth').resolves(GITHUB_TOKEN)
    sinon.stub(config, 'setAuth').resolves()
  })

  test.stdout().it('setup', async (ctx) => {
    const mockData = {
      token: { access_token: 'test_access_token' }
    }
    const stub = sinon.stub(axios, 'get').resolves({ data: mockData })

    await cmd.run([])

    expect(stub.calledWith(`${AUTH_PIN_URL}${PIN}`)).to.be.true
    expect(ctx.stdout).to.contain('Setup done')
  })

  test.stdout().it('setup fails', async (ctx) => {
    const errorResponse = { response: { status: 404 } }
    sinon.stub(axios, 'get').rejects(errorResponse)

    await cmd.run([])
    expect(ctx.stdout).to.contain('Something went wrong')
  })
})
