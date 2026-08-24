/**
 * Progressive enhancement, and nothing else.
 *
 * The page is complete before this file runs. Everything here is an improvement
 * on a page that already works: sorting a table that is already in a sensible
 * order, remembering a theme that already has a default, spinning a viewer that
 * already shows a still. If a feature only works once this has run, it is in the
 * wrong file -- move it into the renderer.
 *
 * Emitted inline at the end of `<body>`, so there is no second request and no
 * flash of an unsorted table. It is a string rather than a module because the
 * whole page is one file; keeping it typed here and shipping it as text is the
 * trade that buys type-checking without a bundler.
 */
export const CLIENT = `(function(){
"use strict";

/* ------------------------------------------------------------------ theme */
/* The pre-paint script in <head> has already applied the stored theme. This only
   handles changes, so there is no flash to avoid here. */
var root=document.documentElement;
function setTheme(t){
  try{ t==="auto" ? localStorage.removeItem("uxTheme") : localStorage.setItem("uxTheme",t); }catch(e){}
  root.setAttribute("data-theme", t==="auto" ? (matchMedia("(prefers-color-scheme:dark)").matches?"solarized":"light") : t);
  document.querySelectorAll("[data-theme-set]").forEach(function(b){
    b.setAttribute("aria-pressed", String(b.getAttribute("data-theme-set")===t));
  });
}
document.querySelectorAll("[data-theme-set]").forEach(function(b){
  b.addEventListener("click",function(){ setTheme(b.getAttribute("data-theme-set")); });
});

/* ------------------------------------------------------------------ sort */
/* Sorting a grouped table means the rotated label spans are wrong afterwards, so
   they are re-cut from each row's data-g rather than read back out of the cells
   about to be destroyed. Subtotal rows carry no data-g and are lifted out first:
   arithmetic on a block must not be shuffled in among rows of another block. */
function cellKey(tr,i){
  var td=tr.children[i];
  if(!td) return "";
  var v=td.getAttribute("data-s");
  if(v!==null) return v;
  var t=(td.textContent||"").trim().replace(/[$,%\\s]/g,"");
  var n=parseFloat(t);
  return isNaN(n) ? (td.textContent||"").trim().toLowerCase() : n;
}
function recutSpans(tbody){
  var trs=[].slice.call(tbody.rows);
  var i=0;
  while(i<trs.length){
    var g=trs[i].getAttribute("data-g");
    if(g===null){ i++; continue; }
    var n=1;
    while(i+n<trs.length && trs[i+n].getAttribute("data-g")===g) n++;
    for(var j=i;j<i+n;j++){
      var cell=trs[j].querySelector("td.rot");
      if(!cell) continue;
      if(j===i){ trs[j].classList.remove("rep"); cell.rowSpan=n; cell.style.display=""; }
      else { trs[j].classList.add("rep"); cell.rowSpan=1; }
    }
    i+=n;
  }
}
document.querySelectorAll("table.sortable").forEach(function(tbl){
  var tbody=tbl.tBodies[0];
  if(!tbody) return;
  var isGrouped=tbl.classList.contains("grouped");
  tbl.querySelectorAll("thead th.s").forEach(function(th){
    var col=[].indexOf.call(th.parentNode.children,th);
    th.tabIndex=0;
    th.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){e.preventDefault();th.click();} });
    th.addEventListener("click",function(){
      var dir=th.getAttribute("data-dir")==="asc"?"desc":"asc";
      tbl.querySelectorAll("thead th").forEach(function(o){o.removeAttribute("data-dir");});
      th.setAttribute("data-dir",dir);
      var rows=[].slice.call(tbody.rows);
      var subs=rows.filter(function(r){return r.classList.contains("sub")||r.classList.contains("tot");});
      var body=rows.filter(function(r){return subs.indexOf(r)<0;});
      // In a grouped table the first row of each block carries an extra leading
      // td.rot and its members do not, so the data column sits at a different
      // index depending on the row. Header indices always include the rail.
      function at(tr){ return col - (isGrouped && !tr.querySelector("td.rot") ? 1 : 0); }
      body.sort(function(a,b){
        var av=cellKey(a,at(a));
        var bv=cellKey(b,at(b));
        if(av<bv) return dir==="asc"?-1:1;
        if(av>bv) return dir==="asc"?1:-1;
        return 0;
      });
      body.forEach(function(r){tbody.appendChild(r);});
      subs.forEach(function(r){tbody.appendChild(r);});
          if(isGrouped) recutSpans(tbody);
    });
  });
});

/* --------------------------------------------------------- light dismiss */
/* <details> gives the menus their semantics, their keyboard handling and their
   JS-off behaviour, and then withholds exactly one thing: it will not close
   when you click past it. Without this a menu opened on the way somewhere else
   stays open over the page until you come back and click its own summary.
   The element is still the source of truth -- this only closes what is open, so
   with the script blocked every menu still opens and closes on its summary. */
function closeMenus(except){
  document.querySelectorAll("details.menu[open]").forEach(function(d){
    if(d!==except) d.removeAttribute("open");
  });
}
document.addEventListener("click",function(e){
  var t=e.target;
  var m=t && t.closest ? t.closest("details.menu") : null;
  /* Only the summary keeps its own menu open -- it is the toggle, and closing it
     here would fight the browser's own toggle. Anything else inside the panel is
     an action, and an action that has been taken should not leave its menu
     standing over the page: picking a theme or following a section link closes
     it, exactly as clicking past it does. */
  closeMenus(m && t.closest("details.menu > summary") ? m : null);
},true);
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape") return;
  var open=document.querySelector("details.menu[open]");
  if(!open) return;
  closeMenus(null);
  var sm=open.querySelector("summary");
  if(sm) sm.focus();
});
/* A checkbox popover has the same problem and the opposite fix: it carries its
   own full-viewport scrim label, so the outside click is a real click on a real
   element and it works with no script at all. Menus cannot use that trick,
   because there is no checkbox to untick. */
document.addEventListener("click",function(e){
  var t=e.target;
  if(!t || !t.closest) return;
  if(t.closest(".tip")) return;
  document.querySelectorAll(".tip > input:checked").forEach(function(i){
    i.checked=false;
  });
},true);

/* ------------------------------------------------------------ heat sizing */
/* Plus and minus scale the band; the magnifying glass writes the current step
   to localStorage so the next load opens there. The SVG is scaled through its
   width/height attributes and keeps its viewBox, so the cells stay square and
   the pitch stays even -- re-drawing the band at a new cell size would be the
   same picture and a great deal more code. Storage is wrapped because a browser
   with cookies off throws on access, and a heat band is not worth an exception
   that stops every script under it. */
var HEAT_STEPS=[.7,.85,1,1.25,1.6,2];
var heatGet=function(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } };
var heatSet=function(k,v){ try{ localStorage.setItem(k,v); }catch(e){} };
document.querySelectorAll(".heat-box").forEach(function(box){
  var svg=box.querySelector("svg.heat");
  var vb=svg&&svg.getAttribute("viewBox");
  if(!svg||!vb) return;
  var p=vb.split(" "), W=parseFloat(p[2]), H=parseFloat(p[3]);
  var key="uxspec.heat."+(box.getAttribute("data-heat")||"band");
  var i=HEAT_STEPS.indexOf(parseFloat(heatGet(key)||"1"));
  if(i<0) i=HEAT_STEPS.indexOf(1);
  var btn=function(a){ return box.querySelector('[data-a="'+a+'"]'); };
  var apply=function(){
    svg.setAttribute("width",String(Math.round(W*HEAT_STEPS[i])));
    svg.setAttribute("height",String(Math.round(H*HEAT_STEPS[i])));
    btn("inc").disabled=i>=HEAT_STEPS.length-1;
    btn("dec").disabled=i<=0;
  };
  var step=function(d){ return function(){
    i=Math.min(HEAT_STEPS.length-1,Math.max(0,i+d)); apply();
    btn("save").classList.remove("kept");
  };};
  btn("inc").addEventListener("click",step(1));
  btn("dec").addEventListener("click",step(-1));
  btn("save").addEventListener("click",function(){
    heatSet(key,String(HEAT_STEPS[i]));
    btn("save").classList.add("kept");
  });
  box.classList.add("live");
  apply();
});

/* ------------------------------------------------- sideways scroll affordance */
/* A table wider than its box is the one overflow a reader can miss entirely:
   nothing is clipped visibly, the last column simply is not there. The circle
   carries a chevron and appears only while there is more table to the right,
   which makes it a statement about this table at this width rather than a
   decoration. Measured on scroll and on resize, because a column can come back
   into range without anyone touching the scroller. */
document.querySelectorAll(".scroll-wrap").forEach(function(w){
  var el=w.querySelector(".scroll");
  if(!el) return;
  var upd=function(){
    w.classList.toggle("more", el.scrollWidth-el.clientWidth-el.scrollLeft>2);
  };
  el.addEventListener("scroll",upd,{passive:true});
  addEventListener("resize",upd);
  upd();
});

/* ----------------------------------------------------- inspector and editor */
/* Two modals and a picker. The panels are already rendered, one per row and all
   hidden, so opening a row is a matter of deciding which one is not hidden --
   no client-side templating, no second set of escaping rules. */
var rowDlg=document.getElementById("row-dialog");
var edDlg=document.getElementById("edit-dialog");
var openRow=function(i){
  if(!rowDlg) return;
  rowDlg.querySelectorAll(".rp").forEach(function(p){
    p.hidden = p.getAttribute("data-row")!==String(i);
  });
  if(rowDlg.showModal && !rowDlg.open) rowDlg.showModal();
};
document.querySelectorAll("tr.clickable[data-row]").forEach(function(tr){
  var go=function(){ openRow(tr.getAttribute("data-row")); };
  tr.addEventListener("click",go);
  /* The row is reachable by keyboard, so it answers to the keys a control
     answers to. A tabindex without Enter is a focus ring that does nothing. */
  tr.addEventListener("keydown",function(e){
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); go(); }
  });
});

/* The picker. A button, a panel of buttons, and a hidden input holding the
   value -- so everything downstream still reads .value and hears change. */
var closePickers=function(){
  document.querySelectorAll(".pk.open").forEach(function(o){
    o.classList.remove("open");
    var b=o.querySelector(".pkb");
    if(b) b.setAttribute("aria-expanded","false");
  });
};
document.querySelectorAll(".pk").forEach(function(pk){
  var input=document.getElementById(pk.getAttribute("data-for"));
  var btn=pk.querySelector(".pkb"), val=pk.querySelector(".pv");
  var list=pk.querySelector(".pkl");
  if(!input||!btn||!val||!list) return;
  btn.addEventListener("click",function(e){
    e.stopPropagation();
    var was=pk.classList.contains("open");
    closePickers();
    if(was) return;
    pk.classList.add("open");
    btn.setAttribute("aria-expanded","true");
    var on=list.querySelector("button.on");
    if(on&&on.scrollIntoView) on.scrollIntoView({block:"nearest"});
  });
  list.querySelectorAll("button").forEach(function(b){
    b.addEventListener("click",function(e){
      e.stopPropagation();
      input.value=b.textContent;
      val.textContent=b.textContent;
      list.querySelectorAll("button").forEach(function(o){
        var on=o===b;
        o.className=on?"on":"";
        o.setAttribute("aria-selected",on?"true":"false");
      });
      closePickers();
      input.dispatchEvent(new Event("change"));
    });
  });
});
/* Anywhere else is a dismissal, and Escape is taken before the dialog sees it:
   the open list is the nearest overlay, and closing the whole panel would throw
   away a choice the reader was in the middle of making. */
document.addEventListener("click",closePickers);
document.addEventListener("keydown",function(e){
  if(e.key!=="Escape") return;
  if(!document.querySelector(".pk.open")) return;
  e.preventDefault(); e.stopPropagation(); closePickers();
},true);

/* The patch line. Readonly, and rewritten on every change, because the dialog
   is a decision -- the thing it produces is a line for the source, not a write. */
var edWhat=document.getElementById("ed-what");
var edPatch=document.getElementById("ed-patch");
var edGroup=document.getElementById("ed-group");
var edKind=document.getElementById("ed-kind");
var edFor="";
var edLine=function(){
  if(!edPatch) return;
  edPatch.value='{ payee: "'+edFor+'", group: "'+(edGroup?edGroup.value:"")+
    '", kind: "'+(edKind?edKind.value:"")+'" },';
};
if(edGroup) edGroup.addEventListener("change",edLine);
if(edKind) edKind.addEventListener("change",edLine);
document.querySelectorAll("[data-edit]").forEach(function(b){
  b.addEventListener("click",function(){
    var panel=b.closest(".rp");
    var h=panel&&panel.querySelector("h4");
    edFor=h?h.textContent:"";
    if(edWhat) edWhat.textContent=edFor;
    edLine();
    if(rowDlg&&rowDlg.open) rowDlg.close();
    if(edDlg&&edDlg.showModal) edDlg.showModal();
  });
});
var edClear=document.getElementById("ed-clear");
if(edClear) edClear.addEventListener("click",function(){
  if(edPatch) edPatch.value="";
});
var edSave=document.getElementById("ed-save");
if(edSave) edSave.addEventListener("click",function(){ if(edDlg) edDlg.close(); });

/* ------------------------------------------------------------- copy code */
document.querySelectorAll("pre.code").forEach(function(pre){
  pre.addEventListener("dblclick",function(){
    var r=document.createRange(); r.selectNodeContents(pre);
    var s=getSelection(); if(!s) return; s.removeAllRanges(); s.addRange(r);
  });
});
})();`;
