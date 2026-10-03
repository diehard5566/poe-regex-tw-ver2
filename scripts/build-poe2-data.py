"""Offline data audit/build. python3 scripts/build-poe2-data.py UPSTREAM STATS_JSON ITEMS_JSON
Uses upstream only for candidate membership; never copies its regex/code/optimization tables.
Unmatched translations are recorded rather than silently translated or sign-flipped.
"""
import json
import re
import sys
import subprocess
from pathlib import Path

upstream, stats_file, items_file = map(Path, sys.argv[1:])
root = Path(__file__).resolve().parents[1]
out = root / 'client/src/data/poe2'
norm = lambda value: re.sub(r'\s+', '', value)
stats = json.loads(stats_file.read_text())['result']
items = json.loads(items_file.read_text())['result']
index = {}
for group in stats:
    if group['id'] in ('explicit', 'sanctum'):
        for entry in group['entries']:
            index.setdefault(norm(entry['text']), []).append(entry)
overrides = {entry['text']: entry for entry in json.loads((out / 'display-overrides.json').read_text())['mods']}
report = {'checkedAt': '2026-10-03', 'excluded': {}}

def read(kind, name=None):
    return json.loads((upstream / f'poe2/public/generated/{kind}/Generated.{name or kind.title()}.CHINESE.min.json').read_text())

def resolve(text, category):
    matches = index.get(norm(text), [])
    if not matches and text in overrides:
        return overrides[text]
    if not matches:
        report['excluded'].setdefault(category, set()).add(text)
        return None
    entry = next((e for e in matches if e['id'].startswith('sanctum.')), matches[0]) if category == 'relics' else matches[0]
    # Multi-line official stat entries remain one row; do not guess OR/AND semantics.
    if '\n' in entry['text']:
        report['excluded'].setdefault(category, set()).add(text)
        return None
    return {'id': entry['id'], 'text': entry['text']}

pattern_cache = {}
corpus = list(dict.fromkeys([e['text'] for g in stats for e in g['entries']] + list(overrides)))

def pattern_for(text):
    if text in pattern_cache:
        return pattern_cache[text]
    literals = re.split(r'[#\s]+', text)
    for size in range(4, max(map(len, literals), default=0) + 1):
        for literal in literals:
            for offset in range(len(literal) - size + 1):
                candidate = literal[offset:offset + size]
                if all(other == text or candidate not in other for other in corpus):
                    pattern_cache[text] = re.escape(candidate)
                    return pattern_cache[text]
    # None means the JS generator must use the full anchored template.
    pattern_cache[text] = None
    return None

def merge(rows):
    unique = {}
    for entry, affix in rows:
        if not entry:
            continue
        if entry['id'] in unique and unique[entry['id']]['affix'] != affix:
            unique[entry['id']]['affix'] = 'BOTH'
        else:
            unique.setdefault(entry['id'], {**entry, 'affix': affix})
    return [{**entry, 'pattern': pattern_for(entry['text'])} for entry in unique.values()]

def write(name, data):
    (out / (name + '.json')).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

meta = {'source': 'https://pathofexile.tw/api/trade2/data/stats', 'checkedAt': '2026-10-03'}
rows = []
for token in read('tablet')['tokens']:
    for text in token['rawText'].split('|'):
        rows.append((resolve(text, 'tablets'), 'PREFIX' if token['options']['prefix'] else 'SUFFIX'))
base_names = {e['type'] for group in items for e in group['entries'] if not e.get('name')}
tablet_types = sorted(name for name in base_names if name.endswith('碑牌'))
write('tablets', {**meta, 'types': tablet_types, 'mods': merge(rows)})
write('relics', {**meta, 'mods': merge([(resolve(t['name'], 'relics'), t['affix']) for t in read('relic')])})

# Ignore upstream categories that have no matching currently listed official base items.
base_groups = {g['name']: [name for name in g['items'] if name in base_names] for g in read('item', 'Basetypes.Item')}
classes = []
for group in read('item'):
    bases = list(dict.fromkeys(base_groups.get(group['basetype'], [])))
    if not bases or group['basetype'] in ('其它', '隱藏道具', '契約書', '藍圖', '記憶', '魚竿'):
        continue
    rows = []
    for category in group['categoryRegex']:
        for mod in category['modifiers']:
            if mod['affixtype'] not in ('PREFIX', 'SUFFIX'):
                continue
            for text in mod['desc'].split('|'):
                rows.append((resolve(text, 'items'), mod['affixtype']))
    mods = merge(rows)
    if mods:
        classes.append({'name': group['basetype'], 'bases': bases, 'mods': mods})
write('items', {**meta, 'baseSource': 'https://pathofexile.tw/api/trade2/data/items', 'classes': classes})

vendor_texts = ['增加#%移動速度', '#%火焰抗性', '#%冰冷抗性', '#%閃電抗性', '#%混沌抗性', '#%全元素抗性', '#最大生命', '#最大魔力', '#精魂', '增加#%找到的物品稀有度', '增加#%攻擊速度', '增加#%施法速度', '增加#%物理傷害', '增加#%法術傷害', '附加#至#物理傷害', '附加#至#火焰傷害', '附加#至#冰冷傷害', '附加#至#閃電傷害', '附加#至#混沌傷害', '#點力量', '#點敏捷', '#點智慧']
vendor_texts += [e['text'] for g in stats if g['id'] == 'explicit' for e in g['entries'] if '技能' in e['text'] and '等級#' in e['text'] and len(e['text']) < 22 and not any(w in e['text'] for w in ['範圍', '陷阱', '插槽'])]
write('vendor', {**meta, 'mods': merge([(resolve(t, 'vendor'), 'BOTH') for t in dict.fromkeys(vendor_texts)])})
report['excluded'] = {k: sorted(v) for k, v in report['excluded'].items()}
report['counts'] = {'tablets': len(json.loads((out/'tablets.json').read_text())['mods']), 'relics': len(json.loads((out/'relics.json').read_text())['mods']), 'itemClasses': len(classes), 'itemStats': sum(len(g['mods']) for g in classes)}
write('audit', report)
print(json.dumps(report['counts'], ensure_ascii=False))

# Numeric contexts must be regenerated whenever the selected stat corpus changes.
subprocess.run([sys.executable, str(root / 'scripts/build-poe2-numeric-templates.py'), str(stats_file)], check=True)
