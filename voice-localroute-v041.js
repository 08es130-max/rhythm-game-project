// Ver.0.4.1: built-in voices are converted to File objects and sent through the exact same local-file playback route that works for user-added voices.
(function(){
  const ORDER=['fullhouse','nanisore','dareka','nico','ieni','yohane'];
  const fileCache=new Map();
  let lastId=null;

  function getBuiltinFile(index){
    if(fileCache.has(index)) return fileCache.get(index);
    const key=ORDER[index];
    const entry=window.LOVEFES_BUILTIN_VOICES?.[key];
    if(!entry) return null;
    const bin=atob(entry.base64);
    const bytes=new Uint8Array(bin.length);
    for(let i=0;i<bin.length;i++) bytes[i]=bin.charCodeAt(i);
    const safeName=(entry.name||key).replace(/[\\/:*?"<>|]/g,'_')+'.mp3';
    const file=new File([bytes],safeName,{type:entry.mime||'audio/mpeg'});
    fileCache.set(index,file);
    return file;
  }

  // voice-direct.js is loaded immediately before the v0.4.x built-in overrides.
  // Preserve its local-file implementation, because user-added files are confirmed to work there.
  const confirmedLocalPlayer=typeof playManagedVoice==='function'?playManagedVoice:null;

  playManagedVoice=async function(item){
    if(item?.kind==='builtin'){
      const index=Number(item.index ?? String(item.id||'').replace('builtin-',''));
      const file=getBuiltinFile(index);
      if(!file) throw new Error('内蔵音声ファイルを作成できませんでした');
      return confirmedLocalPlayer
        ? confirmedLocalPlayer({id:item.id,name:item.name,kind:'local',blob:file})
        : Promise.reject(new Error('ローカル音声プレイヤーがありません'));
    }
    return confirmedLocalPlayer?confirmedLocalPlayer(item):Promise.resolve();
  };

  playRandomTenHitVoice=async function(){
    const candidates=typeof getManagedVoiceCandidates==='function'?await getManagedVoiceCandidates():[];
    if(!candidates.length) return;
    let pool=candidates;
    if(candidates.length>1&&lastId){
      const filtered=candidates.filter(v=>v.id!==lastId);
      if(filtered.length) pool=filtered;
    }
    const item=pool[Math.floor(Math.random()*pool.length)];
    lastId=item.id;
    try{await playManagedVoice(item);}catch(e){console.warn('10回成功音声の再生に失敗しました',e);}
  };
})();
