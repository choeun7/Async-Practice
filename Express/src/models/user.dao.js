import { pool } from "../../config/db.connect.js";
import { BaseError } from "../../config/error.js";
import { status } from "../../config/response.status.js";
import { connectFoodCategory, confirmEmail, getUserId, insertUserSql, getPreferToUserId } from "./user.sql.js";

//사용자 추가하기
export const addUser = async (data) => {
    // try {
        const conn = await pool.getConnection();
        const [confirm] = await pool.query(confirmEmail, data.email);

        if (confirm[0].isExistEmail) {
            conn.release();
            return -1;
        }

        const result = await pool.query(insertUserSql, [data.email, data.name, data.gender, data.birth, data.addr, data.specAddr, data.phone]);

        conn.release();
        return result[0].insertId;
    // } catch (err) {
    //     console.log("1");
    //     throw new BaseError(status.PARAMETER_IS_WRONG);
    // }
}

//사용자 정보 얻기
export const getUser = async (userId) => {
    try {
        const conn = await pool.getConnection();
        const [user] = await pool.query(getUserId, userId);

        console.log(user);

        if (user.length == 0) {
            return -1;
        }

        conn.release();
        return user;
    } catch (err) {
        console.log("2");
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

//음식 선호 카테고리 매핑
export const setPrefer = async (userId, foodCategoryId) => {
    try {
        const conn = await pool.getConnection();
        await pool.query(connectFoodCategory, [foodCategoryId, userId]);

        conn.release();
        return;
    } catch (err) {
        console.log("3");
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}

//사용자 선호 카테고리 반환
export const getUserPreferToUserId = async (userId) => {
    try {
        const conn = await pool.getConnection();
        const prefer = await pool.query(getPreferToUserId, userId);

        conn.release();

        return prefer;
    } catch (err) {
        console.log("4");
        throw new BaseError(status.PARAMETER_IS_WRONG);
    }
}
