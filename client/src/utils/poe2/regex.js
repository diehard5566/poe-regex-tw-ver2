import data from '../../data/poe2/waystones.json';
import { tierQuery, propertyRange, rarityQuery, waystoneSummaryQuery } from './search';

export const waystoneMods = data.mods;

export function generateWaystoneRegex({ wanted = [], unwanted = [], matchAll = false, tierMin = '1', tierMax = '16', reviveMin = '0', reviveMax = '6', rarities = [], corrupted = '', summary = {}, delirious = false, round10 = false } = {}) {
	const knownIds = new Set(waystoneMods.map(mod => mod.id));

	if ([...wanted, ...unwanted].some(id => !knownIds.has(id))) {
		throw new Error('含有未知詞綴，請重置後重新選擇。');
	}

	if (wanted.some(id => unwanted.includes(id))) {
		throw new Error('同一詞綴不能同時需要與排除。');
	}

	if (rarities.some(value => !['普通', '魔法', '稀有'].includes(value))) throw new Error('未知的換界石稀有度。');
	if (!['', 'yes', 'no'].includes(corrupted)) throw new Error('未知的汙染狀態。');

	// Upstream Chinese tokens have no numeric ranges: select the affix, not a roll interval.
	const patterns = ids => waystoneMods.filter(mod => ids.includes(mod.id)).map(mod => mod.pattern);
	const included = patterns(wanted);
	const excluded = patterns(unwanted);
	const selectedRarities = ['普通', '魔法', '稀有'].filter(value => rarities.includes(value));
	const rarity = selectedRarities.length === 1 ? rarityQuery(selectedRarities[0])
		: selectedRarities.length === 2 ? `"稀有度[:：] *(${selectedRarities.map(value => value === '普通' ? '中' : value).join('|')})"` : '';
	const revives = propertyRange('可用的復活數', reviveMin, reviveMax, 6);

	return [
		rarity,
		tierQuery(tierMin, tierMax),
		(reviveMin === '' || Number(reviveMin) === 0) && (reviveMax === '' || Number(reviveMax) === 6) ? '' : revives,
		matchAll ? included.map(pattern => `"${pattern}"`).join(' ') : included.length ? `"${included.join('|')}"` : '',
		excluded.length ? `"!${excluded.join('|')}"` : '',
		delirious ? '"區域中玩家的譫妄為"' : '',
		corrupted === 'yes' ? '"^已汙染$"' : corrupted === 'no' ? '"!^已汙染$"' : '',
		waystoneSummaryQuery(summary, round10),
	].filter(Boolean).join(' ');
}

export function toggleWaystoneMod(settings, side, id) {
	const other = side === 'wanted' ? 'unwanted' : 'wanted';

	return {
		...settings,
		[side]: settings[side].includes(id) ? settings[side].filter(value => value !== id) : [...settings[side], id],
		[other]: settings[other].filter(value => value !== id),
	};
}
