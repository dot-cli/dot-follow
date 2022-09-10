import { expect } from 'chai'

import {
  getValue,
  setValue,
  AuthKey,
  getAuth,
  setAuth,
  FollowingKey,
  getFollowing,
  setFollowing
} from 'lib/config'

describe('config', () => {
  it('get & set config value', async () => {
    const key = 'test_key'
    const value = 'test_value'
    await setValue(key, value)
    expect(await getValue(key)).to.equal(value)
  })

  it('get & set config auth value', async () => {
    const testAuthValue = { token: 'test-token' }
    await setAuth(AuthKey.TEST, testAuthValue)
    expect(await getAuth(AuthKey.TEST)).to.deep.equal(testAuthValue)
  })

  it('get & set config following value', async () => {
    const testFollowingValue = {
      following: ['following1', 'following2'],
      evalTimestamp: Date.now()
    }
    await setFollowing(FollowingKey.TEST, testFollowingValue)
    expect(await getFollowing(FollowingKey.TEST)).to.deep.equal(
      testFollowingValue
    )
  })
})
