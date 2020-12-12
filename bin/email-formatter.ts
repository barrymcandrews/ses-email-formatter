#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EmailFormatterStack } from '../lib/email-formatter-stack';

const app = new cdk.App();
new EmailFormatterStack(app, 'bmcandrews-prod-email-formatter');
