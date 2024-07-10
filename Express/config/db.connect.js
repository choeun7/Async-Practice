import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('DB_DATABASE:', process.env.DB_TABLE);

export const pool = mysql.createPool({
    host: process.env.DB_HOST,                      //mysql의 hostname
    user: process.env.DB_USER,                      //user 이름
    port: process.env.DB_PORT,                      //포트 번호
    database: process.env.DB_TABLE,                 //데이터베이스 이름
    password: process.env.DB_PASSWORD,              //비밀번호
    waitForConnections: true,                       //Pool에 획득할 수 있는 connection이 없을 때 > 
                                                    // * true면 요청 queue에 넣어두고 connection 사용할 수 있게되면 요청 실행
                                                    // * false면 즉시 error 내보내고 다시 요청
    connectionLimit: 10,                            //몇 개의 connection 가지게끔 할 것인지
    queueLimit: 0,                                  //getConnection에서 오류가 발생하기 전 Pool에 대기할 요청 개수 한도
});