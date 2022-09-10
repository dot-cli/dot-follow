import { expect, test } from '@oclif/test'
import * as sinon from 'sinon'

import { handleError } from 'lib/command'

describe('command', () => {
  beforeEach(() => {
    sinon.stub(console, 'error')
  })

  test.stdout().it('handle error', async (ctx) => {
    const errorMessage = 'Test error'
    try {
      handleError(new Error(errorMessage))
    } catch (error) {
      expect(error.message).to.equal(errorMessage)
    }
    expect(ctx.stdout).to.contain(`Error: ${errorMessage}`)
  })

  test.stdout().it('handle twitter rate limit error', async (ctx) => {
    const errorMessage = 'Request failed with status code 429'
    try {
      handleError(new Error(errorMessage))
    } catch (error) {
      expect(error.message).to.equal(errorMessage)
    }
    expect(ctx.stdout).to.contain(
      'Whoa there! Twitter rate limit exceeded, try again in a few minutes.'
    )
  })
})
