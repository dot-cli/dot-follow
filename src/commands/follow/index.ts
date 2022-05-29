import { Command } from '@oclif/core'

export default class Follow extends Command {
  static description = 'Follow a developer'

  static examples = ['$ oex follow chico']

  static args = [
    { name: 'developer', description: 'Developer to follow', required: true }
  ]

  async run(): Promise<void> {
    const { args } = await this.parse(Follow)

    this.log(`Follow ${args.developer}?`)
  }
}
