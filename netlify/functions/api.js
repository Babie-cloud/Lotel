const serverless = require('serverless-http');
const app = require('../../xp-hotel/app');

exports.handler = serverless(app);