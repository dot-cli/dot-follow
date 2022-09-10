export enum FaveType {
  Github = 'github',
  Twitter = 'twitter',
  Test = 'test'
}

export interface FaveFollowing {
  key: string
  evalTimestamp: number
  ignore?: boolean
}

export interface Fave {
  key: string
  id: string
  followingCount?: number
  following: FaveFollowing[]
}
