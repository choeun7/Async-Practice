import { readFileSync } from 'fs';
import parse from 'csv-parse/lib/sync.js';
import axios from 'axios';

let csv = readFileSync('./csv/groupware_list.csv', 'utf-8');

// BOM 제거
if (csv.charCodeAt(0) === 0xFEFF) {
    csv = csv.slice(1);
}

// CSV 파싱
const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true
});

// 비동기 함수로 POST 요청 처리
const postUser = async (groupware_info) => {
    if (!groupware_info.email || groupware_info.email.length === 0 || !groupware_info.username || groupware_info.username.length === 0) {
        console.log("missing value");
        return;
    }

    const jsonDataObj = { email: groupware_info.email };
    const usernamePadded = groupware_info.username.padEnd(30);

    try {
        const response = await axios.post('http://localhost:9506/report/admin/users', jsonDataObj, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 3000
        });
        console.error(`${usernamePadded}`);
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error(`${usernamePadded} \t\t\t -> 요청 시간 초과`);
        } else if (error.code === 'ECONNREFUSED') {
            console.error(`${usernamePadded} \t\t\t -> 서버 연결 실패`);
        } else if (error.response) {
            if (error.response.status === 500) {
                console.error(`${usernamePadded} \t\t\t -> 서버 에러`);
            } else if (error.response.status === 409) {
                console.error(`${usernamePadded} \t\t\t -> 이메일 중복`);
            } else {
                console.error(`${usernamePadded} \t\t\t -> ${error.message}`);
            }
        } else {
            console.error(`${usernamePadded} \t\t\t -> 요청 실패 ${error.message}`);
        }
    }
};

// 모든 레코드에 대해 POST 요청 비동기로 처리
const processRecords = async (records) => {
    for (const groupware_info of records) {
        await postUser(groupware_info);
    }
};

processRecords(records);
