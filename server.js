const http = require('http');
const fs = require('fs');
const path = require('path');

const query = require('./db/query');
const mimeType = require('./config/mimeType.json');


http.createServer((request, response) => {
    const ext = path.parse(request.url).ext;
    const publicPath = path.join(__dirname, 'src');
    const fullPath = publicPath + request.url
    const indexPath = `${publicPath}/index.html`;

    if(Object.keys(mimeType).includes(ext)) {
        readFile(response, `${fullPath}`, ext);
    }
    else {
        if(request.url.indexOf('/search') > -1 ) {
            query.singl(request, response);
        }
        else if(request.url.indexOf('/detail') > -1 ) {
            query.detail(request, response);
        }
        else {
            readFile(response, indexPath, '.html');
        }

    }
}).listen(4000);

const readFile = (response, path, ext) => {
    fs.readFile(path, (err, data) => {
        if (err) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/plain');
            response.end('Page Not Found');
        }
        else {
            response.statusCode = 200;
            response.setHeader('Content-Type', mimeType[ext]);
            response.end(data);
        }
    });
};