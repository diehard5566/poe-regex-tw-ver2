import React, { useState } from 'react';
import data from '../../data/poe2/vendor.json';
import { buildStatQuery, propertiesQuery, emptyProperties, safelyGenerate, equipmentClasses, classQuery } from '../../utils/poe2/search';
import ResultBox from '../MapsController.js/ResultBox';
import StatPicker from './StatPicker';
import { DataNote, MatchMode, NumericMode } from './ToolControls';
import './Poe2.css';
import Properties from './Properties';

const emptyGroup = () => ({ selection: {}, mode: 'any' });

export default function Vendor() {
	const [groups, setGroups] = useState([emptyGroup()]);
	const [classes, setClasses] = useState([]);
	const [active, setActive] = useState(0);
	const [properties, setProperties] = useState(emptyProperties);
	const [resetKey, setResetKey] = useState(0);
	const [advanced, setAdvanced] = useState(false);
	const group = groups[active];
	const updateGroup = change => setGroups(current => current.map((entry, index) => index === active ? { ...entry, ...change } : entry));
	const { result, error } = safelyGenerate(() => [
		...groups.map(entry => buildStatQuery(data.mods, entry.selection, entry.mode, advanced)),
		propertiesQuery(properties),
		classQuery(classes),
	].filter(Boolean).join(' '));
	const middle = Math.ceil(data.mods.length / 2);

	return (
		<section className="poe2-page">
			<h1>POE 2 商店搜尋</h1>
			<p className="poe2-description">每組可要求任一或全部詞綴；各組之間必須全部符合。例如第一組選跑速、第二組選任一抗性。</p>
			<ResultBox result={result} error={error} reset={() => {
				setAdvanced(false);
				setGroups([emptyGroup()]); setActive(0); setProperties(emptyProperties); setClasses([]); setResetKey(value => value + 1);
			}} />
			<NumericMode value={advanced} onChange={setAdvanced} />
			<Properties value={properties} onChange={setProperties} />
			<details className="poe2-data-note"><summary>物品種類（已選 {classes.length} 項，不選表示不限）</summary>
				<fieldset className="poe2-type-list"><legend>種類之間符合任一即可，仍需符合上方條件</legend>
					{equipmentClasses.map(name => <label key={name}><input type="checkbox" checked={classes.includes(name)} onChange={() => setClasses(current => current.includes(name) ? current.filter(value => value !== name) : [...current, name])} />{name}</label>)}
				</fieldset>
				<p>依 POE1「物品種類:」格式搜尋，POE2 類別名稱仍待實際物品驗收。</p>
			</details>
			<div className="poe2-mode" role="group" aria-label="條件群組">
				{groups.map((entry, index) => <button key={`group-${index}`} type="button" aria-pressed={index === active} onClick={() => setActive(index)}>第 {index + 1} 組（{Object.keys(entry.selection).length}）</button>)}
				<button type="button" disabled={groups.length >= 5} onClick={() => { setGroups([...groups, emptyGroup()]); setActive(groups.length); }}>新增條件組</button>
				<button type="button" disabled={groups.length === 1} onClick={() => { setGroups(groups.filter((_, index) => index !== active)); setActive(0); setResetKey(value => value + 1); }}>移除目前組</button>
			</div>
			<MatchMode value={group.mode} onChange={mode => updateGroup({ mode })} />
			<div className="poe2-modifiers" key={`${active}-${resetKey}`}>
				<StatPicker title="跑速、抗性與一般屬性" mods={data.mods.slice(0, middle)} selection={group.selection} onChange={selection => updateGroup({ selection })} />
				<StatPicker title="能力與技能等級" mods={data.mods.slice(middle)} selection={group.selection} onChange={selection => updateGroup({ selection })} />
			</div>
			<DataNote><p>物品條件依 POE1 繁中格式實作；詞綴來自官方 POE2 資料，數值需遊戲內驗收。</p></DataNote>
		</section>
	);
}
