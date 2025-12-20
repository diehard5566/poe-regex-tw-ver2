/* eslint-disable react/button-has-type */
import React, { useState, useEffect, useCallback } from 'react';
import ResultBox from '../MapsController.js/ResultBox';
import './Scarabs.css';

const Scarabs = () => {
	const [scarabs, setScarabs] = useState([]);
	const [selectedNames, setSelectedNames] = useState([]);
	const [regex, setRegex] = useState('');
	const [error, setError] = useState('');
	const [searchTerm, setSearchTerm] = useState('');
	const [priceRange, setPriceRange] = useState({ min: '', max: '' });
	const [loading, setLoading] = useState(true);

	const getApiUrl = useCallback((endpoint) => {
		const baseUrl = process.env.REACT_APP_API_URL || '';

		// 如果 baseUrl 為空，使用相對路徑（適用於 Vercel 生產環境）
		if (!baseUrl) {
			return `/api/v1/${endpoint}`;
		}

		// 檢查 baseUrl 是否已經包含 /api/v1
		if (baseUrl.includes('/api/v1')) {
			return `${baseUrl}/${endpoint}`;
		}

		return `${baseUrl}/api/v1/${endpoint}`;
	}, []);

	const fetchScarabs = useCallback(async () => {
		try {
			setLoading(true);

			const apiUrl = getApiUrl('scarabs');
			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			setScarabs(data);
			setError('');
		} catch (err) {
			console.error('取得聖甲蟲列表時出錯：', err);
			setError('無法載入聖甲蟲列表');
		} finally {
			setLoading(false);
		}
	}, [getApiUrl]);

	const generateRegex = useCallback(async (names) => {
		try {
			const apiUrl = getApiUrl('scarabs/generateRegex');
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ selectedNames: names }),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			setRegex(data.regex || '');
			setError('');
		} catch (err) {
			console.error('產生 regex 時出錯：', err);
			setError('產生 regex 時發生錯誤');
		}
	}, [getApiUrl]);

	useEffect(() => {
		fetchScarabs();
	}, [fetchScarabs]);

	useEffect(() => {
		if (selectedNames.length > 0) {
			generateRegex(selectedNames);
		} else {
			setRegex('');
		}
	}, [selectedNames, generateRegex]);

	const handleScarabClick = (name) => {
		if (selectedNames.includes(name)) {
			setSelectedNames(selectedNames.filter((n) => n !== name));
		} else {
			setSelectedNames([...selectedNames, name]);
		}
	};

	const handleAutoSelect = () => {
		const min = priceRange.min ? Number(priceRange.min) : 0;
		const max = priceRange.max ? Number(priceRange.max) : Infinity;

		const filtered = scarabs.filter((scarab) => {
			const price = scarab.price?.chaosPer1 || 0;

			return price >= min && price <= max;
		});

		setSelectedNames(filtered.map((scarab) => scarab.name));
	};

	const handleResetPriceRange = () => {
		setPriceRange({ min: '', max: '' });
	};

	const handleReset = () => {
		setSelectedNames([]);
		setRegex('');
		setError('');
		setSearchTerm('');
		setPriceRange({ min: '', max: '' });
	};

	const filteredScarabs = scarabs
		.filter((scarab) => {
			if (!searchTerm) {
				return true;
			}

			return scarab.name.toLowerCase().includes(searchTerm.toLowerCase());
		})
		.sort((a, b) => {
			const priceA = a.price?.chaosPer1 || 0;
			const priceB = b.price?.chaosPer1 || 0;

			return priceB - priceA;
		});

	return (
		<div className="scarabs-container">
			<h2 className="scarabs-title">聖甲蟲 Regex</h2>

			<ResultBox
				result={regex}
				error={error}
				reset={handleReset}
				maxLength={250}
			/>

			<div className="scarabs-controls">
				<div className="auto-select-section">
					<button
						className="auto-select-button"
						onClick={handleAutoSelect}
					>
						自動選擇便宜的聖甲蟲，價格範圍：
					</button>
					<input
						type="number"
						className="price-input"
						value={priceRange.min}
						min="0"
						placeholder="最低價格"
						onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
					/>
					<span className="price-separator">-</span>
					<input
						type="number"
						className="price-input"
						value={priceRange.max}
						min="0"
						placeholder="最高價格"
						onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
					/>
					<button
						className="reset-price-button"
						onClick={handleResetPriceRange}
					>
						重置
					</button>
				</div>

				<div className="search-section">
					<input
						type="text"
						className="search-input"
						placeholder="搜尋聖甲蟲..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>
			</div>

			{loading ? (
				<div className="loading">載入中...</div>
			) : (
				<div className="scarabs-list">
					{filteredScarabs.map((scarab) => {
						const isSelected = selectedNames.includes(scarab.name);
						const price = scarab.price?.chaosPer1 || 0;

						return (
							<div
								key={scarab.code}
								className={`scarab-item ${isSelected ? 'selected' : ''}`}
								onClick={() => handleScarabClick(scarab.name)}
							>
								{scarab.image && (
									<img
										src={scarab.image}
										alt={scarab.name}
										className="scarab-image"
									/>
								)}
								<div className="scarab-info">
									<div className="scarab-name">{scarab.name}</div>
									<div className="scarab-price">{price.toFixed(2)} chaos</div>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default Scarabs;

