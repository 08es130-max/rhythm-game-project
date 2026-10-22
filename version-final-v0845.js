// Final version and home layout correction v0.8.319
(function(){
'use strict';
const VERSION='0.8.319';
window.APP_VERSION=VERSION;
const style=document.createElement('style');
style.id='home-layout-fix-v08316';
style.textContent=`
#homeScreen .home-header-actions{position:fixed!important;right:12px!important;top:7px!important;display:flex!important;align-items:center!important;gap:8px!important;z-index:9999!important;width:max-content!important;max-width:calc(100vw - 24px)!important;pointer-events:auto!important}
#homeScreen #updateBanner{position:static!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;min-width:0!important;max-width:none!important;height:32px!important;min-height:0!important;margin:0!important;padding:0 12px!important;overflow:hidden!important;border-radius:999px!important;flex:0 0 auto!important;transform:none!important;box-sizing:border-box!important}
#homeScreen #updateBanner .update-head{display:flex!important;margin:0!important;font-size:12px!important;line-height:1!important}
#homeScreen #updateBanner .update-head>*,
#homeScreen #updateBanner .update-text{display:none!important}
#homeScreen #updateBanner .update-head::after{content:"お知らせ";display:block!important;white-space:nowrap}
#homeScreen .home-header-actions .home-version{position:static!important;margin:0!important;flex:none!important}
@media(orientation:landscape) and (pointer:coarse){#homeScreen .home-menu{transform:translateY(40px)!important}}
`;
style.textContent += `\n@media(orientation:landscape) and (pointer:coarse){#homeScreen .home-menu{transform:translateY(0px)!important}#homeScreen .home-menu>.home-menu-btn:nth-child(n+4){transform:translateY(-20px)!important}}
`;
document.head.appendChild(style);
function sync(){
 document.querySelectorAll('.home-version,.version-badge').forEach(el=>{el.textContent='Ver. '+VERSION;});
 const banner=document.getElementById('updateBanner');
 const actions=document.querySelector('#homeScreen .home-header-actions');
 if(banner&&actions&&banner.parentElement!==actions)actions.prepend(banner);
 const text=document.querySelector('#updateBanner .update-text');
 if(text)text.textContent='ホームのお知らせとメニューボタンの配置を修正しました。';
 const head=document.querySelector('#updateBanner .update-head span:last-child');
 if(head)head.textContent='Ver.'+VERSION+' アップデート';
}
sync();requestAnimationFrame(sync);setTimeout(sync,100);setTimeout(sync,500);
})();