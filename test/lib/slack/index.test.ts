import { expect } from 'chai'
import * as sinon from 'sinon'
// @ts-ignore
import SlackWebhook from 'slack-webhook'

import { postMessage } from 'lib/slack'

describe('slack', () => {
  it('post message', async () => {
    const stub = sinon.stub(SlackWebhook.prototype, 'send')
    const message = { text: 'This is a test' }
    postMessage(message)
    expect(stub.calledWith(message)).to.be.true
  })
})
