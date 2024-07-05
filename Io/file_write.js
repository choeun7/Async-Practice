var fs = require('fs');

var data = "My first data...\r\nhello there!";

//비동기 방식으로 파일 생성
//함수 인자: 파일명, 입력데이터, 인코딩, 콜백함수
fs.writeFile('file01_async.txt', data, 'utf-8', function(e) {
    if (e) {
        console.log(e);
    } else {
        console.log('01 WRITE DONE!');
    }
});

//동기 방식으로 파일 생성
//callback 함수를 통한 오류처리 불가 -> 함수 전체를 try 문으로 예외처리
try {
    fs.writeFileSync('file02_sync.txt', data, 'utf-8');
    console.log('02 WRITE DONE!');
} catch(e) {
    console.log(e);
}