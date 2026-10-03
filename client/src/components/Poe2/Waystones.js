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
				<p>與 poe2.re 相同，收益只設定最低值；留空或 0 表示不限。階級及復活次數才有上下限。</p>
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
			<details className="poe2-data-note">
				<summary>資料來源與目前支援範圍</summary>
				<p>已逐項對照 poe.re 5d07d01 的 32 組繁中換界石詞綴，保留複合詞綴與已核對的遊戲顯示文字。詞綴僅勾選，不套用自行延伸的數值區間。</p>
				<p>冷卻恢復的交易模板為「更多」，但官方實際物品顯示「更少」，已依物品顯示校正。復活與收益欄位名稱已核對官方公開物品 properties；普通稀有度依遊戲截圖使用「稀有度: 中」；其餘條件仍需遊戲內驗收。</p>
				<a href="https://poe2.re/waystone" target="_blank" rel="noopener noreferrer">poe2.re 換界石</a>
				{' · '}<a href="https://github.com/veiset/poe.re/tree/5d07d01eb53f26267f733df404566488e71150f3/poe2/src/pages/waystone" target="_blank" rel="noopener noreferrer">上游程式</a>
				{' · '}<a href="https://forum.gamer.com.tw/C.php?bsn=18966&amp;snA=134772" target="_blank" rel="noopener noreferrer">巴哈搜尋語法教學（POE1）</a>
				{' · '}<a href="https://pathofexile.tw/api/trade2/data/stats" target="_blank" rel="noopener noreferrer">GGG 官方詞綴資料</a>
				{' · '}<a href="https://poe2db.tw/tw/Modifiers" target="_blank" rel="noopener noreferrer">POE2DB 詞綴分類</a>
			</details>
		</section>
	);
}
