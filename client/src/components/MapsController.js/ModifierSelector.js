/* eslint-disable react/no-array-index-key */
/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import ModSearchBox from './ModSearchBox';
import './ModifierSelector.css';

const ModifierSelector = ({ title, modifiers, selectedMods, onSelectMod, onDeselectMod }) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [filteredModifiers, setFilteredModifiers] = useState(modifiers);

	useEffect(() => {
		const filtered = modifiers.filter(mod =>
			mod.mod.includes(searchTerm),
		);

		setFilteredModifiers(filtered);
	}, [searchTerm, modifiers]);

	const handleSearch = value => {
		setSearchTerm(value);
	};

	const handleModClick = mod => {
		if (selectedMods.includes(mod)) {
			onDeselectMod(mod);
		} else {
			onSelectMod(mod);
		}
	};

	return (
		<div className="modifier-selector">
			<h2>{title}</h2>
			<ModSearchBox
				id={`search-${title.replace(/\s+/g, '-').toLowerCase()}`}
				search={searchTerm}
				setSearch={handleSearch}
				placeholder="搜尋詞綴..."
			/>
			<ul>
				{filteredModifiers.map((mod, index) => (
					<li
						key={index}
						className={`${selectedMods.some(m => m.mod === mod.mod) ? 'selected' : ''} ${mod.isT17 ? 't17-modifier' : ''}`}
						onClick={() => handleModClick(mod)}
					>
						{mod.mod}
					</li>
				))}
			</ul>
		</div>
	);
};

export default ModifierSelector;
