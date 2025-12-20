import React, { useState, useEffect } from 'react';
import './Item.css';

const Items = () => {
    const [apiResponse, setApiResponse] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const apiUrl = process.env.REACT_APP_API_URL || '';

                console.log('使用的 API URL:', apiUrl);
                
                const response = await fetch(`${apiUrl}/items`);
    
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.text();
                
                setApiResponse(data);
            } catch (error) {
                setError('無法加載數據。');
            }
        };

        fetchData();
    }, []);

    const renderContent = () => {
        if (error) {
            return <p className="items-error-message">錯誤：{error}</p>;
        }

        return apiResponse ? (
            <p className="items-api-response">{apiResponse}</p>
        ) : (
            <p className="items-loading-message">加載中...</p>
        );
    };

    return (
        <div className='items-container'>
            <h2 className="items-title">物品詞綴</h2>
            {renderContent()}
        </div>
    );
};

export default Items;