import React, { useMemo, useState } from 'react';
import data from '../../data/poe2/items.json';
import { buildStatQuery, escapeRegex, propertiesQuery, emptyProperties, safelyGenerate } from '../../utils/poe2/search';
import ResultBox from '../MapsController.js/ResultBox';
import StatPicker from './StatPicker';
import { DataNote, MatchMode, NumericMode } from './ToolControls';
import './Poe2.css';
import Properties from './Properties';

export default function Items() {
	const [category, setCategory] = useState('');
	const [base, setBase] = useState('');
	const [baseSearch, setBaseSearch] = useState('');
	const [properties, setProperties] = useState(emptyProperties);
	const [selection, setSelection] = useState({});
	const [mode, setMode] = useState('any');
	const [resetKey, setResetKey] = useState(0);
	const [advanced, setAdvanced] = useState(false);
	const group = useMemo(() => data.classes.find(entry => entry.name === category), [category]);
	const { result, error } = safelyGenerate(() => [
		group ? buildStatQuery(group.mods, selection, mode, advanced) : '',
		base ? `"${escapeRegex(base)}"` : '',
		propertiesQuery(properties),
	].filter(Boolean).join(' '));

	return (
		<section className="poe2-page">
			<h1>POE 2 物品詞綴</h1>
			<p className="poe2-description">魔法與稀有物品都以屬性文字搜尋，不使用英文詞序推測空前綴／空後綴。不同詞綴上的數值不會加總。</p>
			<ResultBox result={result} error={error} reset={() => {
				setAdvanced(false);
				setCategory(''); setBase(''); setBaseSearch(''); setProperties(emptyProperties); setSelection({}); setMode('any'); setResetKey(value => value + 1);
			}} />
			<NumericMode value={advanced} onChange={setAdvanced} />
			<div className="poe2-toolbar">
				<label>物品分類 <select value={category} onChange={event => {
					setCategory(event.target.value); setBase(''); setBaseSearch(''); setSelection({}); setResetKey(value => value + 1);
				}}><option value="">請選擇分類</option>{data.classes.map(entry => <option key={entry.name}>{entry.name}</option>)}</select></label>

			</div>
			<Properties value={properties} onChange={setProperties} />
			{group ? <>
				<div className="poe2-toolbar">
					<label>搜尋基底 <input type="search" value={baseSearch} onChange={event => setBaseSearch(event.target.value)} /></label>
					<label>指定基底 <select value={base} onChange={event => setBase(event.target.value)}>
						<option value="">不限基底（只比對詞綴）</option>
						{group.bases.filter(name => name === base || name.includes(baseSearch.trim())).map(name => <option key={name}>{name}</option>)}
					</select></label>
				</div>
				<p className="poe2-description">分類僅用於篩選候選詞綴；需要限定物品種類時，請選擇具體基底。切換分類會清空已選詞綴。</p>
				<MatchMode value={mode} onChange={setMode} both />
				<div className="poe2-modifiers" key={`${category}-${resetKey}`}>
					{[['PREFIX', '前綴'], ['SUFFIX', '後綴'], ['BOTH', '共用屬性']].map(([affix, title]) => group.mods.some(mod => mod.affix === affix) && (
						<StatPicker key={affix} title={title} mods={group.mods.filter(mod => mod.affix === affix)} selection={selection} onChange={setSelection} />
					))}
				</div>
			</> : <p>先選物品分類，再選基底與需要的詞綴。</p>}
			<DataNote><p>基底名稱另與官方物品 API 核對。分類是候選清單，不保證每個基底都可生成分類下所有詞綴；未移植英文名稱式空詞綴偵測。</p></DataNote>
		</section>
	);
}
