import React from 'react';
import {SESMessage, SESReceiptS3Action, SNSMessage} from 'aws-lambda';
import sanitizeHtml from 'sanitize-html';

interface ContentSESMessage extends SESMessage {
  content?: string;
}

export default function Template({message}: {message: SNSMessage}) {
  console.log(JSON.stringify(message));
  let sesMessage = JSON.parse(message.Message) as ContentSESMessage;

  const s3Action = sesMessage.receipt.action as SESReceiptS3Action
  const s3Path = `s3://${s3Action.bucketName}/${s3Action.objectKey}`;

  const preview = sesMessage.content || "No preview available";

  const destination = sesMessage.mail.destination.reduce((a, b) => `${a}, ${b}`);
  return (
    <>
      <p>Hi, Barry</p>
      <p>An email was just sent to your website!</p>
      <table>
        <tr>
          <td style={{textAlign: 'right'}}><b>To:</b></td>
          <td>{destination}</td>
        </tr>
        <tr>
          <td style={{textAlign: 'right'}}><b>From:</b></td>
          <td>{sesMessage.mail.source}</td>
        </tr>
        <tr>
          <td style={{textAlign: 'right'}}><b>Subject:</b></td>
          <td>{sesMessage.mail.commonHeaders.subject}</td>
        </tr>
      </table>
      <p><b>S3 Path:</b> <a href={s3Path}>{s3Path}</a></p>

      <div dangerouslySetInnerHTML={{__html: sanitizeHtml(preview)}}/>
    </>
  );
}
