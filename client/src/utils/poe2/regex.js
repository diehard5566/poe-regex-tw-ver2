import data from '../../data/poe2/waystones.json';
import { statPattern, tierQuery, propertiesQuery, emptyProperties, waystoneSummaryQuery } from './search';

export const waystoneMods = data.mods;

export function generateWaystoneRegex({ wanted = [], unwanted = [], matchAll = false, values = {}, tierMin = '', tierMax = '', rarity = '', corrupted = '', summary = {}, delirious = false, advanced = false }) {
	const knownIds = new Set(waystoneMods.map(mod => mod.id));

	if ([...wanted, ...unwanted].some(id => !knownIds.has(id))) {
		throw new Error('含有未知詞綴，請重置後重新選擇。');
	}

	if (wanted.some(id => unwanted.includes(id))) {
		throw new Error('同一詞綴不能同時需要與排除。');
	}

	const patterns = ids => waystoneMods.filter(mod => ids.includes(mod.id)).map(mod => values[mod.id]?.some(range => range.min !== '' || range.max !== '') ? statPattern({ ...mod, text: mod.text.split('\n')[0] }, values[mod.id], advanced) : mod.pattern);
	const included = patterns(wanted);
	const excluded = patterns(unwanted);

	return [
		tierQuery(tierMin, tierMax),
		waystoneSummaryQuery(summary, delirious),
		propertiesQuery({ ...emptyProperties, rarity, corrupted }),
		excluded.length ? `"!${excluded.join('|')}"` : '',
		matchAll ? included.map(pattern => `"${pattern}"`).join(' ') : included.length ? `"${included.join('|')}"` : '',
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
