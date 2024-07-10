import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import SwaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { status } from './config/response.status.js';
import { tempRouter } from './src/routes/temp.route.js';
import { userRouter } from './src/routes/user.route.js';
import { specs } from './config/swagger.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });            //.env 파일 사용
const app = express();

//서버 세팅
app.set('port', process.env.PORT || 3000);          //서버 포트 지정
app.use(cors());                                    //cors 방식 허용
app.use(express.static('public'));                  //정적 파일 접근
app.use(express.json());                            //request 본문을 json으로 해석 허용 (JSON 형태 요청 body 파싱 목적)
app.use(express.urlencoded({extended: false}));     //단순 객체 문자열 형태로 본문 데이터 해석

//스웨거
app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(specs));

//라우터 세팅
app.use('/temp', tempRouter);
app.use('/user', userRouter);

//에러 핸들링
app.use((err, req, res, next) => {
    //템플릿 엔진 변수 설정
    res.locals.message = err.message;
    //개발환경이면 에러를 출력하고 아니면 출력하지 않기
    res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; 
    console.log("error", err);
    res.status(err.data.status || status.INTERNAL_SERVER_ERROR).send(response(err.data));

});

app.listen(app.get('port'), () => {
    console.log(`Example app listening on port ${app.get('port')}`);
});