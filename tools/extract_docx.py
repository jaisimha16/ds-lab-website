"""Extract text from a .docx file (no third-party deps)."""
import sys, zipfile
from xml.etree import ElementTree as ET

def extract(docx_path):
    z = zipfile.ZipFile(docx_path)
    xml = z.read('word/document.xml')
    tree = ET.fromstring(xml)
    NS = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
    out = []
    for para in tree.iter(NS + 'p'):
        runs = [r.text or '' for r in para.iter(NS + 't')]
        text = ''.join(runs)
        if text.strip():
            out.append(text)
    return '\n'.join(out)

if __name__ == '__main__':
    for p in sys.argv[1:]:
        print('=' * 80)
        print('FILE:', p)
        print('=' * 80)
        print(extract(p))
