// ==UserScript==
// @name           MathJax in Wikipedia
// @namespace      http://www.mathjax.org/
// @description    Insert MathJax into Wikipedia pages
// @include        https://*.wikipedia.org/wiki/*
// ==/UserScript==

// replace the images with MathJax scripts of type math/tex
if (window.MathJax) throw "MathJax already loaded!";
var imgs = document.querySelectorAll('.mwe-math-fallback-image-inline');
if (!imgs.length) throw "no matches!";
imgs.forEach((img) => {
  var script = document.createElement("script");
  script.type = 'math/tex';
  script[window.opera ? 'innerHTML' : 'text'] = img.alt;
  img.parentNode.replaceChild(script, img);
});
// Load MathJax and have it process the page
var script = document.createElement('script');
script.type = 'text/javascript';
script.src = 'https://cdn.mathjax.org/mathjax/2.7-latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML-full';
document.querySelector('head').appendChild(script);

// https://en.wikipedia.org/wiki/List_of_mathematical_symbols_by_subject
JSON.stringify(
    Array.from(document.querySelectorAll('table'))
    .map((tbl) => {
      let trs = Array.from(tbl.children[0].children);
      let headers = Array.from(trs[0].children).map(x=>x.innerText)
      let rows = trs.splice(1).map(x=>Array.from(x.children));
      let indices = rows.map(x=>0);
      let objs = rows.map(x=>({}));
      for (i=0; i<headers.length;i++) {
        for (j=0; j<rows.length;j++) {
          let e = rows[j][i-indices[j]];
          let mj = e.querySelector('mrow');
          let v = mj ? mj.textContent : e.innerText.trim();
          let span = Number(e.getAttribute('rowspan')) || 1;
          for (k=j;k<Math.min(j+span, rows.length);k++) {
            objs[k][headers[i]] = v;
            if(k>j) indices[k]++;
          }
          j+= span-1;
        }
      }
      return objs;
    })
    .reduce((a,b)=>a.concat(b),[])
    .map(o => [o.Symbol, o.LaTeX, JSON.stringify(o)])
)
