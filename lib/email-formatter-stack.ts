import * as cdk from '@aws-cdk/core';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Effect, PolicyStatement} from '@aws-cdk/aws-iam';
import {Bucket} from '@aws-cdk/aws-s3';

const SENDER_EMAIL = "notify@bmcandrews.com";
const RECIPIENT_EMAIL = "bmcandrews3@hotmail.com";
const SES_S3_BUCKET_NAME = "ses-emails-bmcandrews";

export class EmailFormatterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const formatterFunction = new NodejsFunction(this, 'emailFormatterFunction', {
      entry: 'functions/EmailFormatterFunction/handler.ts',
      handler: 'handler',
      environment: {
        SENDER_EMAIL: SENDER_EMAIL,
        RECIPIENT_EMAIL: RECIPIENT_EMAIL,
      }
    });

    const sesBucket = Bucket.fromBucketName(this, 'BucketByName', SES_S3_BUCKET_NAME);
    sesBucket.grantRead(formatterFunction);

    formatterFunction.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["ses:SendEmail", "ses:SendRawEmail"],
      resources: ["*"],
      conditions: {
        StringEquals: {
          "ses:FromAddress": SENDER_EMAIL,
        }
      }
    }));
  }
}
