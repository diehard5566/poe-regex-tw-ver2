import numericTemplates from '../../data/poe2/numeric-templates.json';

export const escapeRegex = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Numeric branches starting with '(' are complete groups, so flatten nested ORs.
const join = parts => parts.length === 1 ? parts[0] : `(${parts.map(part => part.startsWith('(') ? part.slice(1, -1) : part).join('|')})`;
const digits = count => count === 0 ? '' : count === 1 ? '\\d' : `\\d{${count}}`;
const digitRange = (min, max) => min === max ? `${min}` : max - min === 1 ? `[${min}${max}]` : `[${min}-${max}]`;

// Inclusive integer ranges, with no rounding. Fixed-width branches prevent 9 matching 19.
function fixedRange(low, high) {
	if (low === high) return low;
	if (/^0+$/.test(low) && /^9+$/.test(high)) return digits(low.length);
	if (low[0] === high[0]) return low[0] + fixedRange(low.slice(1), high.slice(1));

	const a = Number(low[0]);
	const b = Number(high[0]);
	const width = low.length - 1;

	if (width === 0) return digitRange(a, b);

	const lowerComplete = /^0+$/.test(low.slice(1));
	const upperComplete = /^9+$/.test(high.slice(1));
	const parts = [];

	if (!lowerComplete) parts.push(`${a}${fixedRange(low.slice(1), '9'.repeat(width))}`);

	const middleStart = lowerComplete ? a : a + 1;
	const middleEnd = upperComplete ? b : b - 1;

	if (middleStart <= middleEnd) parts.push(digitRange(middleStart, middleEnd) + digits(width));
	if (!upperComplete) parts.push(`${b}${fixedRange('0'.repeat(width), high.slice(1))}`);
	return join(parts);
}

// Same strategy as upstream GenerateNumberRegex: current width plus longer numbers.
// A positioned stat needs full digit runs; a property minimum can search a suffix.
function minimumRange(min, substring = false) {
	if (min === 0) return '\\d+';
	if (min === 1 && !substring) return '[1-9]\\d*';

	const low = String(min);
	const current = fixedRange(low, '9'.repeat(low.length));

	if (!substring) return join([current, `\\d{${low.length + 1},}`]);

	const short = current.replace(/\\d(?:\{(\d+)\})?/g, (_, count) => '.'.repeat(Number(count || 1)));
	const longer = low.length === 1 ? '\\d..?' : `\\d${'.'.repeat(low.length)}`;

	return join([short, longer]);
}

function unsignedRange(min, max) {
	if (max === Infinity) return minimumRange(min);

	const parts = [];

	for (let width = String(min).length; width <= String(max).length; width++) {
		const low = Math.max(min, width === 1 ? 0 : 10 ** (width - 1));
		const high = Math.min(max, 10 ** width - 1);

		parts.push(fixedRange(String(low), String(high)));
	}

	return join(parts);
}

// Missing bounds are genuinely open, not expanded into every width up to 9999.
// Inputs are still limited to four digits, as in the controls.
export function integerRange(min, max) {
	if (!Number.isInteger(min) || !Number.isInteger(max) || min < -9999 || max > 9999 || min > max) {
		throw new Error('數值需為 -9999～9999 的整數，且最小值不可大於最大值。');
	}

	return signedRange(min, max);
}

function signedRange(min, max) {
	const parts = [];

	if (min < 0) parts.push(`-${unsignedRange(Math.max(1, -max), -min)}`);
	if (max >= 0) parts.push(`\\+?${unsignedRange(Math.max(0, min), max)}`);
	return join(parts);
}

function statNumber(min, max) {
	if ([min, max].some(value => value !== '' && !/^[+-]?\d+$/.test(String(value)))) {
		throw new Error('數值門檻僅接受整數。');
	}

	// Validate explicit bounds before substituting open ends.
	integerRange(min === '' ? -9999 : Number(min), max === '' ? 9999 : Number(max));
	return signedRange(min === '' ? -Infinity : Number(min), max === '' ? Infinity : Number(max));
}

const anyNumber = '[-+]?\\d+(\\.\\d+)?';
const literalPattern = text => escapeRegex(text).replace(/\s+/g, ' *');

export function statPattern(mod, values = [], advanced = false) {
	const template = numericTemplates[mod.text] || `^${mod.text}$`;
	const anchoredStart = template.startsWith('^');
	const anchoredEnd = template.endsWith('$');
	const parts = template.slice(anchoredStart ? 1 : 0, anchoredEnd ? -1 : undefined).split('#');
	let pattern = (anchoredStart ? '^' : '') + literalPattern(parts[0]);

	for (let index = 1; index < parts.length; index++) {
		const { min = '', max = '' } = values[index - 1] || {};
		const hasValue = min !== '' || max !== '';

		pattern += hasValue ? statNumber(min, max) : anyNumber;

		if (advanced) {
			// Like upstream, the opening parenthesis anchors the actual rolled value.
			// Earlier slots must not consume a later slot's value or roll range.
			pattern += '[（(]' + (parts[index] || index < parts.length - 1 ? '[^）)\\n]*[）)]' : '');
		}

		pattern += literalPattern(parts[index]);
	}

	return pattern + (anchoredEnd && !(advanced && parts.length > 1 && !parts[parts.length - 1]) ? '$' : '');
}

export function selectedPatterns(mods, selection, advanced = false) {
	const byId = new Map(mods.map(mod => [mod.id, mod]));

	return Object.entries(selection).map(([id, values]) => {
		const mod = byId.get(id);

		if (!mod) throw new Error('選取的詞綴已不存在，請重置。');
		return {
			...mod,
			pattern: values.some(value => value.min !== '' || value.max !== '') ? statPattern(mod, values, advanced) : (mod.pattern || statPattern(mod, [], advanced)),
		};
	});
}

export function combinePatterns(patterns, mode = 'any') {
	const unique = [...new Set(patterns)].filter(Boolean);

	if (!unique.length) return '';
	return mode === 'all' ? unique.map(pattern => `"${pattern}"`).join(' ') : `"${unique.join('|')}"`;
}

export function buildStatQuery(mods, selection, mode, advanced = false) {
	const selected = selectedPatterns(mods, selection, advanced);

	if (mode === 'both') {
		if (selected.some(mod => mod.affix === 'BOTH')) throw new Error('有詞綴的前後綴分類不唯一，請改用任一或全部符合。');

		const prefixes = selected.filter(mod => mod.affix === 'PREFIX' || mod.affix === 'BOTH');
		const suffixes = selected.filter(mod => mod.affix === 'SUFFIX' || mod.affix === 'BOTH');

		if (selected.length && (!prefixes.length || !suffixes.length)) throw new Error('前後綴模式需兩側各選至少一項。');
		return [combinePatterns(prefixes.map(mod => mod.pattern)), combinePatterns(suffixes.map(mod => mod.pattern))].filter(Boolean).join(' ');
	}

	return combinePatterns(selected.map(mod => mod.pattern), mode);
}

export function toggleStat(selection, mod) {
	const next = { ...selection };

	if (next[mod.id]) delete next[mod.id];
	else next[mod.id] = Array.from({ length: mod.text.split('#').length - 1 }, () => ({ min: '', max: '' }));
	return next;
}

export function safelyGenerate(generate) {
	try { return { result: generate(), error: '' }; }
	catch (error) { return { result: '', error: error.message }; }
}

export function rarityQuery(value) {
	if (!value) return '';
	if (!['普通', '魔法', '稀有', '傳奇'].includes(value)) throw new Error('未知的稀有度。');
	return `"稀有度[:：] *${value}"`;
}

export function tabletUsesQuery(min) {
	if (min === '') return '';
	if (!/^\d+$/.test(min) || Number(min) < 1 || Number(min) > 99) throw new Error('碑牌剩餘次數請輸入 1～99 的整數。');
	return `"剩餘 *${unsignedRange(Number(min), 99)} *次使用"`;
}

export function tierQuery(min, max) {
	if (min === '' && max === '') return '';

	const low = min === '' ? 1 : Number(min);
	const high = max === '' ? 16 : Number(max);

	if (![min, max].every(value => value === '' || /^\d+$/.test(String(value))) || low < 1 || high > 16 || low > high) throw new Error('換界石階級需為 1～16，最小值不可大於最大值。');
	return `"階級 *${unsignedRange(low, high)}[）)]"`;
}

export const emptyProperties = { rarity: '', corrupted: '', qualityMin: '', qualityMax: '', levelMin: '', levelMax: '', requiredMin: '', requiredMax: '', sockets: false };

export function propertyRange(label, min, max, limit = 9999, suffix = '') {
	if (min === '' && max === '') return '';

	const low = min === '' ? 0 : Number(min);
	const high = max === '' ? limit : Number(max);

	if (![min, max].every(value => value === '' || /^\d+$/.test(String(value))) || low < 0 || high > limit || low > high) {
		throw new Error(`${label}需為 0～${limit} 的整數，且最小值不可大於最大值。`);
	}

	// Percent minima mirror upstream's short property-prefix + number + % rule.
	if (suffix === '%' && max === '') return `"${escapeRegex(label)}.*${minimumRange(low, true)}%"`;

	// Do not use .* with a maximum: it could consume the 1 in 150 and match 50.
	const prefix = label === '等級' ? '^等級' : escapeRegex(label);
	const number = unsignedRange(low, high);

	return `"${prefix}[:：] *${suffix ? '\\+?' : ''}${number}${suffix || '\\b'}"`;
}

export function propertiesQuery(settings) {
	if (!['', 'yes', 'no'].includes(settings.corrupted)) throw new Error('未知的汙染狀態。');
	return [
		rarityQuery(settings.rarity),
		settings.corrupted === 'yes' ? '"^已汙染$"' : settings.corrupted === 'no' ? '"!^已汙染$"' : '',
		propertyRange('品質', settings.qualityMin, settings.qualityMax, 9999, '%'),
		propertyRange('物品等級', settings.levelMin, settings.levelMax, 100),
		propertyRange('等級', settings.requiredMin, settings.requiredMax, 100),
		settings.sockets ? '"^插槽[:：] *S"' : '',
	].filter(Boolean).join(' ');
}

export const equipmentClasses = ['項鍊', '戒指', '腰帶', '法杖', '權杖', '匕首', '單手劍', '單手斧', '單手錘', '雙手劍', '雙手斧', '雙手錘', '弓', '長杖', '細杖', '長矛', '十字弓', '鏈錘', '魔符', '頭盔', '胸甲', '手套', '鞋子', '盾', '輕盾', '法器', '箭袋'];
export function classQuery(names) {
	if (names.some(name => !equipmentClasses.includes(name))) throw new Error('未知的物品種類。');
	return names.length ? `"^物品種類[:：] *(${[...new Set(names)].map(escapeRegex).join('|')})$"` : '';
}

// Names verified against public trade item properties, not trade filter labels.
export const waystoneFields = [
	{ key: 'revives', label: '可用的復活數', limit: 6, suffix: '' },
	{ key: 'itemRarity', label: '物品稀有度', limit: 9999, suffix: '%' },
	{ key: 'packSize', label: '怪群大小', limit: 9999, suffix: '%' },
	{ key: 'effectiveness', label: '怪物效能', limit: 9999, suffix: '%' },
	{ key: 'monsterRarity', label: '怪物稀有度', limit: 9999, suffix: '%' },
	{ key: 'dropChance', label: '換界石掉落機率', limit: 9999, suffix: '%' },
];

export function waystoneSummaryQuery(values = {}, delirious = false) {
	return [
		...waystoneFields.map(field => {
			const { min = '', max = '' } = values[field.key] || {};
			const query = propertyRange(field.label, min, max, field.limit, field.suffix);

			return field.suffix === '%' && min !== '' && Number(min) === 0 && max === '' ? '' : query;
		}),
		delirious ? '"區域中玩家的譫妄為"' : '',
	].filter(Boolean).join(' ');
}
