import { expect } from 'chai'

import { getValue, setValue } from 'lib/config'

describe('config', () => {
  it('get & set config value', async () => {
    const key = 'test_key'
    const value = 'test_value'
    await setValue(key, value)
    expect(await getValue(key)).to.equal(value)
  })
})
