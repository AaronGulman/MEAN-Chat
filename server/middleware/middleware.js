function loggerMiddleware(req, res, next) {
  // Capture the request details
  const { method, originalUrl, body } = req;
  console.log(`[${new Date().toISOString()}] ${method} ${originalUrl}`);
  console.log('Request Body:', body);

  // Capture the response body
  const oldSend = res.send;
  res.send = function (body) {
    console.log('Response Body:', body);
    oldSend.apply(res, arguments);
  };

  next();
}

module.exports = loggerMiddleware;
