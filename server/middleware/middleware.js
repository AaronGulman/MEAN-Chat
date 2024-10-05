const chalk = require('chalk');

function loggerMiddleware(req, res, next) {
  // Capture the request details
  const { method, originalUrl, body } = req;

  // Color the HTTP methods
  let methodColor;
  switch (method) {
    case 'GET':
      methodColor = chalk.green(method);
      break;
    case 'POST':
      methodColor = chalk.blue(method);
      break;
    case 'PUT':
      methodColor = chalk.yellow(method);
      break;
    case 'DELETE':
      methodColor = chalk.red(method);
      break;
    default:
      methodColor = chalk.white(method);
  }

  console.log(`[${new Date().toISOString()}] ${methodColor} ${originalUrl}`);
  if (body && Object.keys(body).length > 0) {
    console.log('Request Body:', body);
  }

  // Capture the response body
  const oldSend = res.send;
  res.send = function (body) {
    if (body && body.length > 0) {
      console.log('Response Body:', body);
    }
    oldSend.apply(res, arguments);
  };

  next();
}

module.exports = loggerMiddleware;