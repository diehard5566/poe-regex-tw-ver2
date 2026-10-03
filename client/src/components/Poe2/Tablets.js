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
			<p className="poe2-description">沿用 poe.re 碑牌邏輯與繁中詞綴，複合詞綴保留為同一組。</p>
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
			<details className="poe2-data-note">
				<summary>價格與自訂搜尋條件</summary>
				<label><input type="checkbox" checked={settings.priceEnabled} onChange={event => update({ priceEnabled: event.target.checked })} />限制標價</label>
				<div className="poe2-toolbar">
					{[['priceMin', '最低標價'], ['priceMax', '最高標價']].map(([key, label]) => <label key={key}>{label} <input type="number" min="0" max="999" value={settings[key]} disabled={!settings.priceEnabled} onChange={event => update({ [key]: event.target.value })} /></label>)}
					<label>通貨 <select value={settings.currency} onChange={event => update({ currency: event.target.value })}><option value="exalted">崇高石</option><option value="divine">神聖石</option></select></label>
				</div>
				<label>自訂搜尋條件 <input type="text" value={settings.customText} onChange={event => update({ customText: event.target.value })} /></label>
			</details>
			<details className="poe2-data-note">
				<summary>上游來源與比對限制</summary>
				<p>使用 poe.re 5d07d01 的 {tabletAffixes.length} 組繁中碑牌詞綴與原始 regex，未拆分複合詞綴。稀有度、種類與剩餘次數的文字改為繁中。</p>
				<p>目前上游繁中資料未提供詞綴數值範圍，因此不開放詞綴數值門檻。上游有範圍時，以進階文字中括號前的實際數值比對；不另設最大值。</p>
				<p>價格條件沿用上游，僅比對標價文字，不查詢即時行情。繁中遊戲內效果仍需實測。</p>
				<a href="https://github.com/veiset/poe.re/tree/5d07d01eb53f26267f733df404566488e71150f3/poe2/src/pages/tablet" target="_blank" rel="noopener noreferrer">上游碑牌實作</a>
			</details>
		</section>
	);
}
