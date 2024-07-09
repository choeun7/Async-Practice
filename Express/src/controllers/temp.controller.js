// 응답이 만든 응답 포맷에 넣어져 전송하게 됨 -> temp.route.js
import { status } from '../config/response.status.js';
import { getTempData } from '../services/temp.service.js';
import { response } from '../config/response.js';
import { CheckFlag } from '../services/temp.service.js';

export const tempTest = (req, res, next) => {
    res.send(response(status.SUCCESS, getTempData()));
};

export const tempException = (req, res, next) => {
    console.log("/temp/exception/" + req.params.flag);
    return res.send(response(status.SUCCESS, CheckFlag(req.params.flag)));
}
