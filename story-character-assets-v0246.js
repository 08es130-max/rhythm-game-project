// Ver.0.8.249: uploaded PNG 8-frame story sprite registry for 12 Nijigasaki members.
(function(){
'use strict';
const api=window.LOVEFES_STORY_VISUALS;
if(!api?.registerCharacterSet)return;
const BASE='assets/story/sprites';
const EXPRESSIONS=['default','smile','shy','surprised','worried','angry','crying','wink'];
const MEMBERS=[
 ['歩夢','ayumu',['上原歩夢']],['かすみ','kasumi',['中須かすみ']],['しずく','shizuku',['桜坂しずく']],
 ['果林','karin',['朝香果林']],['愛','ai',['宮下愛']],['彼方','kanata',['近江彼方']],
 ['せつ菜','setsuna',['優木せつ菜','中川菜々','菜々']],['エマ','emma',['エマ・ヴェルデ']],
 ['璃奈','rina',['天王寺璃奈']],['栞子','shioriko',['三船栞子']],['ミア','mia',['ミア・テイラー']],
 ['ランジュ','lanzhu',['鐘嵐珠','嵐珠']]
];
function register(key,slug,aliases){
 const src=`${BASE}/${slug}.png?v=${window.APP_VERSION||'0.8.249'}`;
 const map=Object.fromEntries(EXPRESSIONS.map((e,i)=>[e,{src,frame:i}]));
 api.registerCharacterSet(key,map);
 aliases.forEach(a=>api.registerCharacterSet(a,map));
}
MEMBERS.forEach(m=>register(...m));
window.LOVEFES_STORY_CHARACTER_ASSETS={version:'0.8.249',base:BASE,expressions:EXPRESSIONS,members:MEMBERS};
})();