'use strict';
/* Reproducible review export of the single live library; never loaded by the app. */
const fs=require('node:fs'),path=require('node:path'),I=require('../../assets/memento-illustrative-icons.js');
const controls=I.available.filter(key=>I.svg(key).includes('--control'));
const illustrations=I.available.filter(key=>!controls.includes(key));
const width=1440,cols=6,cell=224,row=154;
let output=[],y=118;
function section(title,keys){
 output.push(`<text x="36" y="${y}" fill="#c4d3bd" font-size="18">${title}</text>`);y+=20;
 keys.forEach((key,i)=>{
  const x=36+(i%cols)*cell,top=y+Math.floor(i/cols)*row;
  output.push(`<g transform="translate(${x} ${top})"><rect width="210" height="140" rx="12" fill="#173c2b" stroke="#456650"/>`);
  output.push(I.svg(key).replace('<svg ', '<svg x="73" y="5" width="64" height="64" '));
  output.push(`<text x="105" y="88" text-anchor="middle" fill="#eceddd" font-size="12">${key}</text>`);
  let x2=28;
  for(const size of [24,32,48]){output.push(I.svg(key).replace('<svg ',`<svg x="${x2}" y="${134-size}" width="${size}" height="${size}" `));x2+=size+19;}
  output.push('</g>');
 });y+=Math.ceil(keys.length/cols)*row+28;
}
section('Illustraties · hout, salie, perkament en messing · 64 / 24 / 32 / 48 px',illustrations);
section('Bedieningssymbolen · één inktkleur · 64 / 24 / 32 / 48 px',controls);
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${y+28}" viewBox="0 0 ${width} ${y+28}" style="color:#e8dfc6;font-family:system-ui,sans-serif"><rect width="100%" height="100%" fill="#0b2118"/><text x="36" y="52" fill="#f3eedc" font-family="Georgia,serif" font-size="34">Memento · illustratief &amp; sfeervol</text><text x="36" y="80" fill="#9db5a0" font-size="14">27 oktober 2026 · 66 SVG-ontwerpen · licht van linksboven · transparante pictogrammen · namen buiten de beelden</text>${output.join('')}</svg>`;
fs.writeFileSync(path.resolve(__dirname,'../../docs/icon-sticker-sheet.svg'),svg);
