import data from '../../data/poe2/tablets.json';
import { selectedOptionRegex, generatePriceRangeRegex, numericRegexPosition } from './tablet-upstream';

// TabletResult.ts / parseAffixToken.ts, veiset/poe.re @ 5d07d01.
// Keep upstream compound tokens and generated regexes intact.
export const tabletAffixes = data.tokens.map(token => {
	const ranges = [];
	const name = token.rawText.split('\n').map(line => line
		.replace(/\(([+-]?\d+)-([+-]?\d+)\)/g, (_, low, high) => {
			ranges.push([Number(low), Number(high)]);

			return '##';
		})
		.replace(/(?<![A-Za-z0-9])\+?(\d+)(?![A-Za-z0-9])/g, '#')
		.replace(/\[([^\]]+)\]/g, '$1')).join('|');

	return { id: token.id, name, regex: token.regex, ranges };
}).sort((a, b) => a.name.localeCompare(b.name));

export const tabletTypes = ['輻照碑牌', '祭祀碑牌', '譫妄碑牌', '裂痕碑牌', '深淵碑牌', '神廟碑牌', '總督碑牌', '探險碑牌'];
export const tabletRarities = ['普通', '魔法', '稀有'];
export const initialTabletSettings = {
	rarities: [], types: [], selection: {}, mode: 'any',
	usesRemaining: false, uses: '10', round10: false,
	priceEnabled: false, priceMin: '0', priceMax: '999', currency: 'exalted',
	customText: '',
};

export const supportsTabletValue = mod => mod.ranges[0]?.length >= 2
	&& mod.ranges[0].every(Number.isInteger) && numericRegexPosition(mod) !== undefined;

export function generateTabletRegex(settings = initialTabletSettings) {
	const s = { ...initialTabletSettings, ...settings };
	const rarities = tabletRarities.filter(name => s.rarities.includes(name));
	const types = tabletTypes.filter(name => s.types.includes(name));

	if (s.rarities.some(name => !tabletRarities.includes(name)) || s.types.some(name => !tabletTypes.includes(name))) {
		throw new Error('未知的碑牌種類或稀有度。');
	}

	if (!['any', 'all'].includes(s.mode)) throw new Error('未知的詞綴比對方式。');

	const rarity = rarities.map(name => name === '普通' ? '中' : name).join('|');
	const affixes = Object.entries(s.selection).map(([id, value]) => {
		const mod = tabletAffixes.find(entry => String(entry.id) === id);

		if (!mod) throw new Error('選取的碑牌詞綴已不存在，請重置。');
		if (value !== null && (!Number.isInteger(value) || value < 0)) throw new Error('詞綴門檻需為非負整數。');

		return selectedOptionRegex({ ...mod, value }, s.round10);
	});
	let uses = '';

	if (s.usesRemaining) {
		const n = Number(s.uses);

		if (!/^\d+$/.test(String(s.uses)) || n < 1 || n > 18) throw new Error('碑牌剩餘次數請輸入 1～18 的整數。');

		const number = n < 10 ? `(${n === 9 ? '9' : `[${n}-9]`}|1[0-8])` : `(1[${n % 10}-8])`;

		// Localize "N uses" to the Traditional Chinese item text.
		uses = `"剩餘 *${number} *次使用"`;
	}

	if (s.priceEnabled && !['exalted', 'divine'].includes(s.currency)) throw new Error('未知的通貨。');

	return [
		rarities.length && rarities.length < 3 ? `"稀有度[:：] *${rarities.length === 1 ? rarity : `(${rarity})`}"` : '',
		types.length && types.length < tabletTypes.length ? `"(${types.join('|')})"` : '',
		uses,
		...(s.mode === 'all' ? affixes.map(pattern => `"${pattern}"`) : affixes.length ? [`"${affixes.join('|')}"`] : []),
		s.priceEnabled ? generatePriceRangeRegex(s.priceMin, s.priceMax, s.currency) : '',
		s.customText,
	].filter(Boolean).join(' ').trim();
}
