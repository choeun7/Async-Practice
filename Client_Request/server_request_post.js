var http = require('http');
var querystring = require('querystring');

var server = http.createServer(function(request, response) {
    
    var postdata = '';
    //request 객체에 on() 함수로 'data' 이벤트를 연결
    request.on('data', function (data) {
        //data 이벤트 발생할 때마다 callback을 통해 저장
        postdata = postdata + data;
    });

    //request 객체에 on() 함수로 'end' 이벤트를 연결
    request.on('end', function() {
        //end는 한번만 발생 -> 저장된 postdata를 querystring으로 객체화
        var parsedQuery = querystring.parse(postdata);
        console.log(parsedQuery);

        response.writeHead(200, {'Content-Type':'text/html;charset=UTF-8'});
        response.end('var1의 값은 '+parsedQuery.var1);
    });
    
});

server.listen(8080, function() {
    console.log('Server is running...');
});