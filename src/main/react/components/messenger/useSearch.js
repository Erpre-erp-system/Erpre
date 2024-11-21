import { useState, useEffect } from 'react';
import axios from 'axios';

// 공통 검색 훅: 검색 키워드, 상태, 기타 파라미터를 기반으로 데이터 조회
const useSearch = (endpoint, searchKeyword = '', status = '', initialParams = {})=> {

    const [data, setData] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    const fetchData = async () => {
        if (!endpoint) {
            setData([]);
            setSearchLoading(false);
            return;
        }
        setSearchLoading(true);
        try {
            const response = await axios.get(endpoint, {
                params: {
                    searchKeyword: searchKeyword || '',
                    status: status || '',
                    ...initialParams,
                },
            });
            setData(response.data);
        } catch (error) {
            console.error('데이터를 불러오는 중 오류 발생:', error);
        } finally {
            setSearchLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [endpoint, searchKeyword, status, initialParams.page, initialParams.size]);

    return {
        data,
        searchLoading,
    };
};

export default useSearch;
