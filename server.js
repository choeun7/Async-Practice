var http = require('http');

var server = http.createServer(function(request, response) {

    response.writeHead(200, {'Content-Type':'text/html;charset=UTF-8'});
    response.end('var1의 값은 '+parsedQuery.var1);

});

server.listen(8080, function() {
    console.log('Server is running...');
})