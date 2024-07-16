export const getReviewByReviewId =
    "SELECT u.user_name, u.user_id, r.id, r.score, r.body, r.created_at "
    + "FROM review r JOIN user u on r.user_id = u.user_id "
    + "WHERE r.store_id = ? AND r.id < ? "
    + "ORDER BY r.id DESC LIMIT ? ;"

export const getReviewByReviewIdAtFirst =
    "SELECT u.user_name, u.user_id, r.id, r.score, r.body, r.created_at "
    + "FROM review r JOIN user u on r.user_id = u.user_id "
    + "WHERE r.store_id = ? "
    + "ORDER BY r.id DESC LIMIT ? ;"
