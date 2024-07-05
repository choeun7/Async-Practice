var http = require('http');
var url = require('url');

var server = http.createServer(function(request, response) {
    //실제 요청한 주소 전체
    console.log(request.url);

    //파싱된 url 중 서버 URL에 해당하는 pathname만
    var parseUrl = url.parse(request.url);
    var resource = parseUrl.pathname;
    console.log('resource path = %s', resource);

    if (resource == '/address') {
        response.writeHead(200, {'Content-Type':'text/html;charset=UTF-8'});
        response.end('서울특별시 강남구 논현1동 111');
    } else if (resource == '/phone') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('02-3545-1237');
    } else if (resource == '/name') {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('Hong Gil Dong');
    } else {
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.end('404 Page Not Found');
    }
});

//http의 default 포트가 80번이라 localhost만 검색해도 됨
server.listen(80, function(){
    console.log('Server is running...');        
});