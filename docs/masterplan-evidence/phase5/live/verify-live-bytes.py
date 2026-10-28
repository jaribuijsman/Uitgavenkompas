import concurrent.futures,datetime,hashlib,json,re,subprocess,sys,urllib.request
sha=sys.argv[1]; out=sys.argv[2]
base='https://jaribuijsman.github.io/Uitgavenkompas/'
sw=subprocess.check_output(['git','show',sha+':sw.js']).decode()
core=json.loads(re.search(r'const CORE = (\[.*?\]);',sw).group(1))
paths=sorted(set([p.split('?')[0].removeprefix('./') or 'index.html' for p in core]+['sw.js']))
def check(p):
 expected=subprocess.check_output(['git','show',sha+':'+p])
 with urllib.request.urlopen(base+p+'?verify='+sha,timeout=30) as response:
  actual=response.read(); status=response.status
 return {'path':p,'status':status,'bytes':len(actual),'sha256':hashlib.sha256(actual).hexdigest(),'matchesCommit':actual==expected}
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: checks=list(pool.map(check,paths))
report={'commit':sha,'url':base,'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'checks':checks,'passed':all(c['matchesCommit'] and c['status']==200 for c in checks)}
with open(out,'w') as f: json.dump(report,f,indent=2)
print(json.dumps({'commit':sha,'checkedFiles':len(checks),'passed':report['passed'],'failed':[c['path'] for c in checks if not c['matchesCommit']]}))
if not report['passed']:sys.exit(1)
