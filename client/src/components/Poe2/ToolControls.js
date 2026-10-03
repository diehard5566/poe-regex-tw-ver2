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

export function RaritySelect({ value, onChange }) {
	return <label>稀有度 <select value={value} onChange={event => onChange(event.target.value)}>
		<option value="">不限</option>{['普通', '魔法', '稀有', '傳奇'].map(name => <option key={name}>{name}</option>)}
	</select></label>;
}
