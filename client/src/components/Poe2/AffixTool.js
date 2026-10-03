import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import tablets from '../../data/poe2/tablets.json';
import relics from '../../data/poe2/relics.json';
import { buildStatQuery, combinePatterns, escapeRegex, rarityQuery, safelyGenerate, tabletUsesQuery } from '../../utils/poe2/search';
import ResultBox from '../MapsController.js/ResultBox';
import StatPicker from './StatPicker';
import { MatchMode, DataNote, RaritySelect, NumericMode } from './ToolControls';
import './Poe2.css';

export default function AffixTool() {
	const isTablet = /\/tablets\/?$/.test(useLocation().pathname);
	const title = isTablet ? '碑牌' : '聖物';
	const data = isTablet ? tablets : relics;
	const [selection, setSelection] = useState({});
	const [mode, setMode] = useState('any');
	const [types, setTypes] = useState([]);
	const [uses, setUses] = useState('');
	const [rarity, setRarity] = useState('');
	const [resetKey, setResetKey] = useState(0);
	const [advanced, setAdvanced] = useState(false);
	const { result, error } = safelyGenerate(() => [
		buildStatQuery(data.mods, selection, mode, advanced),
		isTablet ? combinePatterns(types.map(escapeRegex)) : '',
		isTablet ? tabletUsesQuery(uses) : '',
		rarityQuery(rarity),
	].filter(Boolean).join(' '));

	return (
		<section className="poe2-page">
			<h1>POE 2 {title}詞綴</h1>
			<p className="poe2-description">選擇詞綴並設定需要的數值，再將結果複製到遊戲搜尋欄。已選詞綴會保持顯示。</p>
			<ResultBox result={result} error={error} reset={() => {
				setAdvanced(false);
				setSelection({}); setMode('any'); setTypes([]); setUses(''); setRarity(''); setResetKey(value => value + 1);
			}} />
			<NumericMode value={advanced} onChange={setAdvanced} />
			<div className="poe2-toolbar">
				<RaritySelect value={rarity} onChange={setRarity} />
				{isTablet && <label>剩餘次數至少 <input type="number" min="1" max="99" value={uses} onChange={event => setUses(event.target.value)} placeholder="不限" /></label>}
			</div>
			{isTablet && <fieldset className="poe2-type-list"><legend>碑牌類型（可複選，不選表示不限）</legend>{data.types.map(type => (
				<label key={type}><input type="checkbox" checked={types.includes(type)} onChange={() => setTypes(current => current.includes(type) ? current.filter(value => value !== type) : [...current, type])} />{type}</label>
			))}</fieldset>}
			<MatchMode value={mode} onChange={setMode} both={!isTablet} />
			<div className="poe2-modifiers" key={resetKey}>
				<StatPicker title="前綴" mods={data.mods.filter(mod => mod.affix === 'PREFIX')} selection={selection} onChange={setSelection} />
				<StatPicker title="後綴" mods={data.mods.filter(mod => mod.affix === 'SUFFIX')} selection={selection} onChange={setSelection} />
				{data.mods.some(mod => mod.affix === 'BOTH') && <StatPicker title="共用屬性（可能出現在不同詞綴組合）" mods={data.mods.filter(mod => mod.affix === 'BOTH')} selection={selection} onChange={setSelection} />}
			</div>
			<DataNote><p>目前提供 {data.mods.length} 個獨立屬性；來源不一致但已由官方實際物品確認的詞綴已收錄；未確認者不會自動轉換正負號。</p></DataNote>
		</section>
	);
}
