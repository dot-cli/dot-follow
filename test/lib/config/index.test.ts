import { expect } from 'chai'

import { getValue, setValue, AuthKeys, getAuth, setAuth } from 'lib/config'

describe('config', () => {
  it('get & set config value', async () => {
    const key = 'test_key'
    const value = 'test_value'
    await setValue(key, value)
    expect(await getValue(key)).to.equal(value)
  })

  it('get & set config auth value', async () => {
    const testAuthValue = { token: 'test-token' }
    await setAuth(AuthKeys.TEST, testAuthValue)
    expect(await getAuth(AuthKeys.TEST)).to.deep.equal(testAuthValue)
  })
})
