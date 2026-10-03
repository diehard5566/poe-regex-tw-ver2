"""Build short numeric contexts. Usage: python3 scripts/build-poe2-numeric-templates.py STATS_JSON
Keeps every # in order. Crops only outer literals, checking all official stat lines.
No network access, translation, numeric assumptions, or upstream regex copying.
"""
import json
import re
import sys
from pathlib import Path

folder = Path(__file__).resolve().parents[1] / 'client/src/data/poe2'
mods = []
for name in ('waystones', 'tablets', 'relics', 'vendor', 'items'):
    data = json.loads((folder / f'{name}.json').read_text())
    mods += data.get('mods', [mod for group in data.get('classes', []) for mod in group['mods']])
texts = {mod['text'].split('\n')[0] for mod in mods if '#' in mod['text'].split('\n')[0]}
# Fixed numbers in unique stats can collide with rolled # values too.
normalize = lambda text: re.sub(r'[-+]?\d+(?:\.\d+)?', '#', re.sub(r'\s+', '', text))
stats = json.loads(Path(sys.argv[1]).read_text())
corpus = {normalize(line) for group in stats['result'] for entry in group['entries'] for line in entry['text'].split('\n')}
corpus.update(map(normalize, texts))

def template_for(text):
    first, last = text.index('#'), text.rindex('#')
    candidates = []
    for start in range(first + 1):
        for end in range(last + 1, len(text) + 1):
            fragment = text[start:end]
            # A number needs a literal or a line boundary on each side.
            for left in ('', '^') if start == 0 else ('',):
                for right in ('', '$') if end == len(text) else ('',):
                    if (fragment.startswith('#') and not left) or (fragment.endswith('#') and not right):
                        continue
                    candidates.append((left + fragment + right, normalize(fragment), left, right))
    others = corpus - {normalize(text)}
    for template, fragment, left, right in sorted(candidates, key=lambda entry: (len(entry[0]), entry[0])):
        def matches(other):
            if left and right:
                return other == fragment
            if left:
                return other.startswith(fragment)
            if right:
                return other.endswith(fragment)
            return fragment in other
        if not any(map(matches, others)):
            return template
    return '^' + text + '$'

templates = {text: template_for(text) for text in sorted(texts)}
(folder / 'numeric-templates.json').write_text(json.dumps(templates, ensure_ascii=False, indent=2) + '\n')
print(f'Checked {len(templates)} numeric templates against {len(corpus)} distinct official stat lines.')
print('Movement speed:', templates.get('增加#%移動速度'))
