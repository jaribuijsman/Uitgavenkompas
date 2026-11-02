from pathlib import Path
import re,json,hashlib,urllib.request,subprocess,datetime,os
site='https://jaribuijsman.github.io/Uitgavenkompas/'
def fetch(url):
 req=urllib.request.Request(url,headers={'User-Agent':'Memento-release-verification/1.0','Cache-Control':'no-cache'})
 with urllib.request.urlopen(req,timeout=30) as r:return r.status,r.read()
root=Path.cwd();html=(root/'index.html').read_bytes();worker=(root/'sw.js').read_bytes();status,live=fetch(site);assert status==200 and live==html,'Served index does not match reviewed app'
swstatus,livesw=fetch(site+'sw.js');assert swstatus==200 and livesw==worker,'Served worker does not match reviewed app'
assets=['memento-layout.css','memento-knowledge.css','memento-base-app.css','memento-ui.css','memento-life-app.js','memento-life-presentation.js','memento-finance-app.js','memento-finance-presentation.js'];records=[]
for name in assets:
 match=re.search(r'\./assets/'+re.escape(name)+r'\?v=[\w.-]+',html.decode());assert match,name
 url=site+match[0][2:];code,body=fetch(url);expected=(root/'assets'/name).read_bytes();assert code==200 and body==expected,name+' served bytes differ'
 records.append({'asset':name,'url':url,'status':code,'sha256':hashlib.sha256(body).hexdigest()})
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'repository_head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'site':site,'html_sha256':hashlib.sha256(live).hexdigest(),'worker_sha256':hashlib.sha256(livesw).hexdigest(),'cache':re.search(r'^const CACHE = "([^"]+)"',worker.decode())[1],'assets':records,'all_bytes_equal':True,'installed_A54_activation':'NIET GEVERIFIEERD'}
Path(os.environ.get('MEMENTO_LIVE_EVIDENCE_OUT','/tmp/memento-live-assets.json')).write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({'status':'PASS','cache':report['cache'],'verified_assets':len(records),'repository_head':report['repository_head']}))
