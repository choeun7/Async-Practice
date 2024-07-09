// 에러 응답 통일 형식
export class BaseError extends Error {
    constructor(data) {
        super(data.message);
        this.data = data;
    }
}