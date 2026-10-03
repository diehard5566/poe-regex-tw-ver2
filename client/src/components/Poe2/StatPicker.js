/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { toggleStat } from '../../utils/poe2/search';

export default function StatPicker({ title, mods, selection, onChange, numeric = true }) {
	const [search, setSearch] = useState('');
	const filtered = mods.filter(mod => selection[mod.id] || mod.text.includes(search.trim()))
		.sort((a, b) => Number(Boolean(selection[b.id])) - Number(Boolean(selection[a.id])));

	return (
		<section className="poe2-selector">
			<h2>{title} · {mods.filter(mod => selection[mod.id]).length}</h2>
			<label className="poe2-search-label">搜尋{title}
				<input type="search" value={search} placeholder="搜尋詞綴…" onChange={event => setSearch(event.target.value)} />
			</label>
			<ul>{filtered.map(mod => (
				<li key={mod.id}>
					<label className={selection[mod.id] ? 'is-selected' : ''}>
						<input type="checkbox" checked={Boolean(selection[mod.id])} onChange={() => onChange(toggleStat(selection, mod))} />
						<span>{mod.text}</span>
					</label>
					{numeric && selection[mod.id]?.length > 0 && (
						<div className="poe2-value-fields">{selection[mod.id].map((value, index) => (
							<div className="poe2-value-row" key={`${mod.id}-${index}`}>
								<span>第 {index + 1} 個 #</span>
								{['min', 'max'].map(bound => (
									<label key={bound}>{bound === 'min' ? '最小' : '最大'}
										<input type="number" min="-9999" max="9999" step="1" value={value[bound]} placeholder="不限"
											aria-label={`${mod.text} 第 ${index + 1} 個數值${bound === 'min' ? '最小' : '最大'}`}
											onChange={event => onChange({ ...selection, [mod.id]: selection[mod.id].map((range, position) => position === index ? { ...range, [bound]: event.target.value } : range) })} />
									</label>
								))}
							</div>
						))}</div>
					)}
				</li>
			))}</ul>
			{!filtered.length && <p role="status">沒有符合的詞綴。</p>}
		</section>
	);
}
