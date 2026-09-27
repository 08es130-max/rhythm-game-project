// Ver.0.8.247: automatic story sprite placement and conservative expression selection.
(function(){
'use strict';

const MEMBERS=new Set(['歩夢','かすみ','しずく','果林','愛','彼方','せつ菜','エマ','璃奈','栞子','ミア','ランジュ']);
const ALIASES={
  '上原歩夢':'歩夢','中須かすみ':'かすみ','桜坂しずく':'しずく','朝香果林':'果林',
  '宮下愛':'愛','近江彼方':'彼方','優木せつ菜':'せつ菜','中川菜々':'せつ菜','菜々':'せつ菜',
  'エマ・ヴェルデ':'エマ','天王寺璃奈':'璃奈','三船栞子':'栞子',
  'ミア・テイラー':'ミア','鐘嵐珠':'ランジュ','嵐珠':'ランジュ'
};
function memberName(name){const n=ALIASES[name]||name;return MEMBERS.has(n)?n:null;}
function hasOwn(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function inferExpression(text){
  const t=String(text||'');
  if(/[泣涙]|ごめん|寂し|さみし|つら|辛い|苦し/.test(t))return 'crying';
  if(/[怒許せない]|ふざけ|絶対嫌|納得でき/.test(t))return 'angry';
  if(/[！？?!]|えっ|ええっ|まさか|本当[？?]/.test(t))return 'surprised';
  if(/困|どうしよう|不安|心配|怖|こわ|迷|悩/.test(t))return 'worried';
  if(/照|恥ずか|はずか|そんなこと/.test(t))return 'shy';
  if(/ありがとう|嬉し|うれし|楽しい|最高|もちろん|よかった|やった/.test(t))return 'smile';
  return 'default';
}
function decorate(line){
  if(!line||typeof line!=='object')return line;
  // Hand-authored visual directions always win.
  if(hasOwn(line,'left')||hasOwn(line,'l')||hasOwn(line,'right')||hasOwn(line,'r'))return line;
  const speaker=memberName(line.n);
  if(!speaker)return line;
  return {...line,right:{character:speaker,expression:inferExpression(line.t)}};
}
function install(){
  const api=window.LOVEFES_STORY_VISUALS;
  if(!api?.renderLine||api.__autoSprite247)return false;
  const original=api.renderLine.bind(api);
  api.renderLine=function(line,context){return original(decorate(line),context);};
  api.__autoSprite247=true;
  api.autoSprite={version:'0.8.247',decorate,inferExpression,memberName};
  return true;
}
if(!install())document.addEventListener('DOMContentLoaded',install,{once:true});
})();