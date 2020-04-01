const http = require('http');

const interval = process.env.INTERVAL || 2000;
const duration = process.env.DURATION || 10000;

http.createServer(async (req, res) => {
  const currentTime = () => new Date().toUTCString();

  console.log(currentTime());

  const timer = setInterval(currentTime(), interval);

  setTimeout(() => {
    clearInterval(timer);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(currentTime());
  }, duration);
}).listen(8080);
