import React, { useState } from 'react';
import relics from '../../data/poe2/relics.json';
import { buildStatQuery, rarityQuery, safelyGenerate } from '../../utils/poe2/search';
import ResultBox from '../MapsController.js/ResultBox';
import StatPicker from './StatPicker';
import { MatchMode, RaritySelect } from './ToolControls';
import './Poe2.css';

export default function AffixTool() {
	const title = '聖物';
	const data = relics;
	const [selection, setSelection] = useState({});
	const [mode, setMode] = useState('any');
	const [rarity, setRarity] = useState('');
	const [resetKey, setResetKey] = useState(0);
	const { result, error } = safelyGenerate(() => [
		buildStatQuery(data.mods, selection, mode),
		rarityQuery(rarity),
	].filter(Boolean).join(' '));

	return (
		<section className="poe2-page">
			<h1>POE 2 {title}詞綴</h1>
			<p className="poe2-description">選擇需要的詞綴，再將結果複製到遊戲搜尋欄。# 代表任意數值，不設定詞綴最小／最大值。</p>
			<ResultBox result={result} error={error} reset={() => {
				setSelection({}); setMode('any'); setRarity(''); setResetKey(value => value + 1);
			}} />
			<div className="poe2-toolbar">
				<RaritySelect value={rarity} onChange={setRarity} />
			</div>
			<MatchMode value={mode} onChange={setMode} both />
			<div className="poe2-modifiers" key={resetKey}>
				<StatPicker title="前綴" mods={data.mods.filter(mod => mod.affix === 'PREFIX')} selection={selection} onChange={setSelection} numeric={false} />
				<StatPicker title="後綴" mods={data.mods.filter(mod => mod.affix === 'SUFFIX')} selection={selection} onChange={setSelection} numeric={false} />
				{data.mods.some(mod => mod.affix === 'BOTH') && <StatPicker title="共用屬性（可能出現在不同詞綴組合）" mods={data.mods.filter(mod => mod.affix === 'BOTH')} selection={selection} onChange={setSelection} numeric={false} />}
			</div>
		</section>
	);
}
