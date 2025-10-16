const http = require('http');
const { convertToCase } = require('./convertToCase/convertToCase');

function createServer() {
  return http.createServer((req, res) => {
    const [path, queryString] = req.url.split('?');
    const text = decodeURIComponent(path.slice(1));
    const params = new URLSearchParams(queryString || '');
    const toCase = params.get('toCase');

    const availableCases = ['SNAKE', 'KEBAB', 'CAMEL', 'PASCAL', 'UPPER'];
    const errors = [];

    if (!text) {
      errors.push({
        message:
          'Text to convert is required.' + 
          'Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
      });
    }

    if (!toCase) {
      errors.push({
        message:
          '"toCase" query param is required.' +
          'Correct request is: "/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".',
      });
    } else if (!availableCases.includes(toCase)) {
      errors.push({
        message:
          'This case is not supported.' +
          'Available cases: SNAKE, KEBAB, CAMEL, PASCAL, UPPER.',
      });
    }

    if (errors.length > 0) {
      res.writeHead(400, 'Bad request', { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ errors }));

      return;
    }

    try {
      const { originalCase, convertedText } = convertToCase(toCase, text);

      const response = {
        originalCase,
        targetCase: toCase,
        originalText: text,
        convertedText,
      };

      res.writeHead(200, 'OK', { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    } catch (err) {
      res.writeHead(500, 'Internal Server Error', {
        'Content-Type': 'application/json',
      });

      res.end(
        JSON.stringify({
          errors: [{ message: 'Internal server error: ' + err.message }],
        }),
      );
    }
  });
}

module.exports = { createServer };
