// Ver.0.8.246: story character-expression asset registry for the 12 Nijigasaki members.
(function(){
'use strict';
const api=window.LOVEFES_STORY_VISUALS;
if(!api?.registerCharacterSet)return;

const BASE='assets/story/characters';
const EXPRESSIONS=['default','smile','shy','surprised','worried','angry','crying','wink'];
const MEMBERS=[
  {key:'歩夢',slug:'ayumu',aliases:['上原歩夢']},
  {key:'かすみ',slug:'kasumi',aliases:['中須かすみ']},
  {key:'しずく',slug:'shizuku',aliases:['桜坂しずく']},
  {key:'果林',slug:'karin',aliases:['朝香果林']},
  {key:'愛',slug:'ai',aliases:['宮下愛']},
  {key:'彼方',slug:'kanata',aliases:['近江彼方']},
  {key:'せつ菜',slug:'setsuna',aliases:['優木せつ菜','中川菜々','菜々']},
  {key:'エマ',slug:'emma',aliases:['エマ・ヴェルデ']},
  {key:'璃奈',slug:'rina',aliases:['天王寺璃奈']},
  {key:'栞子',slug:'shioriko',aliases:['三船栞子']},
  {key:'ミア',slug:'mia',aliases:['ミア・テイラー']},
  {key:'ランジュ',slug:'lanzhu',aliases:['鐘嵐珠','嵐珠']}
];

const loaded=Object.create(null);
function candidate(member,expr){return `${BASE}/${member.slug}/${expr}.webp`;}
function preload(url){
  return new Promise(resolve=>{
    const img=new Image();
    img.onload=()=>resolve(url);
    img.onerror=()=>resolve(null);
    img.src=url+(url.includes('?')?'&':'?')+'v='+(window.APP_VERSION||'0.8.246');
  });
}
async function loadMember(member){
  const pairs=await Promise.all(EXPRESSIONS.map(async expr=>[expr,await preload(candidate(member,expr))]));
  const map=Object.fromEntries(pairs.filter(([,url])=>url));
  if(!Object.keys(map).length)return false;
  api.registerCharacterSet(member.key,map);
  for(const alias of member.aliases)api.registerCharacterSet(alias,map);
  loaded[member.key]=Object.keys(map);
  return true;
}
async function loadAll(){
  const result=await Promise.all(MEMBERS.map(loadMember));
  return result.filter(Boolean).length;
}
window.LOVEFES_STORY_CHARACTER_ASSETS={
  version:'0.8.246',base:BASE,expressions:EXPRESSIONS,members:MEMBERS,loaded,loadAll
};
loadAll();
})();