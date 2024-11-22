import { useState, useEffect } from 'react';
import axios from 'axios';

// 공통 검색 훅: 검색 키워드, 상태, 기타 파라미터를 기반으로 데이터 조회
const useSearch = (endpoint, searchKeyword = '', status = '', initialParams = {})=> {

    // 검색 결과 데이터 관리
    const [data, setData] = useState([]);

    // 로딩 상태 관리
    const [isLoading, setIsLoading] = useState(false);

    // 데이터를 가져오는 함수
    const fetchData = async () => {

        if (!endpoint) {
            setData([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);

        try {
            const response = await axios.get(endpoint, {
                params: {
                    searchKeyword: searchKeyword || '', // 검색 키워드
                    status: status || '', // 상태 필터
                    ...initialParams, // 추가적으로 포함해야 할 요청 파라미터
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('데이터를 불러오는 중 오류 발생:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // 의존성 배열의 값이 변경될 때 데이터를 다시 가져오는 함수
    useEffect(() => {
        fetchData().catch((error) => {
            console.error('데이터를 다시 불러오는 중 오류 발생:', error);
        })
    }, [endpoint, searchKeyword, status, initialParams.page, initialParams.size]);

    return {
        data,
        isLoading,
    };
};

export default useSearch;
