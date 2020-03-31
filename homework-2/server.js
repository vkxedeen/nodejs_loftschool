const http = require('http');
const EventEmitter = require('events');

const interval = process.env.INTERVAL || 2000;
const duration = process.env.DURATION || 20000;

http.createServer(function (req, res) {
    let last;
    const showTime = () => {
        last = new Date().toUTCString();
        console.log(last)
    };

    showTime();
    const timer = setInterval(showTime, interval)

    setTimeout(() => {
        clearInterval(timer)
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(last)
    }, duration)

}).listen(8080);