/* eslint-disable react/button-has-type */
import React, { useState, useEffect, useCallback } from 'react';
import ResultBox from './ResultBox';
import ModifierSelector from './ModifierSelector';
import './Maps.css';

const Maps = () => {
	const [wantedMods, setWantedMods] = useState([]);
	const [unwantedMods, setUnwantedMods] = useState([]);
	const [allModifiers, setAllModifiers] = useState([]);
	const [isT17Selected, setIsT17Selected] = useState(false);
	const [regex, setRegex] = useState('');
	const [error, setError] = useState('');
	const [warning, setWarning] = useState('');
	const [itemQuantity, setItemQuantity] = useState('');
	const [packSize, setPackSize] = useState('');
	const [itemRarity, setItemRarity] = useState('');
	const [mapDrop, setMapDrop] = useState('');
	const [scarab, setScarab] = useState('');
	const [currency, setCurrency] = useState('');
	const [divination, setDivination] = useState('');
	const [corrupted, setCorrupted] = useState(false); // false: 不篩選, true: 已汙染
	const [rarity, setRarity] = useState([]); // ['normal', 'magic', 'rare']
	const [allGoodMods, setAllGoodMods] = useState(false);

	const getApiUrl = useCallback((endpoint) => {
		let baseUrl = process.env.REACT_APP_API_URL || '';

		console.log('原始 API URL 基礎路徑:', baseUrl);

		// 檢查 baseUrl 是否已經包含 /api/v1
		if (baseUrl.includes('/api/v1')) {
			// 如果已經包含，則直接添加端點
			return `${baseUrl}/${endpoint}`;
		} else {
			// 如果不包含，則添加 /api/v1 和端點
			return `${baseUrl}/api/v1/${endpoint}`;
		}
	}, []);

	const fetchModifiers = useCallback(async () => {
		try {
			const apiUrl = getApiUrl('maps?type=1');

			console.log('獲取地圖詞綴的 API URL:', apiUrl);

			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error(`網絡響應錯誤: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

			return Object.keys(data).map(mod => ({ mod, isT17: false })) || [];
		} catch (error) {
			console.error('無法獲取地圖詞綴:', error);
			setError('無法載入詞綴數據，請檢查網路連接或重新整理頁面');
			return [];
		}
	}, [getApiUrl]);

	const fetchT17Modifiers = useCallback(async () => {
		try {
			const apiUrl = getApiUrl('maps/t17?type=2');

			console.log('獲取 T17 地圖詞綴的 API URL:', apiUrl);

			const response = await fetch(apiUrl);

			if (!response.ok) {
				throw new Error(`網絡響應錯誤: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();

			return Object.keys(data).map(mod => ({ mod, isT17: true })) || [];
		} catch (error) {
			console.error('Failed to fetch T17 modifiers:', error);
			setError('無法載入 T17 詞綴數據，請檢查網路連接或重新整理頁面');
			return [];
		}
	}, [getApiUrl]);

	useEffect(() => {
		const getInitialModifiers = async () => {
			const mods = await fetchModifiers();

			setAllModifiers(mods);
		};

		getInitialModifiers();
	}, [fetchModifiers]);

	const handleT17CheckboxChange = async checked => {
		setIsT17Selected(checked);

		if (checked) {
			const t17Mods = await fetchT17Modifiers();

			setAllModifiers(prevMods => {
				const combinedMods = [...t17Mods, ...prevMods];

				return combinedMods.filter((mod, index, self) =>
					index === self.findIndex(t => t.mod === mod.mod),
				);
			});
		} else {
			const regularMods = await fetchModifiers();

			setAllModifiers(regularMods);
		}
	};

	const handleModsChange = useCallback(async (newWantedMods, newUnwantedMods, newItemQuantity, newPackSize, newItemRarity, newMapDrop, newScarab, newCurrency, newDivination, newCorrupted, newRarity) => {
		try {
			const apiUrl = getApiUrl('maps/generateMapRegex');
			const response = await fetch(apiUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					wantedMods: newWantedMods,
					unwantedMods: newUnwantedMods,
					itemQuantity: newItemQuantity ? parseInt(newItemQuantity, 10) : undefined,
					packSize: newPackSize ? parseInt(newPackSize, 10) : undefined,
					itemRarity: newItemRarity ? parseInt(newItemRarity, 10) : undefined,
					mapDrop: newMapDrop ? parseInt(newMapDrop, 10) : undefined,
					scarab: newScarab ? parseInt(newScarab, 10) : undefined,
					currency: newCurrency ? parseInt(newCurrency, 10) : undefined,
					divination: newDivination ? parseInt(newDivination, 10) : undefined,
					corrupted: newCorrupted,
					rarity: newRarity,
					allGoodMods: allGoodMods,
				}),
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const newRegex = data.regex;

			setRegex(newRegex);
			setError('');
		} catch (error) {
			console.error('生成正則表達式時出錯：', error);
			setError('生成正則表達式時發生錯誤');
		}
	}, [allGoodMods, getApiUrl]);

	const handleReset = () => {
		setWantedMods([]);
		setUnwantedMods([]);
		setRegex('');
		setError('');
		setWarning('');
		setItemQuantity('');
		setPackSize('');
		setItemRarity('');
		setMapDrop('');
		setScarab('');
		setCurrency('');
		setDivination('');
		setCorrupted(false);
		setRarity([]);
		setIsT17Selected(false);
		fetchModifiers().then(mods => setAllModifiers(mods));
	};

	const handleClearItemQuantity = React.useCallback(() => {
		setItemQuantity('');
		handleModsChange(wantedMods, unwantedMods, '', packSize, itemRarity, mapDrop, scarab, currency, divination, corrupted, rarity);
	}, [wantedMods, unwantedMods, packSize, itemRarity, mapDrop, scarab, currency, divination, corrupted, rarity, handleModsChange]);

	const handleClearPackSize = React.useCallback(() => {
		setPackSize('');
		handleModsChange(wantedMods, unwantedMods, itemQuantity, '', itemRarity, mapDrop, scarab, currency, divination, corrupted, rarity);
	}, [wantedMods, unwantedMods, itemQuantity, itemRarity, mapDrop, scarab, currency, divination, corrupted, rarity, handleModsChange]);

	const handleClearItemRarity = React.useCallback(() => {
		setItemRarity('');
		handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, '', mapDrop, scarab, currency, divination, corrupted, rarity);
	}, [wantedMods, unwantedMods, itemQuantity, packSize, mapDrop, scarab, currency, divination, corrupted, rarity, handleModsChange]);

	const handleClearMapDrop = React.useCallback(() => {
		setMapDrop('');
		handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, '', scarab, currency, divination, corrupted, rarity);
	}, [wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, scarab, currency, divination, corrupted, rarity, handleModsChange]);

	const handleClearScarab = React.useCallback(() => {
		setScarab('');
		handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, '', currency, divination, corrupted, rarity);
	}, [wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, currency, divination, corrupted, rarity, handleModsChange]);

	const handleClearCurrency = React.useCallback(() => {
		setCurrency('');
		handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, '', divination, corrupted, rarity);
	}, [wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, divination, corrupted, rarity, handleModsChange]);

	const handleClearDivination = React.useCallback(() => {
		setDivination('');
		handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency, '', corrupted, rarity);
	}, [wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency, corrupted, rarity, handleModsChange]);

	return (
		<div className="maps-container">
			<div>
				<ResultBox
					result={regex}
					warning={warning}
					error={error}
					reset={handleReset}
					maxLength={250}
				/>
				<div className="quantity-inputs">
					<div className="input-row">
					<div className="item-quantity-input">
						<label htmlFor="itemQuantity">物品數量至少為：</label>
						<div className="input-with-clear">
							<input
								type="number"
								id="itemQuantity"
								value={itemQuantity}
								min="0"
								onChange={e => {
									setItemQuantity(e.target.value);
										handleModsChange(wantedMods, unwantedMods, e.target.value, packSize, itemRarity, mapDrop, scarab, currency, divination, corrupted, rarity);
								}}
							/>
							{itemQuantity && (
								<button className="clear-button" onClick={handleClearItemQuantity}>
									x
								</button>
							)}
						</div>
					</div>
					<div className="pack-size-input">
						<label htmlFor="packSize">怪群大小至少為：</label>
						<div className="input-with-clear">
							<input
								type="number"
								id="packSize"
								value={packSize}
								min="0"
								onChange={e => {
									setPackSize(e.target.value);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, e.target.value, itemRarity, mapDrop, scarab, currency, divination, corrupted, rarity);
								}}
							/>
							{packSize && (
								<button className="clear-button" onClick={handleClearPackSize}>
									x
								</button>
							)}
						</div>
					</div>
						<div className="item-rarity-input">
							<label htmlFor="itemRarity">物品稀有度至少為：</label>
							<div className="input-with-clear">
								<input
									type="number"
									id="itemRarity"
									value={itemRarity}
									min="0"
									onChange={e => {
										setItemRarity(e.target.value);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, e.target.value, mapDrop, scarab, currency, divination, corrupted, rarity);
									}}
								/>
								{itemRarity && (
									<button className="clear-button" onClick={handleClearItemRarity}>
										x
									</button>
								)}
							</div>
						</div>
					</div>
					<div className="input-row">
						<div className="map-drop-input">
							<label htmlFor="mapDrop">更多地圖至少為：</label>
							<div className="input-with-clear">
								<input
									type="number"
									id="mapDrop"
									value={mapDrop}
									min="0"
									onChange={e => {
										setMapDrop(e.target.value);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, e.target.value, scarab, currency, divination, corrupted, rarity);
									}}
								/>
								{mapDrop && (
									<button className="clear-button" onClick={handleClearMapDrop}>
										x
									</button>
								)}
							</div>
						</div>
						<div className="scarab-input">
							<label htmlFor="scarab">更多聖甲蟲至少為：</label>
							<div className="input-with-clear">
								<input
									type="number"
									id="scarab"
									value={scarab}
									min="0"
									onChange={e => {
										setScarab(e.target.value);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, e.target.value, currency, divination, corrupted, rarity);
									}}
								/>
								{scarab && (
									<button className="clear-button" onClick={handleClearScarab}>
										x
									</button>
								)}
							</div>
						</div>
						<div className="currency-input">
							<label htmlFor="currency">更多通貨至少為：</label>
							<div className="input-with-clear">
								<input
									type="number"
									id="currency"
									value={currency}
									min="0"
									onChange={e => {
										setCurrency(e.target.value);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, e.target.value, divination, corrupted, rarity);
									}}
								/>
								{currency && (
									<button className="clear-button" onClick={handleClearCurrency}>
										x
									</button>
								)}
							</div>
						</div>
					</div>
					<div className="input-row">
						<div className="divination-input">
							<label htmlFor="divination">更多命運卡至少為：</label>
							<div className="input-with-clear">
						<input
									type="number"
									id="divination"
									value={divination}
									min="0"
									onChange={e => {
										setDivination(e.target.value);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency, e.target.value, corrupted, rarity);
									}}
								/>
								{divination && (
									<button className="clear-button" onClick={handleClearDivination}>
										x
									</button>
								)}
							</div>
						</div>
						<div className="corrupted-input">
							<button
								onClick={() => {
									const newCorrupted = !corrupted;

									setCorrupted(newCorrupted);
									handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency, divination, newCorrupted, rarity);
								}}
								className={corrupted ? 'active' : ''}
							>
								已汙染
							</button>
						</div>
						<div className="rarity-input">
							<div className="rarity-buttons">
								<button
									onClick={() => {
										const newRarity = rarity.includes('normal')
											? rarity.filter(r => r !== 'normal')
											: [...rarity, 'normal'];

										setRarity(newRarity);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency, divination, corrupted, newRarity);
									}}
									className={`rarity-normal ${rarity.includes('normal') ? 'active' : ''}`}
								>
									普通
								</button>
								<button
									onClick={() => {
										const newRarity = rarity.includes('magic')
											? rarity.filter(r => r !== 'magic')
											: [...rarity, 'magic'];

										setRarity(newRarity);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency, divination, corrupted, newRarity);
									}}
									className={`rarity-magic ${rarity.includes('magic') ? 'active' : ''}`}
								>
									魔法
								</button>
								<button
									onClick={() => {
										const newRarity = rarity.includes('rare')
											? rarity.filter(r => r !== 'rare')
											: [...rarity, 'rare'];

										setRarity(newRarity);
										handleModsChange(wantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency, divination, corrupted, newRarity);
									}}
									className={`rarity-rare ${rarity.includes('rare') ? 'active' : ''}`}
								>
									稀有
								</button>
							</div>
						</div>
					</div>
					<div className="options-row">
						<button
							onClick={() => handleT17CheckboxChange(!isT17Selected)}
							className={`t17-button ${isT17Selected ? 'active' : ''}`}
						>
							t17詞綴
						</button>
					<div className="all-good-mods-toggle">
                        <button
                            onClick={() => setAllGoodMods(false)}
                            className={!allGoodMods ? 'active' : ''}
                        >
							任一詞即可
                        </button>
                        <button
                            onClick={() => setAllGoodMods(true)}
                            className={allGoodMods ? 'active' : ''}
                        >
							詞全對才亮
                        </button>
						</div>
                    </div>
				</div>
				<div className="modifiers-container">
					<ModifierSelector
						title="不要的詞...(不會高亮！)"
						modifiers={allModifiers}
						selectedMods={unwantedMods}
						onSelectMod={mod => {
							const newUnwantedMods = [...unwantedMods, mod];

							setUnwantedMods(newUnwantedMods);
							handleModsChange(wantedMods, newUnwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency);
						}}
						onDeselectMod={mod => {
							const newUnwantedMods = unwantedMods.filter(m => m !== mod);

							setUnwantedMods(newUnwantedMods);
							handleModsChange(wantedMods, newUnwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency);
						}}
					/>
					<ModifierSelector
						title="需要的詞"
						modifiers={allModifiers}
						selectedMods={wantedMods}
						onSelectMod={mod => {
							const newWantedMods = [...wantedMods, mod];

							setWantedMods(newWantedMods);
							handleModsChange(newWantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency);
						}}
						onDeselectMod={mod => {
							const newWantedMods = wantedMods.filter(m => m !== mod);

							setWantedMods(newWantedMods);
							handleModsChange(newWantedMods, unwantedMods, itemQuantity, packSize, itemRarity, mapDrop, scarab, currency);
						}}
					/>

				</div>
			</div>
		</div>

	);
};

export default Maps;
