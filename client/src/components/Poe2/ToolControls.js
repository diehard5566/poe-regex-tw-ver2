/* eslint-disable react/prop-types */
import React from 'react';

export function NumericMode({ value, onChange }) {
	return <div className="poe2-toolbar"><label>
		<input type="checkbox" checked={value} onChange={event => onChange(event.target.checked)} />
		進階詞綴文字（數值後有括號範圍）
	</label><span>預設比對一般文字；最小＝最大代表指定數值。</span></div>;
}

export function MatchMode({ value, onChange, both = false }) {
	const modes = { any: '任一詞即可', all: '詞全對才亮', ...(both ? { both: '前後綴各至少一項' } : {}) };

	return <div className="poe2-mode" role="group" aria-label="詞綴匹配方式">{Object.entries(modes).map(([mode, label]) => (
		<button key={mode} type="button" aria-pressed={value === mode} onClick={() => onChange(mode)}>{label}</button>
	))}</div>;
}

export function DataNote({ children }) {
	return <details className="poe2-data-note">
		<summary>資料來源、數值與比對限制</summary>
		<p>文字核對：GGG 官方繁中詞綴，2026-10-03。候選分類參考 poe.re；未能確認的翻譯不列入，因此不是完整遊戲資料庫。</p>
		<p># 依出現順序編號。可輸入 -9999～9999 的整數門檻；單邊留空不設限，最小＝最大代表指定數值。不取整、不加總，也不自動套用詞綴階級。一般與進階文字需選擇相應格式。</p>
		<p>複合詞綴以個別屬性列出，不保證前後綴數量、詞綴階級或空詞綴。含合成屬性或進階數值範圍標記的遊戲文字仍需實測。</p>
		{children}
		<a href="https://pathofexile.tw/api/trade2/data/stats" target="_blank" rel="noopener noreferrer">官方詞綴</a>
		{' · '}<a href="https://poe2db.tw/tw/Modifiers" target="_blank" rel="noopener noreferrer">POE2DB</a>
	</details>;
}

export function RaritySelect({ value, onChange }) {
	return <label>稀有度 <select value={value} onChange={event => onChange(event.target.value)}>
		<option value="">不限</option>{['普通', '魔法', '稀有', '傳奇'].map(name => <option key={name}>{name}</option>)}
	</select></label>;
}
