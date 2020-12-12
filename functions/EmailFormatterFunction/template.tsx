import React from 'react';
import {SESMessage, SESReceiptS3Action, SNSMessage} from 'aws-lambda';
import sanitizeHtml from 'sanitize-html';
import {S3} from 'aws-sdk';
import {simpleParser, Source} from 'mailparser';

const s3 = new S3()

export default async function Template({message}: {message: SNSMessage}) {
  let sesMessage = JSON.parse(message.Message) as SESMessage;

  const destination = sesMessage.mail.destination.reduce((a, b) => `${a}, ${b}`);

  const s3Action = sesMessage.receipt.action as SESReceiptS3Action
  const s3Path = `s3://${s3Action.bucketName}/${s3Action.objectKey}`;
  const bucketParams = {
    Bucket: s3Action.bucketName,
    Key: s3Action.objectKey,
  };

  const email = (await s3.getObject(bucketParams).promise()).Body
  const data = await simpleParser(email as Source);
  const preview = data.html || "No preview available";

  const downloadLink = s3.getSignedUrl('getObject', bucketParams);

  return (
    <>
      <p>Hi, Barry</p>
      <p>An email was just sent to your website! Here are the details:</p>
      <p><b>To:</b> {destination}</p>
      <p><b>From:</b> {sesMessage.mail.source}</p>
      <p><b>Subject:</b> {sesMessage.mail.commonHeaders.subject}</p>
      <p><b>S3 Path:</b> <a href={s3Path}>{s3Path}</a></p>
      <p><b>Download Link:</b> <a href={downloadLink}>{downloadLink}</a></p>

      <p><b>Preview:</b></p>
      <div dangerouslySetInnerHTML={{__html: sanitizeHtml(preview)}}/>
    </>
  );
}
