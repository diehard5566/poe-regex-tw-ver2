/* eslint-disable react/prop-types */
import React from 'react';

const ModSearchBox = props => {
	const { id, search, setSearch, placeholder } = props;
	const placeholderText = placeholder || '搜尋詞綴...';

	return (
		<div className="map-search-bar">
			<input
				type="search"
				value={search}
				className="modifier-search-box"
				id={id}
				placeholder={placeholderText}
				name="search-mod"
				onChange={v => setSearch(v.target.value)}
			/>
		</div>
	);
};

export default ModSearchBox;
