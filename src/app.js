(function(){
'use strict';
var $=function(s){return document.querySelector(s)},root=document.documentElement;
var theme=$('#th');
function label(){if(!theme)return;var dark=root.dataset.theme==='dark';theme.setAttribute('aria-label',dark?'Switch to light mode':'Switch to dark mode');theme.textContent=dark?'☀':'☾';}
if(theme){label();theme.onclick=function(){root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('vt',root.dataset.theme)}catch(e){}label();};}
var button=$('.menu'),nav=$('#nav');
function menu(open){if(!button||!nav)return;nav.classList.toggle('o',open);button.setAttribute('aria-expanded',String(open));button.textContent=open?'Close':'Menu';}
if(button&&nav){button.onclick=function(){menu(!nav.classList.contains('o'));};nav.addEventListener('click',function(e){if(e.target.closest('a'))menu(false);});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('o')){menu(false);button.focus();}});document.addEventListener('click',function(e){if(!e.target.closest('header'))menu(false);});}
var reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
// Sections remain visible without JavaScript; only short, one-time text reveals are enhanced.
if(!reduced&&'IntersectionObserver' in window){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(!entry.isIntersecting)return;if(entry.target.animate)entry.target.animate([{opacity:.65,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:650,easing:'ease-out'});observer.unobserve(entry.target);});},{threshold:.15});document.querySelectorAll('.section-heading,.intro-layout,.identity-copy,.process-flow li').forEach(function(el){observer.observe(el);});}
var head=$('header'),queued=false;
function scroll(){if(head)head.classList.toggle('sc',scrollY>10);queued=false;}
addEventListener('scroll',function(){if(!queued){queued=true;requestAnimationFrame(scroll);}},{passive:true});addEventListener('resize',function(){if(innerWidth>1180)menu(false);scroll();});scroll();
})();
