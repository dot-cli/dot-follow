import type { Site } from 'lib/types'
import { SiteType } from 'lib/types'

export const Sites: Record<string, Site> = {
  Website: { type: SiteType.Website, title: 'Website' },
  Blog: { type: SiteType.Blog, title: 'Blog' },
  Github: { type: SiteType.Github, title: 'Github', urlPrefix: 'github.com/' },
  Gitlab: { type: SiteType.Gitlab, title: 'Gitlab', urlPrefix: 'gitlab.com/' },
  Twitter: {
    type: SiteType.Twitter,
    title: 'Twitter',
    urlPrefix: 'twitter.com/'
  },
  Linkedin: {
    type: SiteType.Linkedin,
    title: 'LinkedIn',
    urlPrefix: 'linkedin.com/in/'
  },
  Devto: { type: SiteType.Devto, title: 'Dev.to', urlPrefix: 'dev.to/' },
  Youtube: {
    type: SiteType.Youtube,
    title: 'Youtube',
    urlPrefix: 'youtube.com/'
  },
  Twitch: { type: SiteType.Twitch, title: 'Twitch', urlPrefix: 'twitch.tv/' },
  Instagram: {
    type: SiteType.Instagram,
    title: 'Instagram',
    urlPrefix: 'instagram.com/'
  }
} as const
