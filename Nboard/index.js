'use strict';

const express = require('express');
const restApi = require('dawin-restapi');
const app = express();
const zoo = require('dawin-zoo');
const iconv = require('iconv-lite');
const csv = require('fast-csv');
const Redis = require('ioredis');
const formidable = require('formidable');
const fs = require('fs');
const jschardet = require('jschardet');
const async = require('async');
const mime = require('mime');
const gearmanode = require('gearmanode');
const got = require('got');
const ExcelJS = require('exceljs');
const path = require('path');
const XLSX = require('xlsx');

let redis = null;

zoo.enter('zookeeper1:2181,zookeeper2:2181,zookeeper3:2181', function(err) {
    if (err) {
        console.error('zoo enter error : %s', err);
        process.exit(-1);
    } else {
        zoo.getConfig((err, data) => {
            const config = data;

            if (err) {
                console.error('zoo config error : %s', err);
                process.exit(-1);
            } else {
                const dataApi = new restApi(config.dataApi);

                const dawinSession = require('dawin-session');
                if (Array.isArray(config.sso.redis)) {
                    redis = new Redis.Cluster(config.sso.redis);
                } else {
                    redis = new Redis(config.sso.redis);
                }

                app.use(express.json({ limit : "50mb" }));
                app.use(dawinSession(app, config.dawinSession));
                app.use(function (req, res, next) {
                    if(req.body.authorizationCode) {
                        next();
                    } else {
                        let accessToken = req.headers['accesstoken'] || null;
                        if (accessToken) {
                            redis.get(`session:${accessToken}`, (err, data) => {
                                if (err) {
                                    console.log(`session redis error, ${JSON.stringify(err)}`);
                                    return res.json({error: {code: 500, message: 'internal server error'}});
                                }
                                if (data) {
                                    req.session.data = JSON.parse(data);
                                    next();
                                } else {
                                    return res.json({error: {code: 201, message: 'accessToken expired'}});
                                }
                            });
                        } else {
                            next();
                        }
                    }
                });
                app.use(dataApi.router());
                app.use(express.json({ limit : '400mb'} ));
                app.listen(config.listenPort);

                app.post(config.reportInsert.uri, (req, res) => {
                    console.log(req.session);

                    console.time("calculatingTime")
                    let obj = {};
                    let fileData = {};
                    var time;
                    async.waterfall([
//* getFormData
                        function getFormData(callback) {
                            let loginId = '';
                            if (req.hasOwnProperty('session') && req.session.hasOwnProperty('data') && req.session.data.hasOwnProperty('userKey')) {
                                loginId = req.session.data.userKey;
                            }
                            // TEST
                            loginId = '17412944189413778922';

                            let form = new formidable({
                                multiples: true,
                                maxFieldsSize: 400 * 1024 * 1024
                            });

                            form.parse(req, async (err, fields, files) => {
                                if (err) {
                                    console.log("-- formFile Error : ", err);
                                    return callback({"code" : 242, "message" : '파일 형식을 확인해주세요'});
                                }

                                obj.data = {};
                                obj.data.createId = loginId;
                                obj.data.uri = config.reportInsert.uri;
                                obj.data.method = req.method;
                                obj.data.queryType = fields["queryType"];
                                //
                                // if (obj.data.queryType == 'UA-Campaign') {
                                //     const filePath = files['file'].path;
                                //     const fileExtension = path.extname(files['file'].name);
                                //
                                //     let workbook;
                                //     let worksheet = null;
                                //
                                //     // 날짜 변환 함수 (바이너리 파일 업로드시 사용)
                                //     const convertDate = (excelDate) => {
                                //         const date = new Date(Math.round((excelDate - 25569) * 86400 * 1000));
                                //         return date.toISOString().split('T')[0];
                                //     };
                                //
                                //     // 파일 확장자에 따라 처리
                                //     if (fileExtension === ".xlsb") {
                                //         const xlsbWorkbook = XLSX.readFile(filePath, { type: 'binary', bookVBA: true});
                                //         const sheetName = xlsbWorkbook.SheetNames.find(name => name.toLowerCase() == 'raw');
                                //
                                //         if (!sheetName) {
                                //             return callback({"code" : 242, "message" : 'raw 시트가 존재하는지 확인해주세요'});
                                //         }
                                //         const worksheetData = xlsbWorkbook.Sheets[sheetName];
                                //         const data = XLSX.utils.sheet_to_json(worksheetData, { header: 1, raw: true });
                                //
                                //         workbook = new ExcelJS.Workbook();
                                //         worksheet = workbook.addWorksheet('raw');
                                //
                                //         data.forEach((row, rowIndex) => {
                                //             const newRow = worksheet.getRow(rowIndex + 1);
                                //             row.forEach((cell, cellIndex) => {
                                //                 newRow.getCell(cellIndex + 1).value = cell;
                                //             });
                                //             newRow.commit();
                                //         });
                                //     } else {
                                //         workbook = new ExcelJS.Workbook();
                                //         await workbook.xlsx.readFile(filePath);
                                //         workbook.eachSheet((_worksheet, sheetId) => {
                                //             console.log(`_worksheet._name: ${_worksheet._name}`);
                                //             if (typeof _worksheet._name == 'string' && _worksheet._name.toLowerCase() == 'raw') {
                                //                 worksheet = _worksheet;
                                //             }
                                //         });
                                //         if (!worksheet) {
                                //             return callback({"code" : 242, "message" : 'raw 시트가 존재하는지 확인해주세요'});
                                //         }
                                //     }
                                //
                                //     let result = [];
                                //     let columns = [];
                                //     let rowHavingColumnName = 1;
                                //     const startIndex = 1;
                                //     let endIndex = 33;
                                //     const totalRows = worksheet.rowCount;
                                //     console.log("excel file total row number: " + totalRows);
                                //
                                //     for (let rowNumber = 1; rowNumber <= totalRows; rowNumber++) {
                                //         console.log(`=== ${rowNumber} === `);
                                //         const row = worksheet.getRow(rowNumber);
                                //         const rowData = row.values.splice(startIndex, endIndex);
                                //
                                //         if (rowNumber == rowHavingColumnName) {
                                //             columns = [];
                                //             for (let i = 0; i < rowData.length; i++) {
                                //                 const cell = rowData[i];
                                //                 if (typeof cell == 'string' && i <= endIndex) {
                                //                     columns.push(cell.toLowerCase());
                                //                 }
                                //             }
                                //             endIndex = columns.length;
                                //             console.log(columns);
                                //         } else {
                                //             let obj = {};
                                //             let isStopLoop = true;
                                //             rowData.forEach((cell, i) => {
                                //                 let currentColumn = columns[i];
                                //                 if (fileExtension === ".xlsb" && cell != null) {
                                //                     obj[currentColumn] = (currentColumn === 'work_ymd' || currentColumn === 'strt_ymd' || currentColumn === 'end_ymd') ? convertDate(cell) : cell;
                                //                 } else {
                                //                     obj[currentColumn] = cell;
                                //                 }
                                //                 if (cell !== undefined) {
                                //                     isStopLoop = false;
                                //                 }
                                //             });
                                //             if (isStopLoop) {
                                //                 break;
                                //             }
                                //             result.push(obj);
                                //         }
                                //     }
                                //
                                //     result = result.map((elem => {
                                //         return {
                                //             work_ymd: elem['work_ymd'],
                                //             //strt_ymd: elem['strt_ymd'],
                                //             //end_ymd: elem['end_ymd'],
                                //             app_id: elem['app_id'],
                                //             //camp_group: elem['camp_group'],
                                //             os: elem['os'],
                                //             nat_cd: elem['nat_cd'],
                                //             camp_cat: elem['camp_cat'],
                                //             media_nm: elem['media_nm'],
                                //             camp_nm: elem['camp_nm'],
                                //             impressions: elem['impressions'],
                                //             clicks: elem['clicks'],
                                //             conversions: elem['conversions'],
                                //             gross_cost: elem['gross_cost'],
                                //             net_price: elem['net 금액'],
                                //             quantity: elem['물량기준'],
                                //             total_revenue: elem['total revenue'],
                                //             camp_grp_cd: elem['camp_grp_cd'],
                                //             adgoods: elem['adgoods'],
                                //             media_ori: elem['media_ori'],
                                //         }
                                //     }));
                                //     console.log('extracted data from excel');
                                //
                                //     function isInteger(value) {
                                //         // 소수점으로 들어오는 경우 있음
                                //         const intValue = parseInt(value, 10);
                                //         return Number.isInteger(intValue);
                                //     }
                                //     const requiredColumn = [
                                //         'work_ymd', 'app_id',
                                //         'os', 'nat_cd', 'camp_cat', 'media_nm', 'camp_nm',
                                //         'impressions', 'clicks', 'conversions', 'gross_cost',
                                //         'camp_grp_cd',
                                //     ];
                                //     const requiredValue = [
                                //         'work_ymd', 'app_id', 'camp_grp_cd',
                                //         'os', 'nat_cd', 'camp_cat', 'media_nm', 'camp_nm',
                                //     ];
                                //     const requiredIntegerValue = [
                                //         'impressions', 'clicks', 'conversions', 'gross_cost',
                                //         'net_price', 'quantity', 'total_revenue',
                                //     ]
                                //
                                //     function areAllElementsIncluded(arr1, arr2) {
                                //         for (let i = 0; i < arr1.length; i++) {
                                //             if (!arr2.includes(arr1[i])) {
                                //                 return i;
                                //             }
                                //         }
                                //         return -1;
                                //     }
                                //
                                //     let idx = areAllElementsIncluded(requiredColumn, columns);
                                //     if(idx > -1) {
                                //         let errorMessage = `필수 칼럼이 존재하지 않습니다. [${requiredColumn[idx]}]`
                                //         return callback({"code" : 242, "message" : errorMessage});
                                //     }
                                //
                                //     for (let i = 0 ; i < result.length ; i++) {
                                //         let item = result[i];
                                //
                                //         for (let j=0 ; j<requiredValue.length ; j++) {
                                //             let column = requiredValue[j];
                                //             if(item[column] == '' || item[column] == null) {
                                //                 let errorMessage = `[${rowHavingColumnName + i + 1}]줄: 필수입력값을 확인해주세요(${requiredValue[j]})`
                                //                 console.log(`error message = ${errorMessage}`);
                                //                 return callback({"code" : 242, "message" : errorMessage});
                                //             }
                                //         }
                                //
                                //         for (let j=0 ; j<requiredIntegerValue.length ; j++) {
                                //             let column = requiredIntegerValue[j];
                                //             if(item[column] != null && item[column] != '' && !isInteger(item[column])) {
                                //                 let errorMessage = `[${rowHavingColumnName + i + 1}]줄: 정수 외에 값이 입력되었습니다(${requiredIntegerValue[j]})`
                                //                 console.log(`error message = ${errorMessage}`);
                                //                 return callback({"code" : 242, "message" : errorMessage});
                                //             }
                                //         }
                                //     }
                                //     fileData.fields = result;
                                // } else if (obj.data.queryType == 'daily') {
                                const filePath = files['file'].path;
                                const workbook = new ExcelJS.Workbook();
                                await workbook.xlsx.readFile(filePath);

                                let worksheet = null;

                                workbook.eachSheet((_worksheet, sheetId) => {
                                    console.log(`_worksheet._name: ${_worksheet._name}`);
                                    if (typeof _worksheet._name == 'string' && _worksheet._name.toLowerCase() == 'dailyraw') {
                                        worksheet = _worksheet;
                                    }
                                });
                                if (!worksheet) {
                                    return callback({"code" : 242, "message" : 'raw 시트가 존재하는지 확인해주세요'});
                                }

                                let result = [];
                                let columns = [];
                                let rowHavingColumnName = 1;

                                worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                                    console.log(`=== ${rowNumber} === `)
                                    // empty rows
                                    if (rowNumber < rowHavingColumnName) {
                                        return;
                                    }
                                    if (rowNumber == rowHavingColumnName) {
                                        columns = [];
                                        row.eachCell({ includeEmpty: true }, (cell) => {
                                            if (typeof cell.value == 'string') {
                                                columns.push(cell.value.toLowerCase());
                                            } else if (typeof cell.value == 'object' && cell.value != null && cell.value.richText && cell.value.richText.length > 0) {
                                                columns.push(cell.value.richText[0].text);
                                            }
                                        });
                                    } else {
                                        let obj = {};
                                        row.eachCell({ includeEmpty: true }, (cell, cellIndex) => {
                                            if(cell.formulaType == 0 || cell.formulaType == 1 || cell.formulaType == 2) {
                                                obj[columns[cellIndex - 1]] = cell.result;
                                            } else {
                                                obj[columns[cellIndex - 1]] = cell.value;
                                            }
                                        })
                                        result.push(obj);
                                    }
                                });
                                /*
                                                  result = result.map((elem => {
                                                      return {
                                                          country: elem['국가'],
                                                          currency: elem['통화'],
                                                          media: elem['매체'],
                                                          adGoods: elem['상품(게재면)'],
                                                          device: elem['Device'],
                                                          videoSeconds: elem['영상 초수'],
                                                          execDate: elem['실행일자'],
                                                          spend: elem['광고비'],
                                                          impression: elem['노출수'],
                                                          clicks: elem['클릭수'],
                                                          views: elem['조회수'],
                                                          note: elem['비고'],
                                                      }
                                                  }));
                                */
                                console.log('extracted data from excel');
                                mediaNameValidation(result)
                                    .then((response) => {
                                        if(response != null){
                                            throw new Error(response);
                                        }
                                        fileData.fields = result;
                                        fileData.obj = obj;
                                        obj.data.fileName = fields["targetFileName"];
                                        console.log("-- file name : ", obj.data.fileName);
                                        if (!obj.data.fileName) {
                                            return callback({"code" : 242, "message" : 'undefined file name'});
                                        }
                                        return callback(null, fileData);
                                    })
                                    .catch((err) => {
                                        callback({"code" : 500, "message" : err.message});
                                    })

                                // } else if (obj.data.queryType == 'campaign' || obj.data.queryType == 'report') {
                                //     fileData.fields = fields["data"];
                                // } else {
                                //     return callback({"code" : 242, "message" : 'undefined query type'});
                                // }
                                //
                                // if (obj.data.queryType != 'daily') {
                                //     fileData.obj = obj;
                                //     obj.data.fileName = fields["targetFileName"];
                                //     console.log("-- file name : ", obj.data.fileName);
                                //     if (!obj.data.fileName) {
                                //         return callback({"code" : 242, "message" : 'undefined file name'});
                                //     }
                                //
                                //     return callback(null, fileData);
                                // }
                            });

//* Request Procedure
                        }, function requestProcedure(fileData, callback) {
                            let host = config.dataApi.api.connection.host;
                            let port = config.dataApi.api.connection.port;
                            let procedure = config.reportInsert.procedure;
                            let url = `http://${host}:${port}/api/v2/${procedure}`;
                            fileData.obj.data.url = url;

                            console.log("-- File Insert params Value : ", fileData.obj);

                            let params = {
                                params: [],
                            };
                            params.params.push({
                                name: 'info',
                                param_type: 'TEXT',
                                value: JSON.stringify(fileData.obj.data),
                                type: 'IN',
                            });

                            got.post(url, {
                                headers: {
                                    'Content-Type': 'application/json; charset=utf-8',
                                    'X-DreamFactory-API-Key': config.dataApi.api.connection.accessToken,
                                },
                                json: params,
                            }).then((response) => {
                                console.log(`upload complete : ${response.body}`);
                                fileData.obj.responseBody = JSON.parse(response.body);
                                return callback(null, fileData);
                            }, (err) => {
                                console.log(`upload error : ${err}`);
                                console.log(err);
                                return callback({"code" : 500, "message" : '파일 등록에 실패했습니다. 다시 시도하세요.'});
                            });
                        }
                    ], function(err, fileData) {
                        if (err) {
                            console.log(err);
                            return res.json({error: err});
                        }
                        //console.log('fileData:', fileData)
                        res.json({"result":"success"});

                        let rows = [];
//                         if(fileData.obj.data.queryType == "campaign") {
//                             let jsonData = JSON.parse(fileData.fields);
//                             jsonData.forEach((item) => {
//                                 let query = `("${fileData.obj.responseBody[0].fileId}","`;
//                                 query += item["대륙"] + '", "' ;
//                                 query += item["법인"] + '", "' ;
//                                 query += item["국가"] + '", "' ;
//                                 query += item["브랜드"] + '", "' ;
//                                 query += item["출처"] + '", "' ;
//                                 query += item["캠페인"] + '", "' ;
//                                 query += item["매체"] + '", "' ;
//                                 query += item["소재URL"] + '", "' ;
//                                 query += item["소재URL"].split('\n')[0] + '", "' ;
//                                 query += item["성별"] + '", "' ;
//                                 query += item["연령"] + '", "' ;
//                                 query += item["관심사"] + '", "' ;
//                                 query += `${fileData.obj.responseBody[0].createId}")`;
//                                 rows.push(query);
//                             })
//                         } else if (fileData.obj.data.queryType == "report") {
//                             let jsonData = JSON.parse(fileData.fields);
//                             jsonData.forEach((item) => {
//                                 if (item["초수"] == "" || item["초수"] == '-') item["초수"] = "";
//
//
//                                 let query = `("${fileData.obj.responseBody[0].fileId}", "report", "`;
//                                 query += item["대륙"] + '", "' ; query += item["법인"] + '", "' ;
//                                 query += item["국가"] + '", "' ; query += item["브랜드"] + '", "' ;
//                                 query += item["출처"] + '", "' ;
//                                 query += item["캠페인"] + '", "' ; query += item["미디어"] + '", "' ;
//                                 query += item["매체"] + '", "' ; query += item["AD_Goal"] + '", "' ;
//                                 query += item["디바이스"] + '", "' ; query += item["상품"] + '", "' ;
//                                 query += item["지면"] + '", "' ; query += item["소재"] + '", ' ;
//
//                                 if (item["초수"] == "" || item["초수"] == '-') query += 'NULL, "';
//                                 else query += '"' + item["초수"] + '", "' ;
//
//                                 query += item["사이즈"] + '", "' ;
//                                 query += item["기준연도"] + '", "' ; query += item["실집행연도"] + '", "' ;
//                                 query += item["집행월"] + '", "' ; query += item["집행일"] + '", ' ;
//
//                                 if (item["집행시간"] == "" ) query += 'NULL, ';
//                                 else query += '"' + item["집행시간"] + '", ';
//
//                                 query += '"' + item["통화"] + '", ' ;
//                                 query += '"' + item["Note"] + '", "' ;
//
//                                 query += item["Spend(Gross)"] + '", "' ;
//
//                                 query += item["Impression"] + '", "' ; query += item["Clicks"] + '", ' ;
//
//                                 if (item["Views"] == "" || item["Views"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["Views"] + '", ' ;
//
//                                 if (item["CTR"] == "#DIV/0!" || item["CTR"] == '-') query += 'NULL, ';
//                                 else query += '"' + item["CTR"] + '", ' ;
//
//
//                                 if (item["VTR"] == "-" ) query += 'NULL, ';
//                                 else query += '"' + item["VTR"] + '", ' ;
//
//
//                                 if (item["CPM"] == "" || item["CPM"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["CPM"] + '", ' ;
//
//                                 if (item["CPC"] == "" || item["CPC"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["CPC"] + '", ' ;
//
//                                 if (item["CPV"] == "" || item["CPV"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["CPV"] + '", ' ;
//
//                                 if (item["CPE"] == "" || item["CPE"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["CPE"] + '", ' ;
//
//                                 if (item["CPF"] == "" || item["CPF"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["CPF"] + '", ' ;
//
//                                 if (item["Engage."] == "" || item["Engage."] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["Engage."] + '", ' ;
//
//                                 if (item["Like"] == "" || item["Like"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["Like"] + '", ' ;
//
//
//                                 if (item["Reply"] == "" || item["Reply"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["Reply"] + '", ' ;
//
//
//                                 if (item["Share"] == "" || item["Share"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["Share"] + '", ' ;
//
//
//                                 if (item["Follow"] == "" || item["Follow"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["Follow"] + '", ' ;
//
//                                 if (item["VR_25%"] == "" || item["VR_25%"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["VR_25%"] + '", ' ;
//
//                                 if (item["VR_50%"] == "" || item["VR_50%"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["VR_50%"] + '", ' ;
//
//                                 if (item["VR_75%"] == "" || item["VR_75%"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["VR_75%"] + '", ' ;
//
//                                 if (item["VR_100%"] == "" || item["VR_100%"] == ' - ') query += 'NULL, ';
//                                 else query += '"' + item["VR_100%"] + '", ' ;
//
//                                 query += `"${fileData.obj.responseBody[0].createId}")`;
//                                 rows.push(query);
//                             })
//                         } else if (fileData.obj.data.queryType == 'UA-Campaign') {
//                             let jsonData = fileData.fields;
//
//                             function isExistValue(val) {
//                                 return val != null && val != undefined;
//                             }
//
//                             let fileId = `${fileData.obj.responseBody[0].fileId}`;
//                             let createId = `${fileData.obj.responseBody[0].createId}`;
//
//                             jsonData.forEach(item => {
//                                 let work_ymd = isExistValue(item.work_ymd) ? `${item.work_ymd}` : '';
//                                 work_ymd = new Date(work_ymd).toISOString().slice(0, 19).replace('T', ' ');
//
//                                 //let strt_ymd = isExistValue(item.strt_ymd) ? `${item.strt_ymd}` : '';
//                                 //strt_ymd = new Date(strt_ymd).toISOString().slice(0, 19).replace('T', ' ');
//                                 //let end_ymd = isExistValue(item.end_ymd) ? `${item.end_ymd}` : '';
//                                 //end_ymd = new Date(end_ymd).toISOString().slice(0, 19).replace('T', ' ');
//                                 let app_id = isExistValue(item.app_id) ? `${item.app_id}` : '';
//                                 //let camp_group = isExistValue(item.camp_group) ? `${item.camp_group}` : '';
//
//                                 let camp_grp_cd = isExistValue(item.camp_grp_cd) ? `${item.camp_grp_cd}` : '';
//                                 let os = isExistValue(item.os) ? `${item.os}` : '';
//                                 let nat_cd = isExistValue(item.nat_cd) ? `${item.nat_cd}` : '';
//                                 let camp_cat = isExistValue(item.camp_cat) ? `${item.camp_cat}` : '';
//                                 let media_nm = isExistValue(item.media_nm) ? `${item.media_nm}` : '';
//                                 let camp_nm = isExistValue(item.camp_nm) ? `${item.camp_nm}` : '';
//                                 let impressions = isExistValue(item.impressions) ? `${item.impressions}` : 0;
//                                 let clicks = isExistValue(item.clicks) ? `${item.clicks}` : 0;
//                                 let conversions = isExistValue(item.conversions) ? `${item.conversions}` : null;
//                                 let gross_cost = isExistValue(item.gross_cost) ? `${item.gross_cost}` : 0;
//
//                                 let net_price = isExistValue(item.net_price) ? `${item.net_price}` : 0;
//                                 let quantity = isExistValue(item.quantity) ? `${item.quantity}` : 0;
//                                 let total_revenue = isExistValue(item.total_revenue) ? `${item.total_revenue}` : 0;
//
//                                 let adgoods = isExistValue(item.adgoods) ? `${item.adgoods}` : '';
//                                 let media_ori = isExistValue(item.media_ori) ? `${item.media_ori}` : '';
//
//                                 let query = `
//                     ('${fileId}', '${work_ymd}', '${app_id}',
//                     '${camp_grp_cd}', '${os}', '${nat_cd}', '${adgoods}', '${media_ori}',
//                     '${camp_cat}', '${media_nm}', '${camp_nm}', ${impressions}, ${clicks},
//                     ${conversions}, ${gross_cost}, ${net_price}, ${quantity}, ${total_revenue}, '${createId}')`;
//
//                                 rows.push(query);
//                             });
// //* type이 daily일 때 result
//                         } else if (fileData.obj.data.queryType == 'daily') {
                        let jsonData = fileData.fields;

                        function isExistValue(val) {
                            return val != null && val != undefined;
                        }

                        let fileId = `${fileData.obj.responseBody[0].fileId}`;
                        let createId = `${fileData.obj.responseBody[0].createId}`;
                        let type = 'daily';

                        jsonData.forEach(item => {
                            let code = isExistValue(item['코드']) ? `${item['코드']}` : '';
                            let brand = isExistValue(item['타이틀/브랜드']) ? `${item['타이틀/브랜드']}` : '';
                            let campaign = isExistValue(item['캠페인명']) ? `${item['캠페인명']}` : '';
                            let country = isExistValue(item['국가']) ? `${item['국가']}` : '';
                            let currency = isExistValue(item['통화']) ? `${item['통화']}` : '';
                            let execHour = isExistValue(item['시간 (광고노출구좌 시간)']) ? `${item['시간 (광고노출구좌 시간)']}` : '';
                            let media = isExistValue(item['매체']) ? `${item['매체']}` : '';
                            let adGoods = isExistValue(item['상품(게재면)']) ? `${item['상품(게재면)']}` : '';
                            let targeting = isExistValue(item['타겟팅(간단)']) ? `${item['타겟팅(간단)']}` : '';
                            let device = isExistValue(item['Device']) ? `${item['Device']}` : '';
                            let creativeName = isExistValue(item['소재']) ? `${item['소재']}` : '';
                            creativeName = creativeName.replace(/['"\\]/g, '\\$&');

                            let videoSeconds = isExistValue(item['영상 초수']) ? `${item['영상 초수']}` : '';
                            let execDate = isExistValue(item['일자']) ? `${item['일자']}` : '';
                            let spend = isExistValue(item['광고비']) ? `${item['광고비']}` : '';
                            let impression = isExistValue(item['노출수']) ? `${item['노출수']}` : '';
                            let clicks = isExistValue(item['클릭수']) ? `${item['클릭수']}` : '';
                            let views = isExistValue(item['조회수']) ? `${item['조회수']}` : '';
                            let note = isExistValue(item['비고']) ? `${item['비고']}` : '';
                            let team = isExistValue(item['담당팀']) ? `${item['담당팀']}` : '';

                            let execYear, execMonth, execDay;
                            execDate = new Date(execDate);
                            execYear = execDate.getUTCFullYear();
                            execMonth = execDate.getMonth() + 1;
                            execDay = execDate.getDate();

                            let query = `('${fileId}', '${type}', '${code}',
                    '${brand}', '${campaign}', '${country}', '${currency}', '${media}', '${adGoods}', '${targeting}',
                    '${device}', '${creativeName}', '${videoSeconds}', '${execYear}', '${execMonth}', '${execDay}', 
                    '${execHour}', '${spend}', '${impression}', '${clicks}', 
                    '${views}', '${note}', '${team}', 
                    '${createId}')`;

                            rows.push(query);
                        });

                        // }

                        console.log('data length: %d', rows.length);

                        let data = {};
                        data.query = rows.join(',');
                        data.queryType = fileData.obj.data.queryType;
                        data.fileId = fileData.obj.responseBody[0].fileId;
                        let client = gearmanode.client(config.fileUpload.gearman);
                        let payload = {
                            data: data
                        };

                        let job = client.submitJob('ncsoftReport-fileUpload-worker', JSON.stringify(payload), { background: true });
                        job.on('created', () => {
                            if (client) {
                                client.close();
                                client = null;
                            }
                        });
                        job.on('error', (err) => {
                            if (client) {
                                client.close();
                                client = null;
                            }
                        });

                        // const chunkSize = 1000;
                        // const numChunks = Math.ceil(rows.length / chunkSize);

                        // for (let i=0 ; i<numChunks ; i++) {
                        //   const startIndex = i * chunkSize;
                        //   const endIndex = (i + 1) * chunkSize;
                        //   const currentChunk = rows.slice(startIndex, endIndex);

                        //   let data = {};
                        //   data.query = currentChunk.join(',');
                        //   data.queryType = fileData.obj.data.queryType;
                        //   data.fileId = fileData.obj.responseBody[0].fileId;

                        //   let client = gearmanode.client(config.fileUpload.gearman);
                        //   let payload = {
                        //     data: data
                        //   };

                        //   let job = client.submitJob('ncsoftReport-fileUpload-worker', JSON.stringify(payload), { background: true });
                        //   console.log(`numChunks=${i}, startIndex=${startIndex}, endIndex=${endIndex}`);
                        //   job.on('created', () => {
                        //     if (client) {
                        //       client.close();
                        //       client = null;
                        //     }
                        //   });
                        //   job.on('error', (err) => {
                        //     if (client) {
                        //       client.close();
                        //       client = null;
                        //     }
                        //   });
                        // }
                    });
                });
            }
        });
    }
});