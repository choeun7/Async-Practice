var fs = require('fs');

//비동기 방식 파일 읽기 - 파일 읽은 후 마지막 파라미터에 넘긴 callback 함수 호출
fs.readFile('../Module/home.js', 'utf-8', function(error, data) {
    console.log('01 readAsync" %s', data);  
});

//동기 방식 파일 읽기 - 파일 읽은 후 data 변수에 저장
var data = fs.readFileSync('../Module/home.js', 'utf-8');
console.log('02 readSync: %s', data);

/*
소스코드에서 첫번째는 함수는 비동기방식으로 파일을 읽는 함수가 다른 thread 에 의해서 실행되기 때문에 아래와 같이 로그의 순서가 두번째 함수인 '02 readSync: ...' 가 먼저 출력됩니다.
*/