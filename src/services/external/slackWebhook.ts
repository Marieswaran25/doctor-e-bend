import { IncomingWebhook } from '@slack/webhook';

import { SLACK_WEBHOOK } from '../../config';
export class SlackWebhook {
    private webHook;
    private allowedEnvironments;
    constructor({ webhook, allowedEnvironments }: { webhook: string; allowedEnvironments: string[] }) {
        this.webHook = new IncomingWebhook(webhook);
        this.allowedEnvironments = allowedEnvironments;
    }
    async send({ appEnv, msg, fallBackMsg, title, color = '#D00000' }: { appEnv: string; msg: string; title: string; fallBackMsg?: string; color?: string }) {
        if (this.allowedEnvironments.includes(appEnv)) {
            try {
                await this.webHook.send({
                    attachments: [
                        {
                            fallback: fallBackMsg,
                            color: color,
                            fields: [
                                {
                                    title: title,
                                    value: msg,
                                    short: false,
                                },
                            ],
                        },
                    ],
                });
            } catch (error: any) {
                console.error(`Error while calling slack hook`);
                console.log(error?.message);
            }
        }
    }
}

export const slackWebhook = new SlackWebhook({
    webhook: SLACK_WEBHOOK,
    allowedEnvironments: ['local', 'testing'],
});
