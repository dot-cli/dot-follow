export enum Keys {
  AUTH = 'auth',
  FOLLOWING = 'following'
}

export enum AuthKey {
  TEST = 'test',
  TWITTER = 'twitter',
  GITHUB = 'github'
}

export enum FollowingKey {
  TEST = 'test',
  TWITTER = 'twitter',
  GITHUB = 'github'
}

export interface Following {
  following: string[]
  evalTimestamp: number
}
