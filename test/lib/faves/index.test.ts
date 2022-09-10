import { expect } from 'chai'

import { getFave, setFave } from 'lib/faves'
import { FaveType } from 'lib/faves'

describe('faves', () => {
  it('get & set fave value', async () => {
    const fave = {
      key: 'faveTest',
      id: '11111111',
      following: [
        {
          key: 'followingTest',
          evalTimestamp: Date.now(),
          ignore: true
        }
      ]
    }
    await setFave(FaveType.Test, fave)
    expect(await getFave(FaveType.Test, fave.key)).to.deep.equal(fave)
  })
})
