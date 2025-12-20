const mapModifiers = require('../lib/map-mod.json');
const t17Modifiers = require('../lib/tier-17-mods.json');
const { ENUM_MAP_MODIFIER_TYPE } = require('../lib/enum');

async function getAllMapModsByType(type) {
	const mods = type === ENUM_MAP_MODIFIER_TYPE.T17 ? t17Modifiers : mapModifiers;

	return mods;
}

async function generateMapRegex({
	wantedMods,
	unwantedMods,
	itemQuantity,
	packSize,
	allGoodMods,
	itemRarity,
	mapDrop,
	scarab,
	currency,
	divination,
	corrupted,
	rarity,
}) {
	const exclusions = generateBadMods(unwantedMods);
	const inclusions = generateGoodMods(wantedMods, allGoodMods);
	const quantity = itemQuantity ? addQuantOrPack('品數.*', generateNumberRegex(itemQuantity.toString())) : '';
	const pack = packSize ? addQuantOrPack('群大小.*', generateNumberRegex(packSize.toString())) : '';
	const itemRarityRegex = itemRarity ? addQuantOrPack('有度.*', generateNumberRegex(itemRarity.toString(), { optimize: false })) : '';
	const moreMaps = mapDrop ? addQuantOrPack('多地圖.*', generateNumberRegex(mapDrop.toString(), { optimize: false })) : '';
	const moreScarab = scarab ? addQuantOrPack('蟲.*', generateNumberRegex(scarab.toString())) : '';
	const moreCurrency = currency ? addQuantOrPack('貨.*', generateNumberRegex(currency.toString())) : '';
	const moreDivination = divination ? addQuantOrPack('運卡.*', generateNumberRegex(divination.toString())) : '';
	const corruptedRegex = generateCorruptedRegex(corrupted);
	const rarityRegex = generateRarityRegex(rarity);

	const result = `${exclusions} ${inclusions} ${quantity} ${pack} ${itemRarityRegex} ${moreMaps} ${moreScarab} ${moreCurrency} ${moreDivination} ${corruptedRegex} ${rarityRegex}`.trim().replace(/\s{2,}/g, ' ');

	return optimize(result);
}

// 處理不想要的詞綴
function generateBadMods(unwantedMods) {
	if (unwantedMods.length === 0) {
		return '';
	}

	const normalMods = unwantedMods.filter(mod => !mod.isT17).map(mod => mod.mod);
	const t17Mods = unwantedMods.filter(mod => mod.isT17).map(mod => mod.mod);

	let modStr = [];

	if (normalMods.length > 0) {
		const normalModStr = normalMods.map(mod => mapModifiers[mod]).filter(Boolean);

		modStr = modStr.concat(normalModStr);
	}

	if (t17Mods.length > 0) {
		const t17ModStr = t17Mods.map(mod => t17Modifiers[mod]).filter(Boolean);

		modStr = modStr.concat(t17ModStr);
	}

	if (modStr.length === 0) {
		return '';
	}

	return `"!${modStr.join('|')}"`;
}

// 處理想要的詞綴
function generateGoodMods(wantedMods, allGoodMods) {
	if (wantedMods.length === 0) {
		return '';
	}

	const normalMods = wantedMods.filter(mod => !mod.isT17).map(mod => mod.mod);
	const t17Mods = wantedMods.filter(mod => mod.isT17).map(mod => mod.mod);

	let regex = [];

	if (normalMods.length > 0) {
		const normalRegex = normalMods.map(mod => mapModifiers[mod]).filter(Boolean);

		regex = regex.concat(normalRegex);
	}

	if (t17Mods.length > 0) {
		const t17Regex = t17Mods.map(mod => t17Modifiers[mod]).filter(Boolean);

		regex = regex.concat(t17Regex);
	}

	if (regex.length === 0) {
		return '';
	}

	regex = [...new Set(regex)];

	if (allGoodMods) {
		return regex
			.map(matchSafe => matchSafe.includes(' ') ? `"${matchSafe}"` : matchSafe)
			.join(' ');
	}

	return `"${regex.join('|')}"`;
}

function addQuantOrPack(prefix, string) {
	if (string === '') {
		return '';
	}

	return `${prefix}\\b(?:${string})\\b`;
}

function generateCorruptedRegex(corrupted) {
	if (!corrupted) {
		return '';
	}

	return '"已汙染"';
}

function generateRarityRegex(rarity) {
	if (!rarity || rarity.length === 0) {
		return '';
	}

	const rarityMap = {
		normal: '普通',
		magic: '魔法',
		rare: '稀有',
	};

	const selectedRarities = rarity.map(r => rarityMap[r]).filter(Boolean);

	if (selectedRarities.length === 0) {
		return '';
	}

	if (selectedRarities.length === 1) {
		return `"稀有度: ${selectedRarities[0]}"`;
	}

	return `"稀有度: (${selectedRarities.join('|')})"`;
}

function optimize(string) {
	return string
		.replace(/\[8-9\]/g, '[89]')
		.replace(/\[9-9\]/g, '9');
}

/**
 * 截斷最後一位數字
 * @param {number} n - 數字
 * @returns {number} 截斷後的數字
 */
function truncateLastDigit(n) {
	return Math.floor(n / 10);
}

/**
 * 生成一個匹配特定數字範圍的正則表達式
 * @param {string} number - 輸入的數字字符串
 * @param {Object} options - 配置選項
 * @param {boolean} [options.optimize=true] - 是否優化（將數字向下取整到最近的 10）
 * @returns {string} 生成的正則表達式字符串
 */
function generateNumberRegex(number, { optimize = true } = {}) {
	const numbers = number.match(/\d/g);

	if (numbers === null) {
		return '';
	}

	const quant = optimize
		? Math.floor(Number(numbers.join('')) / 10) * 10
		: Number(numbers.join(''));

	if (isNaN(quant) || quant === 0) {
		if (optimize && numbers.length === 1) {
			return '.';
		}

		return '';
	}

	if (quant >= 200) {
		const v = truncateLastDigit(truncateLastDigit(quant));

		return `[${v}-9]..`;
	}

	if (quant >= 150) {
		const str = quant.toString();
		const d0 = str[0];
		const d1 = str[1];
		const d2 = str[2];

		if (str[1] === '0' && str[2] === '0') {
			return `([2-9]..|${d0}..)`;
		}

		if (str[2] === '0') {
			return `([2-9]..|1[${d1}-9].)`;
		}

		if (str[1] === '0') {
			return `([2-9]..|\\d0[${d2}-9]|\\d[1-9].)`;
		}

		if (str[1] === '9' && str[2] === '9') {
			return '([2-9]..|199)';
		}

		if (d1 === '9') {
			return `([2-9]..|19[${d2}-9])`;
		}

		return `[12]([${d1}-9][${d2}-9]|[${Number(d1) + 1}-9].)`;
	}

	if (quant > 100) {
		const str = quant.toString();
		const d0 = str[0];
		const d1 = str[1];
		const d2 = str[2];

		if (str[1] === '0' && str[2] === '0') {
			return `${d0}..`;
		}

		if (str[2] === '0') {
			return `(1[${d1}-9].|[2-9]..)`;
		}

		if (str[1] === '0') {
			return `(\\d0[${d2}-9]|\\d[1-9].)`;
		}

		if (str[1] === '9' && str[2] === '9') {
			return '(199|[2-9]..)';
		}

		if (d1 === '9') {
			return `19[${d2}-9]`;
		}

		return `(1([${d1}-9][${d2}-9]|[${Number(d1) + 1}-9].)|[2-9]..)`;
	}

	if (quant === 100) {
		return '\\d..';
	}

	if (quant > 9) {
		const str = quant.toString();
		const d0 = str[0];
		const d1 = str[1];

		if (str[1] === '0') {
			return `([${d0}-9].|\\d..)`;
		}

		if (str[0] === '9') {
			return `(${d0}[${d1}-9]|\\d..)`;
		}

		return `(${d0}[${d1}-9]|[${Number(d0) + 1}-9].|\\d..)`;
	}

	if (quant <= 9) {
		return `([${quant}-9]|\\d..?)`;
	}

	return number;
}

module.exports = {
	getAllMapModsByType,
	generateMapRegex,
};
