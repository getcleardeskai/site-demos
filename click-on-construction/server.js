const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8934;
const mime = {'.html':'text/html','.css':'text/css','.js':'application/javascript','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if(urlPath === '/' || urlPath === '') urlPath = '/index.html';
  let p = path.join(__dirname, urlPath);
  fs.readFile(p, (err,data)=>{
    if(err){res.writeHead(404);res.end('not found');return;}
    res.writeHead(200,{'Content-Type': mime[path.extname(p)] || 'application/octet-stream'});
    res.end(data);
  });
}).listen(port, ()=>console.log('serving on '+port));
