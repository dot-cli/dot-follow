// @ts-ignore
import SlackWebhook from 'slack-webhook'

const webhookURL = process.env.DOT_FOLLOW_SLACK_WEBHOOK

const slackWebhook =
  webhookURL && webhookURL.trim().length > 0
    ? new SlackWebhook(webhookURL)
    : null

interface SlackMessage {
  text: string
  channel?: string
  icon_emoji?: string // eslint-disable-line camelcase
}

export const postMessage = async (message: SlackMessage): Promise<void> => {
  if (!slackWebhook) {
    return
  }
  await slackWebhook.send({ ...message })
}
