var http = require('http');
var url = require('url');
var fs = require('fs');

// 서버 시작 함수
async function startServer() {
    // 동적 import()를 사용하여 mime 모듈을 불러옵니다.
    const mime = (await import('mime')).default;

    var server = http.createServer(function(request, response) {
        var parsedUrl = url.parse(request.url);
        var resource = parsedUrl.pathname;

        // 요청한 자원의 주소가 '/Images/' 문자열로 시작하면
        if (resource.indexOf('/Images/') == 0) {
            // 첫 글자인 '/Images/'를 제외하고 저장
            var imgPath = resource.substring(8);
            console.log('imgPath=' + imgPath);

            // 서비스하려는 파일의 mime 타입
            var imgMime = mime.getType(imgPath);
            console.log('mime=' + imgMime);

            // 해당 파일을 읽어오는데 두 번째 인자인 인코딩(utf-8) 값 없음
            fs.readFile(imgPath, function(error, data) {
                if (error) {
                    response.writeHead(500, {'Content-Type': 'text.html'});
                    response.end('500 Internal Server ' + error);
                // content-type에 추출한 mime 타입 입력
                } else {
                    response.writeHead(200, {'Content-Type': imgMime});
                    response.end(data);
                }
            });
        } else {
            response.writeHead(404, {'Content-Type':'text/html'});
            response.end('404 Page Not Found');
        }
    });

    server.listen(80, function() {
        console.log('Server is running...');
    });
}

// 서버 시작
startServer();
