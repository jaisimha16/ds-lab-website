"""Local check: run every stored experiment snippet with the real interpreter
to find out which ones execute cleanly and which have syntax/data problems.
Usage:  python tools/_run_sections.py
"""
import json, os, shutil, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sections = json.load(open(os.path.join(ROOT, 'tools', '_sections.json'), encoding='utf-8'))

ok, bad = [], []
for s in sections:
    tmp = tempfile.mkdtemp(prefix='exp_')
    # stage the dataset used by the experiments
    src = os.path.join(ROOT, 'assets', 'data', 'car_dataset_40x20.csv')
    if os.path.exists(src):
        shutil.copy(src, tmp)
    with open(os.path.join(tmp, 'code.py'), 'w', encoding='utf-8') as f:
        f.write(s['code'])
    try:
        p = subprocess.run([sys.executable, 'code.py'], cwd=tmp, capture_output=True,
                           text=True, timeout=60)
        if p.returncode == 0:
            ok.append((s['id'], s['letter']))
        else:
            last = (p.stderr.strip().splitlines() or ['?'])[-1]
            bad.append((s['id'], s['letter'], last[:120]))
    except subprocess.TimeoutExpired:
        bad.append((s['id'], s['letter'], 'TIMEOUT > 60s'))
    except Exception as e:
        bad.append((s['id'], s['letter'], str(e)[:120]))
    finally:
        shutil.rmtree(tmp, ignore_errors=True)

print('executed cleanly: %d / %d' % (len(ok), len(sections)))
print('clean:', ', '.join('%s-%s' % (a, b) for a, b in ok))
print('\nfailed:')
for i, l, e in bad:
    print('  %s-%s : %s' % (i, l, e))
