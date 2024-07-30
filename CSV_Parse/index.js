import { readFileSync } from 'fs';
import parse from 'csv-parse/lib/sync.js';

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

// 데이터 출력
records.forEach((groupware_info, i) => {
    console.log(groupware_info.email);

});