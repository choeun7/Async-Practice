//클라이언트가 받아도 괜찮은 데이터로 감싸기
export const tempResponseDTO = (data) => {
    return {"testString" : data};
}

export const flagResponseDTO = (flag) => {
    return {"flag" : flag};
}
