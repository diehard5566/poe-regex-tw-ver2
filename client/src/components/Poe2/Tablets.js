import React, { useState } from 'react';
import ResultBox from '../MapsController.js/ResultBox';
import { safelyGenerate } from '../../utils/poe2/search';
import { tabletAffixes, tabletTypes, tabletRarities, initialTabletSettings, supportsTabletValue, generateTabletRegex } from '../../utils/poe2/tablet';
import { MatchMode } from './ToolControls';
import './Poe2.css';

export default function Tablets() {
	const [settings, setSettings] = useState(initialTabletSettings);
	const [search, setSearch] = useState('');
	const { result, error } = safelyGenerate(() => generateTabletRegex(settings));
	const update = patch => setSettings(current => ({ ...current, ...patch }));
	const toggle = (key, value) => update({ [key]: settings[key].includes(value) ? settings[key].filter(entry => entry !== value) : [...settings[key], value] });
	const filtered = tabletAffixes.filter(mod => mod.name.includes(search.trim()));
	const select = (id, value) => update({ selection: { ...settings.selection, [id]: value } });

	return (
		<section className="poe2-page">
			<h1>POE 2 碑牌詞綴</h1>
			<p className="poe2-description">選擇需要的碑牌詞綴，再將搜尋字串複製到遊戲。複合詞綴以同一組呈現。</p>
			<ResultBox result={result} error={error} reset={() => { setSettings(initialTabletSettings); setSearch(''); }} />
			{[['rarities', '碑牌稀有度', tabletRarities], ['types', '碑牌類型', tabletTypes]].map(([key, title, options]) => (
				<fieldset className="poe2-type-list" key={key}><legend>{title}（全選或全不選表示不限）</legend>
					{options.map(value => <label key={value}><input type="checkbox" checked={settings[key].includes(value)} onChange={() => toggle(key, value)} />{value}</label>)}
				</fieldset>
			))}
			<div className="poe2-toolbar">
				<label><input type="checkbox" checked={settings.usesRemaining} onChange={event => update({ usesRemaining: event.target.checked })} />限制剩餘次數</label>
				<label>剩餘次數至少 <input type="number" min="1" max="18" value={settings.uses} disabled={!settings.usesRemaining} onChange={event => update({ uses: event.target.value })} /></label>
			</div>
			{tabletAffixes.some(supportsTabletValue) && <label><input type="checkbox" checked={settings.round10} onChange={event => update({ round10: event.target.checked })} />數值向下取整至 10 的倍數（縮短搜尋式）</label>}
			<MatchMode value={settings.mode} onChange={mode => update({ mode })} />
			<section className="poe2-selector">
				<h2>需要的詞綴 · {Object.keys(settings.selection).length}</h2>
				<label className="poe2-search-label">搜尋碑牌詞綴 <input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
				<ul>{filtered.map(mod => {
					const selected = Object.prototype.hasOwnProperty.call(settings.selection, mod.id);

					return <li key={mod.id}>
						<label className={selected ? 'is-selected' : ''}><input type="checkbox" checked={selected} onChange={() => {
							const selection = { ...settings.selection };

							if (selected) delete selection[mod.id];
							else selection[mod.id] = null;
							update({ selection });
						}} />{mod.name.replace(/\|/g, ' • ').replace(/##/g, '#')}</label>
						{supportsTabletValue(mod) && <label>最小值 <input type="number" min="0" step="1" value={settings.selection[mod.id] ?? ''} placeholder={mod.ranges[0].join('～')}
							onChange={event => select(mod.id, event.target.value === '' ? null : Number(event.target.value))} /></label>}
					</li>;
				})}</ul>
				{!filtered.length && <p role="status">沒有符合的詞綴。</p>}
			</section>
		</section>
	);
}
