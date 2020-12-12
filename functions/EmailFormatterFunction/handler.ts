import {SNSEvent, SNSMessage} from 'aws-lambda';
import {SES} from 'aws-sdk';
import {SendEmailRequest} from 'aws-sdk/clients/ses';
import {renderToStaticMarkup} from 'react-dom/server';
import Template from "./template"

const SENDER_EMAIL = process.env.SENDER_EMAIL!;
const RECIPIENT_EMAIL = process.env.RECIPIENT_EMAIL!;

const ses = new SES({
  region: "us-east-1",
});

async function sendEmail(message: SNSMessage) {
  const body = renderToStaticMarkup(Template({message}));
  console.log(`Body:\n${body}\n`);
  const params: SendEmailRequest = {
    Destination: {
      ToAddresses: [RECIPIENT_EMAIL],
    },
    Message: {
      Body: {
        Html: { Data: body },
      },

      Subject: { Data: "SES Email Received" },
    },
    Source: SENDER_EMAIL,
  };

  return ses.sendEmail(params).promise();
}

export async function handler(event: SNSEvent) {
  let promises = event.Records.map(async r => await sendEmail(r.Sns));
  return await Promise.all(promises);
}
