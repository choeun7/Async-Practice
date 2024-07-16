import { getPreviewReview } from "../models/store.dao.js";
import { previewReviewResponseDTO } from "../dtos/store.response.dto.js";

//단순히 Read 기능을 실행하기에 Service 대신 Provider
export const getReview = async (storeId, query) => {
    const {reviewId, size = 3} = query;
    return previewReviewResponseDTO(await getPreviewReview(reviewId, size, storeId));
}
