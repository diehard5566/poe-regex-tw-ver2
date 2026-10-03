import React, { useState } from 'react';
import ResultBox from '../MapsController.js/ResultBox';
import { generateWaystoneRegex, toggleWaystoneMod, waystoneMods } from '../../utils/poe2/regex';
import './Poe2.css';
import { RaritySelect, NumericMode } from './ToolControls';
import { safelyGenerate, waystoneFields } from '../../utils/poe2/search';

const initialSettings = { wanted: [], unwanted: [], matchAll: false, values: {}, tierMin: '', tierMax: '', corrupted: '', rarity: '', summary: {}, delirious: false, advanced: false };

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
			<NumericMode value={settings.advanced} onChange={advanced => setSettings({ ...settings, advanced })} />
			<div className="poe2-toolbar">
				<RaritySelect value={settings.rarity} onChange={rarity => setSettings({ ...settings, rarity })} />
				<label>汙染 <select value={settings.corrupted} onChange={event => setSettings({ ...settings, corrupted: event.target.value })}>
					<option value="">不限</option><option value="yes">已汙染</option><option value="no">未汙染</option>
				</select></label>
				{[['tierMin', '最低階級'], ['tierMax', '最高階級']].map(([key, label]) => <label key={key}>{label}
					<input type="number" min="1" max="16" value={settings[key]} placeholder="不限" onChange={event => setSettings({ ...settings, [key]: event.target.value })} />
				</label>)}
			</div>
			<details className="poe2-data-note" open>
				<summary>復活次數與地圖收益條件</summary>
				<p>收益只填最小值會產生短版搜尋式；填入最大值時，會保留完整數字邊界以避免誤判。</p>
				<div className="poe2-summary-fields">{waystoneFields.map(field => <div className="poe2-selector" key={field.key}>
					<h2>{field.label}{field.suffix}</h2>
					<div className="poe2-value-row">{['min', 'max'].map(bound => <label key={bound}>{bound === 'min' ? '最小' : '最大'}
						<input type="number" min="0" max={field.limit} placeholder="不限" aria-label={`${field.label}${bound === 'min' ? '最小' : '最大'}`}
							value={settings.summary[field.key]?.[bound] || ''} onChange={event => setSettings({ ...settings, summary: { ...settings.summary, [field.key]: { ...settings.summary[field.key], [bound]: event.target.value } } })} />
					</label>)}</div>
				</div>)}</div>
				<label><input type="checkbox" checked={settings.delirious} onChange={event => setSettings({ ...settings, delirious: event.target.checked })} />含有玩家譫妄詞綴</label>
			</details>
			<div className="poe2-mode" role="group" aria-label="需要的詞綴匹配方式">
				<span>需要的詞綴：</span>
				<button type="button" aria-pressed={!settings.matchAll} onClick={() => setSettings({ ...settings, matchAll: false })}>任一詞即可</button>
				<button type="button" aria-pressed={settings.matchAll} onClick={() => setSettings({ ...settings, matchAll: true })}>詞全對才亮</button>
			</div>
			<p className="poe2-description">同一詞綴改選另一側時，會自動移除原選擇。# 代表數值；留空不限制。門檻支援 -9999～9999 整數，排除側表示排除落在此範圍的詞綴。</p>
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
									{settings[side].includes(mod.id) && mod.text.includes('#') && <div className="poe2-value-fields">
										<span>第一行 # 的範圍</span>
										{['min', 'max'].map(bound => <label key={bound}>{bound === 'min' ? '最小' : '最大'}
											<input type="number" min="-9999" max="9999" placeholder="不限" aria-label={`${mod.text} ${bound === 'min' ? '最小' : '最大'}`}
												value={settings.values[mod.id]?.[0]?.[bound] || ''} onChange={event => setSettings({ ...settings, values: { ...settings.values, [mod.id]: [{ min: '', max: '', ...settings.values[mod.id]?.[0], [bound]: event.target.value }] } })} />
										</label>)}
									</div>}
								</li>
							))}</ul>
							{mods.length === 0 && <p role="status">沒有符合的詞綴。</p>}
						</section>
					);
				})}
			</div>
			<details className="poe2-data-note">
				<summary>資料來源與目前支援範圍</summary>
				<p>32 組詞綴已核對官方繁中交易詞綴文字（2026-10-03），尚待遊戲內驗收；不是全部版本詞綴的完整清單。</p>
				<p>冷卻恢復的交易模板為「更多」，但官方實際物品顯示「更少」，已依物品顯示校正。復活與收益欄位名稱已核對官方公開物品 properties；汙染及稀有度沿用 POE1 欄位格式，仍需遊戲內驗收。</p>
				<a href="https://pathofexile.tw/api/trade2/data/stats" target="_blank" rel="noopener noreferrer">GGG 官方詞綴資料</a>
				{' · '}<a href="https://poe2db.tw/tw/Modifiers" target="_blank" rel="noopener noreferrer">POE2DB 詞綴分類</a>
			</details>
		</section>
	);
}
