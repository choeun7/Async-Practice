//사용되는 쿼리문
export const insertUserSql = "INSERT INTO user (email, user_name, gender, birth, user_address, user_spec_address, user_phone) VALUES (?, ?, ?, ?, ?, ?, ?);";

export const getUserId = "SELECT * FROM user WHERE user_id = ?";

export const connectFoodCategory = "INSERT INTO user_favor_category (f_category_id, user_id) VALUES (?, ?);";

export const confirmEmail = "SELECT EXISTS (SELECT 1 FROM user WHERE email = ?) as isExistEmail;";

export const confirmFoodCategory = "SELECT EXISTS (SELECT 1 FROM food_category_list WHERE f_category_id = ?) as isExistFoodCategory;";

export const getPreferToUserId = "SELECT ufc.f_category_id, ufc.user_id, fcl.f_category_name " +
    "FROM user_favor_category ufc JOIN food_category_list fcl on ufc.f_category_id = fcl.f_category_id " +
    "WHERE ufc.user_id = ? ORDER BY ufc.f_category_id ASC;";
