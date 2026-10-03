import React, { useState } from 'react';
import ResultBox from '../MapsController.js/ResultBox';
import { generateWaystoneRegex, toggleWaystoneMod, waystoneMods } from '../../utils/poe2/regex';
import './Poe2.css';
import { safelyGenerate, waystoneFields } from '../../utils/poe2/search';

const initialSettings = { wanted: [], unwanted: [], matchAll: false, tierMin: '1', tierMax: '16', reviveMin: '0', reviveMax: '6', corrupted: '', rarities: [], summary: {}, delirious: false, round10: false };

export default function Waystones() {
	const [settings, setSettings] = useState(initialSettings);
	const [search, setSearch] = useState({ wanted: '', unwanted: '' });
	const { result, error } = safelyGenerate(() => generateWaystoneRegex(settings));

	return (
		<section className="poe2-page" aria-labelledby="waystone-title">
			<h1 id="waystone-title">POE 2 換界石詞綴</h1>
			<p className="poe2-description">繁體中文搜尋 · 選擇需要或不要的詞綴，再複製到遊戲搜尋欄。</p>
			<ResultBox result={result} error={error} maxLength={250} reset={() => {
				setSettings(initialSettings);
				setSearch({ wanted: '', unwanted: '' });
			}} />
			<div className="poe2-toolbar">
				<fieldset className="poe2-type-list"><legend>稀有度（全選或全不選表示不限）</legend>
					{['普通', '魔法', '稀有'].map(rarity => <label key={rarity}><input type="checkbox" checked={settings.rarities.includes(rarity)}
						onChange={() => setSettings({ ...settings, rarities: settings.rarities.includes(rarity) ? settings.rarities.filter(value => value !== rarity) : [...settings.rarities, rarity] })} />{rarity}</label>)}
				</fieldset>
				<label>汙染 <select value={settings.corrupted} onChange={event => setSettings({ ...settings, corrupted: event.target.value })}>
					<option value="">不限</option><option value="yes">已汙染</option><option value="no">未汙染</option>
				</select></label>
				{[['tierMin', '最低階級', 1, 16], ['tierMax', '最高階級', 1, 16], ['reviveMin', '最少復活次數', 0, 6], ['reviveMax', '最多復活次數', 0, 6]].map(([key, label, min, max]) => <label key={key}>{label}
					<input type="number" min={min} max={max} value={settings[key]} placeholder="不限" onChange={event => setSettings({ ...settings, [key]: event.target.value })} />
				</label>)}
			</div>
			<details className="poe2-data-note" open>
				<summary>地圖收益最低值</summary>
				<p>收益只設定最低值；留空或 0 表示不限。階級及復活次數才有上下限。</p>
				<div className="poe2-summary-fields">{waystoneFields.map(field => <label className="poe2-selector" key={field.key}>
					{field.label}至少（%）
					<input type="number" min="0" max={field.limit} placeholder="不限" aria-label={`${field.label}至少`}
						value={settings.summary[field.key] ?? ''} onChange={event => setSettings({ ...settings, summary: { ...settings.summary, [field.key]: event.target.value } })} />
				</label>)}</div>
				<label><input type="checkbox" checked={settings.round10} onChange={event => setSettings({ ...settings, round10: event.target.checked })} />收益最低值向下取整至 10 的倍數（例如 29 → 20）</label>
				<label><input type="checkbox" checked={settings.delirious} onChange={event => setSettings({ ...settings, delirious: event.target.checked })} />含有玩家譫妄詞綴</label>
			</details>
			<div className="poe2-mode" role="group" aria-label="需要的詞綴匹配方式">
				<span>需要的詞綴：</span>
				<button type="button" aria-pressed={!settings.matchAll} onClick={() => setSettings({ ...settings, matchAll: false })}>任一詞即可</button>
				<button type="button" aria-pressed={settings.matchAll} onClick={() => setSettings({ ...settings, matchAll: true })}>詞全對才亮</button>
			</div>
			<p className="poe2-description">同一詞綴改選另一側時，會自動移除原選擇。# 代表詞綴中的任意數值，不設定逐詞綴區間。不要的詞以 | 合併排除；需要的詞可選任一或全部符合。</p>
			<div className="poe2-modifiers">
				{['unwanted', 'wanted'].map(side => {
					const title = side === 'unwanted' ? '不要的詞（不會高亮）' : '需要的詞';
					const mods = waystoneMods.filter(mod => settings[side].includes(mod.id) || mod.text.includes(search[side].trim()))
						.sort((a, b) => Number(settings[side].includes(b.id)) - Number(settings[side].includes(a.id)));

					return (
						<section className="poe2-selector" key={side} aria-labelledby={`${side}-title`}>
							<h2 id={`${side}-title`}>{title} · {settings[side].length}</h2>
							<label className="poe2-search-label" htmlFor={`${side}-search`}>搜尋{side === 'unwanted' ? '不要的' : '需要的'}詞綴</label>
							<input id={`${side}-search`} type="search" placeholder="搜尋詞綴…" value={search[side]} onChange={event => setSearch({ ...search, [side]: event.target.value })} />
							<ul>{mods.map(mod => (
								<li key={mod.id}>
									<label className={settings[side].includes(mod.id) ? 'is-selected' : ''}>
										<input type="checkbox" checked={settings[side].includes(mod.id)} onChange={() => setSettings(current => toggleWaystoneMod(current, side, mod.id))} />
										<span>{mod.text}</span>
									</label>
								</li>
							))}</ul>
							{mods.length === 0 && <p role="status">沒有符合的詞綴。</p>}
						</section>
					);
				})}
			</div>
		</section>
	);
}
