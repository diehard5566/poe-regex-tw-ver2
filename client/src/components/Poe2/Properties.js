/* eslint-disable react/prop-types */
import React from 'react';
import { RaritySelect } from './ToolControls';

export default function Properties({ value, onChange }) {
	return <fieldset className="poe2-properties">
		<legend>物品條件（與所有詞綴組同時符合）</legend>
		<div className="poe2-toolbar">
			<RaritySelect value={value.rarity} onChange={rarity => onChange({ ...value, rarity })} />
			<label>汙染 <select value={value.corrupted} onChange={event => onChange({ ...value, corrupted: event.target.value })}>
				<option value="">不限</option><option value="yes">已汙染</option><option value="no">未汙染</option>
			</select></label>
			<label><input type="checkbox" checked={value.sockets} onChange={event => onChange({ ...value, sockets: event.target.checked })} />有符文插槽</label>
		</div>
		<div className="poe2-toolbar">{[['quality', '品質 %', 9999], ['level', '物品等級', 100], ['required', '需求等級', 100]].map(([key, label, max]) => (
			<div key={key} className="poe2-value-row"><span>{label}</span>{[['Min', '最小'], ['Max', '最大']].map(([bound, boundLabel]) => (
				<label key={bound}>{boundLabel}<input type="number" min="0" max={max} placeholder="不限" value={value[key + bound]} aria-label={`${label}${boundLabel}`}
					onChange={event => onChange({ ...value, [key + bound]: event.target.value })} /></label>
			))}</div>
		))}</div>
		<p className="poe2-description">符文插槽依「插槽: S」搜尋。需求等級依「等級:」行比對；品質為 0 仍要求存在品質行。</p>
	</fieldset>;
}
