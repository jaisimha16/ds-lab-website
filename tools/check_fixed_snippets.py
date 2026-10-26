"""Local check: run the corrected ("Load Runnable Version") snippets from
assets/js/learn.js to prove they execute.
Usage:  python tools/_run_fixed.py
"""
import json, os, re, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
learn = open(os.path.join(ROOT, 'assets', 'js', 'learn.js'), encoding='utf-8').read()

# pull the fixedCode object out of the file without a JS engine
start = learn.index('LAB_LEARN.fixedCode = {')
body = learn[start:]
body = body[body.index('{') + 1: body.rindex('}')]

fixed = {}
for m in re.finditer(r'"([0-9]+-[A-Z])":\s*\[(.*?)\]\.join\("\\n"\)', body, re.S):
    key = m.group(1)
    lines = re.findall(r'"((?:[^"\\]|\\.)*)"', m.group(2))
    fixed[key] = '\n'.join(json.loads('"%s"' % l) for l in lines)

print('fixed snippets found:', ', '.join(sorted(fixed)))

bad = []
for key, code in sorted(fixed.items()):
    tmp = tempfile.mkdtemp(prefix='fix_')
    src = os.path.join(ROOT, 'assets', 'data', 'car_dataset_40x20.csv')
    if os.path.exists(src):
        shutil.copy(src, tmp)
    with open(os.path.join(tmp, 'code.py'), 'w', encoding='utf-8') as f:
        f.write(code)
    try:
        p = subprocess.run([sys.executable, 'code.py'], cwd=tmp, capture_output=True,
                           text=True, timeout=60)
        status = 'OK' if p.returncode == 0 else 'FAIL: ' + \
            (p.stderr.strip().splitlines() or ['?'])[-1][:120]
    except subprocess.TimeoutExpired:
        status = 'TIMEOUT'
    except Exception as e:
        status = str(e)[:120]
    if not status.startswith('OK'):
        bad.append((key, status))
    print('  %-6s %s' % (key, status))
    shutil.rmtree(tmp, ignore_errors=True)

print('\nall fixed snippets run cleanly' if not bad else '\n%d snippet(s) still fail' % len(bad))
