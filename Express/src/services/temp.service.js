//result 값 넣어주는 로직
import { BaseError } from "../config/error.js";
import { status } from "../config/response.status.js";
import { tempResponseDTO } from "../dtos/temp.response.dto.js";
import { flagResponseDTO } from "../dtos/temp.response.dto.js";

export const getTempData = () => {
    return tempResponseDTO("This is TEST >.0");
}

export function CheckFlag(flag) {
    if (flag == 1)  
        //에러 발생시키기
        throw new BaseError(status.BAD_REQUEST);
    else 
        return flagResponseDTO(flag);
}