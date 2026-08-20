const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || 'archive/internal-budget-execution-create-20260820-mobile-try.html');
const source = fs.readFileSync(target, 'utf8');
const match = source.match(/const pages=(\{.*?\});\s*const frame=/s);

if (!match) {
  throw new Error('pages 数据不存在，停止生成。');
}

const pages = JSON.parse(match[1]);
for (const page of ['home', 'create', 'detail']) {
  if (!pages[page]) throw new Error(`缺少 ${page} 页面。`);
  const html = Buffer.from(pages[page], 'base64').toString('utf8');
  if (!html.includes('<html')) throw new Error(`${page} 页面解码失败。`);
}

const output = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <title>内部予算執行モバイルプロトタイプ</title>
  <style>
    *{box-sizing:border-box}
    html,body{width:100%;height:100%;margin:0;overflow:hidden;background:#e9e9ed}
    iframe{display:block;width:100%;height:100%;border:0;background:#fff}
  </style>
</head>
<body>
  <iframe id="prototype" title="内部予算執行モバイルプロトタイプ"></iframe>
  <script>
    const pages=${JSON.stringify(pages)};
    const frame=document.getElementById('prototype');
    function validPage(value){return Object.prototype.hasOwnProperty.call(pages,value)?value:'home'}
    function pageFromHash(){return validPage(location.hash.slice(1))}
    function showPage(page){
      const target=validPage(page);
      frame.src='data:text/html;charset=utf-8;base64,'+pages[target];
      if(location.hash!=='#'+target)history.replaceState(null,'','#'+target);
    }
    addEventListener('message',event=>{
      if(event.source===frame.contentWindow&&event.data&&event.data.type==='navigate')showPage(event.data.page);
    });
    addEventListener('hashchange',()=>showPage(pageFromHash()));
    showPage(pageFromHash());
  <\/script>
</body>
</html>
`;

fs.writeFileSync(target, output, 'utf8');
console.log(`已生成: ${target}`);

