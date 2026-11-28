// Pubblica la cartella out/ su Cloudflare Pages (progetto "ceo-autopilot").
// I file viaggiano dentro il worker del progetto: basta un token con permesso Pages.
// Uso: npm run build && CLOUDFLARE_ACCOUNT_ID=... CLOUDFLARE_API_TOKEN=... node scripts/deploy-pages.mjs
import fs from 'node:fs'; import path from 'node:path';
const A=process.env.CLOUDFLARE_ACCOUNT_ID, API=`https://api.cloudflare.com/client/v4/accounts/${A}`, NAME='ceo-autopilot';
const H={Authorization:`Bearer ${process.env.CLOUDFLARE_API_TOKEN}`};
const j=async(r)=>{const t=await r.text();try{return JSON.parse(t)}catch{return {raw:t.slice(0,300),status:r.status}}};
const api=(p,o={})=>fetch(API+p,{...o,headers:{...H,...(o.headers||{})}}).then(j);
const root='out';const files=[];(function walk(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f);fs.statSync(p).isDirectory()?walk(p):files.push(p)}})(root);
const fd=new FormData();const imports=[],map=[];
files.forEach((f,i)=>{const key=path.relative(root,f).split(path.sep).join('/');const mod=`a/${i}.bin`;
  fd.append(mod,new Blob([fs.readFileSync(f)],{type:'application/octet-stream'}),mod);
  imports.push(`import f${i} from './${mod}';`);map.push(`${JSON.stringify(key)}:f${i}`)});
const worker=`${imports.join('\n')}
const FILES={${map.join(',')}};
const TYPES={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8',json:'application/json',png:'image/png',svg:'image/svg+xml',woff2:'font/woff2',woff:'font/woff',webmanifest:'application/manifest+json',txt:'text/plain; charset=utf-8',ico:'image/x-icon'};
const head=(k)=>{const ext=k.split('.').pop().toLowerCase();return {'content-type':TYPES[ext]||'application/octet-stream','cache-control':k.startsWith('_next/static/')?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate','x-robots-tag':'noindex, nofollow','x-content-type-options':'nosniff'}};
export default { async fetch(req) {
  const url=new URL(req.url); const p=decodeURIComponent(url.pathname).replace(/^\\/+/,'').replace(/\\/+$/,'');
  const tries = p==='' ? ['index.html'] : /\\.[a-z0-9]+$/i.test(p) ? [p] : [p+'.html', p+'/index.html'];
  for (const k of tries) if (FILES[k]) return new Response(FILES[k],{headers:head(k)});
  return new Response(FILES['404.html']||'Non trovato',{status:404,headers:head('404.html')});
}};`;
fd.append('metadata',JSON.stringify({main_module:'worker.js'}));
fd.append('worker.js',new Blob([worker],{type:'application/javascript+module'}),'worker.js');
// Il bundle del worker viaggia dentro la richiesta di deployment di Pages.
const res=new Response(fd);const bundle=new Blob([await res.arrayBuffer()],{type:res.headers.get('content-type')});
console.log('bundle MB',(bundle.size/1e6).toFixed(2));
const dep=new FormData();dep.append('manifest','{}');dep.append('branch','main');dep.append('_worker.bundle',bundle,'_worker.bundle');
const up=await api(`/pages/projects/${NAME}/deployments`,{method:'POST',body:dep});
console.log('deploy',up.success,JSON.stringify(up.errors??up).slice(0,400));
if(up.success)console.log('URL',up.result.url,up.result.aliases,up.result.latest_stage);
