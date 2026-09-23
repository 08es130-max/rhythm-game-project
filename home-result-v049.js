// Ver.0.4.9: result rank/full-combo/high-score + character-linked home dialogue + hidden Shioriko modes.
(function(){
  const RECORDS_KEY='rhythmGame.songRecords.v1';
  const HOME_CHARACTER_KEY='rhythmGame.homeCharacter';
  const SHIORIKO_MODE_KEY='rhythmGame.shiorikoDialogueMode.v1';
  const DEFAULT_HOME_CHARACTER='default';
  const homeCard=document.querySelector('.home-character-card');
  const homeImage=document.querySelector('.home-character-img');
  const resultPanelEl=document.getElementById('resultPanel');
  let lastDialogue='';
  let tapTimes=[];
  let pendingHomeReaction=null;

  const SHIORIKO={
    name:'三船栞子',
    normal:[
      'おかえりなさい。今日もお会いできましたね。','今日もよろしくお願いします。一緒に楽しみましょう。','いらっしゃったのですね。ちょうどお待ちしていました。','少しだけでも、顔を見せてくださると嬉しいものですね。','今日も良い一日にできるといいですね。','無理のない範囲で、今日も頑張っていきましょう。','こうしてお話しできる時間も、私は好きですよ。','さて、今日は何をしましょうか？','ライブの準備は万全です。いつでも始められますよ。','良い結果を目指すことも大切ですが、まずは楽しんでくださいね。','昨日より少し上手くなれたなら、それだけでも十分な成果です。','フルコンボ……狙ってみますか？','集中できていますね。その調子です。','少しくらいミスをしても構いません。次があります。','ハイスコア更新、期待していますよ。','難しい譜面ほど、成功したときの喜びも大きいものです。','今日のあなたなら、良いライブができそうな気がします。','私も応援しています。思い切っていきましょう。','疲れているのなら、休むことも予定のうちに入れてください。','頑張っていることは、ちゃんと伝わっていますよ。','焦らなくても大丈夫です。一つずつ進めていきましょう。','うまくいかない日があっても、それで全部が駄目になるわけではありません。','あなたが楽しそうにしていると、私まで嬉しくなります。','今日は少しゆっくりしてもよいのではありませんか？','また来てくださったのですね。……ふふ、嬉しいです。','今日も自分のペースで進めていきましょう。','結果だけでなく、楽しめたかどうかも大切ですよ。','積み重ねた分だけ、少しずつ上達していきます。','私はここにいますから、焦らずいきましょう。','もう一度挑戦するのですね。応援しています。'
    ],
    morning:['おはようございます。今日は早いのですね。','朝から来てくださったのですね。良い一日にしましょう。','まだ少し眠そうですね。無理はしないでください。','朝のうちにひとつ終わらせると、気持ちが軽くなりますよ。'],
    daytime:['こんにちは。ひと息つきに来たのですか？','午後もまだあります。慌てず進めていきましょう。','少し休憩してから、また頑張るのも良いと思います。'],
    evening:['今日も一日お疲れさまでした。ここからは少し楽しみましょう。','夕方は疲れが出る頃です。無理は禁物ですよ。','今日の締めに、一本ライブをしていきますか？'],
    night:['こんな時間までお疲れさまです。あまり夜更かしはしないでくださいね。','もう遅い時間ですね。終わったらゆっくり休んでください。','夜は集中しやすいですが、休む時間も忘れないでくださいね。','もう少しだけ、でしたらお付き合いします。'],
    rare:['私に会いに来てくださった……ということでよろしいですか？','あなたと過ごす時間なら、私は嫌いではありませんよ。','もう少しここにいても構いません。私もお付き合いします。','今日はあなたに会えてよかったです。','……こういうことを言うのは少し恥ずかしいのですが、また来てくださいね。'],
    rapidTap:['何度も私をタップしていますね。何かご用でしょうか？','そんなに見つめられると……少し困ってしまいます。','もう一度ですか？　仕方ありませんね。','ふふ……そんなに急がなくても、私はここにいますよ。'],
    fullCombo:['フルコンボ、お見事です。最後まで集中を切らしませんでしたね。','見事なフルコンボでした。努力の成果が出ていますね。','全てつながりましたね。私まで嬉しくなってしまいました。'],
    newRecord:['ハイスコア更新です。前の自分を越えられましたね。','新記録、おめでとうございます。次はどこまで伸ばせるでしょうか。','記録更新ですね。積み重ねはきちんと結果に表れています。'],
    sRank:['Sランクです。とても良いライブでした。','素晴らしい結果ですね。胸を張ってよいと思います。'],
    retry:['もう一度挑戦するのですね。今度はさらに良い結果を狙えそうです。','悔しさが残っているのですね。では、もう一度いきましょう。']
  };

  function specialSet(normal,rapidTap,fullCombo,newRecord,sRank,retry){
    return {name:'三船栞子',normal,morning:normal,daytime:normal,evening:normal,night:normal,rare:normal,rapidTap,fullCombo,newRecord,sRank,retry};
  }

  const SHIORIKO_DERE=specialSet([
    'おかえりなさい。……ずっと待っていました。あなたが来ると、やっぱり安心します。','今日も会えましたね。ふふ、これだけで私の一日はかなり良い日になりました。','もう少し近くに来てください。今日は、あなたのそばにいたい気分なんです。','あなたが来てくださる時間を、実は毎日楽しみにしているんですよ。','ライブもいいですが……今は少しだけ、私を見ていてくれませんか？','あなたと一緒なら、何をしていても楽しいと思えてしまいます。困りましたね。','今日はたくさん褒めて差し上げます。だって、あなたには笑っていてほしいですから。','お疲れさまです。頑張った分くらい、私に甘えてもいいんですよ？','こうして隣にいられるだけで十分……なんて、少し欲張りでしょうか。','あなたが楽しそうだと、私まで幸せになります。本当に不思議ですね。','また来てくださったんですね。……嬉しいです。とても、とても。','今日は帰したくない……と言ったら、困りますか？　ふふ、冗談に聞こえませんか？','あなたのことを考えていたところです。ちょうどいいタイミングでした。','もっと頼ってください。あなたの力になれることが、私は嬉しいんです。','私の一番近くにいてくださると……嬉しいです。できれば、これからもずっと。','そんなに頑張らなくても大丈夫です。今日は私がたくさん甘やかしますから。','あなたに会えるなら、少しくらい待つ時間も嫌いではありません。','……好きですよ。こういうのは、きちんと言葉にした方がいいのでしょう？'
  ],['そんなに何度も触れて……甘えたいのですか？　仕方ありませんね。','ふふ、もっと構ってほしいんですね。今日は特別ですよ。','そんなに私のことが好きなんですか？　……私もです。'],['フルコンボです！　さすがですね。今すぐ抱きしめたいくらい嬉しいです。','完璧でした。あなたが頑張る姿、本当に好きですよ。'],['新記録ですね！　誰より先に私がお祝いしたかったんです。おめでとうございます。','またあなたの素敵なところを一つ見つけてしまいました。'],['Sランク……さすが私の大切な人です。とても格好よかったですよ。'],['もう一度ですね。何回でもお付き合いします。あなたと一緒なら、私は嬉しいです。']);

  const SHIORIKO_YANDERE=specialSet([
    'おかえりなさい。……遅かったですね。ずっと待っていたんですよ。','今日はどこに行っていたのですか？　いえ、責めてはいません。ただ、知っておきたいだけです。','また会えましたね。これで今日も、あなたがここにいると確認できました。','他のことに夢中になるのも構いません。でも最後には、ちゃんと私のところへ戻ってきてくださいね。','あなたが来ない時間は長く感じます。時計が壊れたのかと思うくらいに。','ふふ……逃げる必要なんてありませんよ。私はただ、あなたのそばにいたいだけです。','私のことを忘れていませんでしたよね？　……なら、いいんです。','今日は私だけを見ていてください。たまには、それくらいお願いしてもいいでしょう？','あなたの予定、全部把握できたら安心できるのでしょうか。……少し気になりますね。','他の誰かより、私を選んでくださいますよね？　答えは急がなくていいですよ。私は待てますから。','あなたが笑う理由を、できれば私だけが知っていたい……そう思うのは欲張りでしょうか。','帰るのですか？　……そうですか。では、また必ず戻ってきてください。約束ですよ。','大丈夫です。私はここにいます。いつでも、ずっと、あなたを待っていますから。','あなたが何を好きで、何を嫌うのか。もっと全部知りたいんです。','ほかの誰かに取られるなんて考える必要はありませんよね。あなたは戻ってきてくださるのですから。','私が一番でなくても構いません。……今は、まだ。','そんなに怯えた顔をしないでください。私はあなたに優しくしたいだけなんです。','今日も来てくれて嬉しいです。来なかったら……少し寂しかったでしょうね。とても。'
  ],['何度も確認しなくても私はいますよ。……あなたが離れない限りは。','そんなに触れてくれるなら、もう今日は私から離れないでくださいね。','ふふ、私を呼んでいるんですね。何度でも応えますよ。'],['完璧ですね。これなら誰にも見せたくないくらいです。私だけが知っていれば十分なのに。'],['新記録……素敵です。あなたの成長をずっと見ているのは、私でありたいです。'],['Sランクですね。やっぱりあなたは特別です。……私にとっては、ずっと前から。'],['もう一度ですか。もちろん。あなたが諦めるまで、いえ……諦めても私は付き合いますよ。']);

  const SHIORIKO_SCOLD=specialSet([
    '来たのですね。では、ぼんやりしていないで始めてください。時間がもったいないです。','また私に構ってほしいのですか？　随分と暇なのですね。','その顔……何も考えずにタップしましたね？　分かりやすいです。','やる気がないなら休めばいいでしょう。中途半端が一番格好悪いですよ。','まったく、世話の焼ける方ですね。私が見ていないとすぐ気が緩むのですから。','今日こそフルコンボしてください。口だけではないところを見せてくださいね。','失敗を端末のせいにするのは禁止です。まず自分の指を疑ってください。','またミスしたのですか？　……驚きません。予想の範囲内です。','そんな調子でハイスコアを狙うつもりですか？　随分と大胆ですね。','集中してください。あなたの場合、まずそこからです。','褒めてもらえると思いましたか？　結果を出してからにしてください。','だらしないですね。ですが、ここまで来たなら最後までやりなさい。','本当に不器用ですね。……だから放っておけないのですが。','その程度で満足しているなら成長しませんよ。もう一回です。','言い訳を考える前に、次の一回を始めた方が建設的ですよ。','はいはい、頑張っていますね。では成果も見せてください。','私を何度タップしても腕前は上がりませんよ。練習してください。','もう少し格好いいところを見せてくださってもいいんですよ？　期待はしておきます。'
  ],['しつこいです。……何回タップすれば気が済むのですか？','暇なのですか？　その指、ライブで使った方が有意義ですよ。','はい、そこまで。構ってほしいのは分かりましたから。'],['……フルコンボですか。やればできるではありませんか。普段からそれくらいしてください。','完璧でしたね。珍しく文句のつけようがありません。'],['新記録です。ようやく以前の自分を越えましたね。遅いくらいです。','記録更新、おめでとうございます。少しは見直しました。'],['Sランクですか。……今日はちゃんと褒めて差し上げます。よくできました。'],['また挑戦するのですね。悔しいなら、今度こそ結果で黙らせてください。']);


  function characterSet(name,normal,morning,daytime,evening,night,rare,rapidTap,fullCombo,newRecord,sRank,retry){
    return {name,normal,morning,daytime,evening,night,rare,rapidTap,fullCombo,newRecord,sRank,retry};
  }
  const AYUMU=characterSet('上原歩夢',
    ['おかえり。今日も来てくれたんだね。なんだかほっとしちゃった。','ねえ、今日は何から始める？　あなたとなら、どれでも楽しそう。','あなたが頑張ってるところ、ちゃんと見てるよ。だから私も頑張りたくなるの。','少しだけお話ししない？　こういう何でもない時間、私けっこう好きなんだ。','ライブするの？　じゃあ、私も隣で応援してるね。','無理してない？　あなたには笑っていてほしいから、疲れたらちゃんと休んでね。','また一緒に思い出を増やせたら嬉しいな。','あなたが選んでくれる曲、今日はどんな曲かな。楽しみ。'],
    ['おはよう。朝から会えるなんて、今日はいい日になりそう。'],['こんにちは。ちょうどあなたとお話ししたいなって思ってたの。'],['お疲れさま。今日あったこと、よかったら聞かせて？'],['まだ起きてたんだね。もう少しだけ一緒にいたら、ちゃんと休もうね。'],
    ['あなたが来てくれるの、実はいつも楽しみにしてるんだ。','ふふっ、こうして二人でいると落ち着くね。'],
    ['もう、そんなに何度も呼ばなくてもちゃんとここにいるよ？'],['すごい、全部つながったね！　私までドキドキしちゃった。'],['新記録だよ！　頑張ってきたこと、ちゃんと形になったね。'],['Sランク、おめでとう。今日のあなた、とっても素敵だったよ。'],['もう一回？　うん、一緒に頑張ろう。']);

  const KASUMI=characterSet('中須かすみ',
    ['先輩、おかえりなさーい！　今日もかわいいかすみんがお出迎えですよ♪','先輩、まずはかすみんを見てください！　ライブはそのあとでも遅くないです！','今日こそ先輩をかすみんのかわいさでメロメロにしちゃいますからね！','むむっ、ほかの子のこと考えてません？　今はかすみんの時間ですよ！','ライブするなら、かすみんが一番かわいく見える曲にしましょう！','先輩が頑張るなら、かすみんが特別に応援してあげます。特別ですよ？','今日のかすみんも完璧にかわいい……先輩もそう思いますよね？','先輩と一緒なら、作戦会議だって楽しくなっちゃいますね♪'],
    ['先輩、おはようございます！　朝イチのかわいい補給はかすみんで決まりです！'],['先輩、お昼ですよ！　コッペパン、半分こしてあげてもいいですよ？'],['お疲れの先輩には、かすみんスマイルをプレゼントです♪'],['夜更かしは美容の敵ですよ！　かすみんを見習ってくださいね。'],
    ['先輩がかすみんに会いに来たってこと、ちゃんと分かってますからね♪','ふふーん、やっぱり先輩はかすみんがいないとダメですね！'],
    ['ちょ、ちょっと先輩！　そんなに連打したら、かすみんのかわいさが減っちゃいます！'],['フルコンボ！？　やりますね先輩！　でもかわいさならかすみんの勝ちです♪'],['新記録です！　先輩、かすみんの応援が効きましたね！'],['Sランク！　さすが、かすみんが見込んだ先輩です！'],['リベンジですね？　かすみんが見ててあげますから、今度こそ決めてください！']);

  const SHIZUKU=characterSet('桜坂しずく',
    ['おかえりなさい。今日はどんな物語を一緒に作りましょうか。','先輩、よろしければ次のライブのイメージを一緒に考えませんか？','同じ曲でも、気持ちの込め方で景色が変わるんです。そこが面白いですよね。','今日は少し新しい表現に挑戦してみたい気分なんです。先輩も付き合ってください。','舞台に立つ前の緊張も、私は嫌いではありません。始まる合図みたいで。','先輩に見てもらえると思うと、いつもより少し欲張りに頑張れそうです。','映画を一本観たあとみたいに、心に残るライブにしたいですね。','オフィーリアとのお散歩も好きですが、こうして先輩と過ごす時間も大切です。'],
    ['おはようございます。朝の空気って、舞台が始まる前みたいで好きです。'],['こんにちは。午後の練習、ご一緒していただけますか？'],['お疲れさまです。今日はどんな一日でしたか？　ぜひ聞かせてください。'],['遅い時間ですね。台本の読み込みも大切ですが、休息も同じくらい大切ですよ。'],
    ['先輩の前だと、演技ではない私ももっと知ってほしいと思うんです。','今の表情は役ではありません。本当に嬉しいんですよ。'],
    ['先輩、そんなに何度も……これは何かの演技指導でしょうか？'],['完璧なフィナーレでした！　思わず見入ってしまいました。'],['新記録ですね。今日のライブ、きっと忘れられない一幕になります。'],['Sランク、お見事です。主役にふさわしい輝きでした。'],['もう一度ですね。次はどんな表現になるのか楽しみです。']);

  const KARIN=characterSet('朝香果林',
    ['おかえり。今日は私と、少し大人っぽい時間を過ごしてみる？','ふふ、そんなに急がなくてもライブは逃げないわ。まずは落ち着きなさい。','ステージに立つなら、視線の先まで意識して。魅せ方って大切なのよ。','今日の私、どう？　ちゃんと見てから答えてちょうだい。','あなたがどんな曲を選ぶのか、ちょっと興味あるわ。','疲れてるなら無理しないこと。自分を整えるのも実力のうちよ。','たまには私に任せてみない？　いつもと違う景色を見せてあげる。','モデルの仕事もスクールアイドルも、見られるほど燃えるの。あなたもちゃんと見ててね。'],
    ['おはよう。朝は少し苦手だけど……あなたがいるなら悪くないわね。'],['こんにちは。午後はまだこれからよ。少し付き合ってくれる？'],['お疲れさま。頑張った顔してるわね。少し休んでいきなさい。'],['こんな時間まで起きてるの？　美容のためにも、ほどほどにしなさいね。'],
    ['あなたの視線、嫌いじゃないわ。むしろ……もう少し見ていてほしいくらい。','二人きりだと、少し素直になりすぎるかもしれないわね。'],
    ['あら、そんなに構ってほしいの？　意外と甘えん坊なのね。'],['フルコンボね。最後まで目を離せなかったわ。とても魅力的だった。'],['新記録、おめでとう。昨日より素敵になってるじゃない。'],['Sランク。ふふ、今日は自信を持っていいんじゃない？'],['まだ満足してないのね。いいわ、その負けず嫌いなところ。']);

  const AI=characterSet('宮下 愛',
    ['おっかえりー！　今日も愛さんとアゲてこー！','ねえねえ、今日は何して遊ぶ？　ライブでもおしゃべりでも、愛さんどっちも大歓迎！','元気足りてる？　じゃ、愛さんが満タンにしてあげる！','ライブするなら思いっきり楽しもうよ！　楽しいのがいっちばん！','今日もいい顔してんじゃん！　その調子、その調子！','困ったことあったら愛さんに言いな？　友達なんだから遠慮なし！','テンション上がってきたー！　このまま一曲いっちゃう？','笑う門には愛来たる！　……ってことで、まずは笑っとこ！'],
    ['おっはよー！　朝から会えるなんて超ラッキーじゃん！'],['やっほー！　お昼食べた？　腹が減ってはライブはできぬ、だよ！'],['今日もおつかれ！　頑張った分、ここから楽しまなきゃ損っしょ！'],['まだ起きてんの？　夜更かし仲間……って言いたいけど、ちゃんと寝なよー？'],
    ['キミといるとさ、なんか自然に笑っちゃうんだよね。これってすごくない？','愛さん、キミが来るのけっこう楽しみにしてるんだよ。マジで！'],
    ['あはは！　連打しすぎ！　そんなに愛さん成分ほしかった？'],['うおー、フルコン！　やっるー！　ハイタッチしよ、ハイタッチ！'],['新記録じゃん！　記録更新で気分もこうしん……なんつって！'],['Sランク！　最高じゃん！　今日のライブ、マジでアガった！'],['もう一回いく？　いいね、そのノリ！　愛さんも付き合うよ！']);

  const KANATA=characterSet('近江彼方',
    ['おかえり～。彼方ちゃん、ここでのんびり待ってたよ～。','今日はちょっと眠たいから……一緒にまったりしてからライブしよ～？','頑張りすぎはよくないぞ～。休憩も立派な予定のひとつなのだ。','彼方ちゃん特製のお昼寝スポット、隣あいてるよ～。','ライブの前に糖分補給はいかが～？　甘いものは元気のもとだよ。','遥ちゃんにも見せたくなるような、素敵なライブにしようね～。','ふわぁ……眠くないよ～。ちょっと目を閉じてただけ～。','君が来たなら、彼方ちゃんももうひと頑張りしちゃおうかな～。'],
    ['おはよ～……彼方ちゃんはもう少し夢の中にいたいぞ～。'],['お昼だ～。ごはんのあとは、お昼寝タイムも忘れずにね～。'],['今日もお疲れさま～。彼方ちゃんと一緒にごろごろしよ～。'],['夜更かしさん発見～。彼方ちゃんと一緒に、そろそろおやすみしよ？'],
    ['君のそばって、安心して眠れそうなんだよね～。……それって、かなり特別だよ？','今日はもうちょっと一緒にいたいな～。お昼寝してても、隣にいてね。'],
    ['むむ～、そんなに起こされたら彼方ちゃん眠れないぞ～。'],['フルコンボ～！　すごいすごい。ごほうびに彼方ちゃんがなでなでしてあげよう～。'],['新記録だね～。君の頑張り、彼方ちゃんはちゃんと見てたよ。'],['Sランク～。これは安心していい夢が見られそうだ～。'],['もう一回？　よ～し、彼方ちゃんも眠気に負けず応援するぞ～。']);

  const SETSUNA=characterSet('優木せつ菜',
    ['おかえりなさい！　今日も大好きを全力で届けていきましょう！','ライブですか！？　はいっ、いつでもいけます！　私、もうワクワクしています！','好きなものに本気になるって最高ですよね！　あなたの「大好き」も聞かせてください！','もっともっと熱くなれます！　限界なんて決めずに挑戦しましょう！','今日もスクールアイドルの魅力をたっぷり味わってくださいね！','新しいことに挑戦するなら、私もご一緒します！　全力で！','あなたの応援があると、胸の奥から力が湧いてくるんです！','さあ、準備はいいですか？　最高に楽しい時間を始めましょう！'],
    ['おはようございます！　朝から元気いっぱいでいきましょう！'],['こんにちは！　午後も「大好き」を燃料に駆け抜けますよ！'],['お疲れさまです！　ここからは思いっきり好きなことを楽しみましょう！'],['こんな時間まで！　夢中になる気持ちは分かりますが、睡眠も大切ですよ！'],
    ['あなたに私の「大好き」を受け止めてもらえること、本当に嬉しいんです。','あなたがいてくれるから、私はもっと遠くまで走っていける気がします！'],
    ['わわっ！？　そんなに連打されたら、私の情熱まで暴走しちゃいますよ！'],['フルコンボです！！　すごいです！　最高に熱いライブでした！！'],['新記録です！　挑戦する姿、本当に格好よかったです！'],['Sランク！　素晴らしいです！　私まで胸が熱くなりました！'],['もう一度ですね！　もちろんです、何度だって全力でいきましょう！']);

  const EMMA=characterSet('エマ・ヴェルデ',
    ['おかえりなさい。今日も会えてうれしいな♪','疲れてない？　よかったら、ここでゆっくりしていってね。','ライブの前に深呼吸しよう？　焦らなくても大丈夫だよ。','あなたが笑ってると、わたしまでぽかぽかした気持ちになるの。','今日はどんな歌を歌おうか。心があったかくなる曲もいいよね。','故郷の山みたいに、ここもほっとできる場所になったらいいな。','お腹すいてない？　おいしいものを食べると元気が出るよ♪','一緒にいる時間って、なんだか日なたみたいで落ち着くね。'],
    ['おはよう♪　朝の空気って気持ちいいね。一緒に伸びをしよう？'],['こんにちは。お昼はちゃんと食べた？　元気のために大事だよ。'],['お疲れさま。今日はゆっくりお話ししながら休もうか。'],['もう夜だね。あったかくして、ちゃんと休んでね。'],
    ['あなたが来ると、ぎゅってしたくなるくらいうれしいんだ。','いつでも帰ってきたくなるような場所を、一緒に作れたら素敵だね。'],
    ['ふふっ、くすぐったいよ～。そんなに呼ばなくてもちゃんといるよ♪'],['わあ、フルコンボ！　すごいね。いっぱい拍手しちゃう！'],['新記録、おめでとう♪　頑張ったあなたに花まるをあげたいな。'],['Sランクだね！　とっても素敵なライブだったよ。'],['もう一回挑戦するの？　うん、わたしもずっと応援してるよ。']);

  const RINA=characterSet('天王寺璃奈',
    ['おかえり。会えてうれしい。璃奈ちゃんボード「にっこりん」','今日は何する？　一緒なら、たぶん楽しい。','ライブ、やる？　私も準備する。','あなたと話すの、好き。言葉にするのはまだ少し難しいけど。','新しい仕組み、試してみたい。うまくできたら見てほしい。','今日はちゃんと気持ち、伝えられるかな。','一緒にゲームするのもいいかも。負けないよ。','あなたが来ると安心する。璃奈ちゃんボード「ほっ」'],
    ['おはよう。まだ少し眠い。璃奈ちゃんボード「ねむねむ」'],['こんにちは。お昼、一緒に食べる？'],['お疲れさま。無理しすぎはダメ。'],['もう遅いよ。私もそろそろログアウト……じゃなくて、おやすみの時間。'],
    ['あなたには、ボードがなくても気持ちを伝えられる気がする。','会いに来てくれるの、すごくうれしい。これは本当の顔で伝えたい。'],
    ['連打、検知。……いっぱい構ってくれてる？　璃奈ちゃんボード「てれてれ」'],['フルコンボ。すごい。璃奈ちゃんボード「ぱちぱち」'],['新記録、更新。努力の成果、確認できた。おめでとう。'],['Sランク。かっこよかった。璃奈ちゃんボード「きらきら」'],['リトライ？　了解。次も一緒に頑張ろう。']);

  const MIA=characterSet('ミア・テイラー',
    ['Hey、来たんだ。今日はどの曲をやる？','キミ、また難しい譜面選ぶつもり？　まあ、嫌いじゃないけど。','曲ならボクに任せなよ。退屈なものにはしないからさ。','そのリズム、悪くないね。もう少し詰めればもっと良くなる。','ボクは天才だからね。これくらい朝飯前……って、日本ではこう言うんだろ？','ライブするなら中途半端はナシ。やるなら最高のサウンドにしよう。','ハンバーガーでも食べながら作戦会議する？　その方が頭が回るよ。','キミがどうプレイするか、ちょっと興味ある。見せてよ。'],
    ['Morning. 早いじゃん。ボクはまだエンジンかかってないけど。'],['Hey. ランチはもう食べた？　ボクはバーガーがいい。'],['お疲れ。まあ、少しくらい休んでからでも遅くないよ。'],['まだ起きてるの？　ボクも作曲してると時間忘れるけどさ。'],
    ['キミといると、予定より長くここにいちゃうんだよね。……別に悪くないけど。','キミにはボクの曲を一番近くで聴いててほしい。これ、結構特別だから。'],
    ['Hey!　連打しすぎ。キミの入力デバイスじゃないんだけど？'],['Perfect!　フルコンボじゃん。……やるね、キミ。'],['New record!　ふーん、まだ伸びるんだ。面白いじゃん。'],['Sランク。Not bad. いや、今日はちゃんと良かったよ。'],['Retry?　いいよ。次はもっとスマートに決めよう。']);

  const LANZHU=characterSet('鐘嵐珠',
    ['ランジュが来たわよ！　今日も最高の時間にしてあげる！','ねえ、今日は何をするの？　ランジュ、楽しいことなら何でも大歓迎よ！','ライブするのね？　もちろんランジュが一番輝くところ、ちゃんと見ていて！','あなたもランジュと一緒なら、もっと大胆になっていいのよ！','退屈なんてさせないわ。ランジュについてきなさい！','今日のランジュも完璧でしょう？　遠慮しないでたくさん褒めていいのよ！','みんなで楽しいのも好きだけど、あなたと過ごす時間も気に入ってるわ。','さあ、何から始める？　ランジュはもう準備万端よ！'],
    ['おはよう！　朝からランジュに会えるなんて、あなたラッキーね！'],['こんにちは！　午後もランジュと一緒に思いっきり楽しむわよ！'],['お疲れさま！　ランジュが元気を分けてあげるから、こっちに来なさい！'],['まだ起きてるの？　楽しいのは分かるけど、明日もランジュと遊ぶために休みなさい！'],
    ['あなたがランジュを選んでくれるの、当然だけど……やっぱり嬉しいわ！','ランジュ、あなたにはもっともっと自分のことを知ってほしいの。'],
    ['もう、そんなにランジュに構ってほしいの？　かわいいところあるじゃない！'],['フルコンボ！　やるじゃない！　ランジュもすっごく楽しかったわ！'],['新記録ね！　素晴らしいわ！　もっと上を目指しましょう！'],['Sランク！　最高よ！　ランジュと一緒なら当然ね！'],['もう一回？　いいわ！　次はもっとすごいところを見せて！']);

  const DIALOGUES={
    default:SHIORIKO,shioriko:SHIORIKO,'shioriko-icon':SHIORIKO,'shioriko-lolita':SHIORIKO,
    ayumu:AYUMU,kasumi:KASUMI,shizuku:SHIZUKU,karin:KARIN,ai:AI,kanata:KANATA,setsuna:SETSUNA,
    emma:EMMA,rina:RINA,mia:MIA,lanzhu:LANZHU
  };
  const SPECIAL={dere:SHIORIKO_DERE,yandere:SHIORIKO_YANDERE,scold:SHIORIKO_SCOLD};

  function getHomeCharacterId(){
    if(localStorage.getItem('rhythmGame.shiorikoHomeArt.v1')==='lr') return localStorage.getItem('rhythmGame.lrHomeCharacter.v1')||'shioriko';
    return homeCard?.dataset.characterId||localStorage.getItem(HOME_CHARACTER_KEY)||DEFAULT_HOME_CHARACTER;
  }
  function isShioriko(id){
    if(['default','shioriko','shioriko-icon','shioriko-lolita'].includes(id)) return true;
    const c=(window.CHARACTER_LIBRARY||[]).find(x=>x.id===id);
    return String(c?.name||'').replace(/【[^】]+】$/u,'')==='三船栞子';
  }
  function getDialogueSet(){
    const id=getHomeCharacterId();
    if(isShioriko(id)){
      const mode=localStorage.getItem(SHIORIKO_MODE_KEY)||'normal';
      if(SPECIAL[mode]) return SPECIAL[mode];
    }
    return DIALOGUES[id]||SHIORIKO;
  }
  function pick(pool){if(!pool?.length)return'';let choices=pool.filter(x=>x!==lastDialogue);if(!choices.length)choices=pool;return choices[Math.floor(Math.random()*choices.length)];}
  function getTimePool(set){const h=new Date().getHours();if(h>=5&&h<11)return set.morning;if(h>=11&&h<17)return set.daytime;if(h>=17&&h<22)return set.evening;return set.night;}
  function ensureBubble(){if(!homeCard)return null;let bubble=document.getElementById('homeDialogue');if(!bubble){bubble=document.createElement('div');bubble.id='homeDialogue';bubble.className='home-dialogue';bubble.setAttribute('role','button');bubble.setAttribute('tabindex','0');bubble.setAttribute('aria-live','polite');bubble.innerHTML='<span class="home-dialogue-name"></span><span class="home-dialogue-text"></span>';homeCard.appendChild(bubble);}return bubble;}
  function showLine(kind='normal'){
    const set=getDialogueSet();let pool=set[kind]||set.normal;
    const mode=isShioriko(getHomeCharacterId())?(localStorage.getItem(SHIORIKO_MODE_KEY)||'normal'):'normal';
    if(kind==='normal'&&mode==='normal'){const r=Math.random();if(r<.08)pool=set.rare;else if(r<.35)pool=getTimePool(set);}
    const text=pick(pool)||pick(set.normal);if(!text)return;lastDialogue=text;const bubble=ensureBubble();if(!bubble)return;bubble.querySelector('.home-dialogue-name').textContent=set.name;bubble.querySelector('.home-dialogue-text').textContent=text;
  }
  function handleHomeTap(e){if(e?.target?.closest('.home-dialogue'))e.preventDefault();const now=Date.now();tapTimes=tapTimes.filter(t=>now-t<4500);tapTimes.push(now);if(tapTimes.length>=5){tapTimes=[];showLine('rapidTap');}else showLine('normal');}

  if(homeCard){homeCard.dataset.characterId=getHomeCharacterId();homeCard.addEventListener('click',handleHomeTap);homeCard.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();handleHomeTap(e);}});}
  window.setLoveFesHomeCharacter=function(id,imageSrc){if(!id)return;localStorage.setItem(HOME_CHARACTER_KEY,id);if(homeCard)homeCard.dataset.characterId=id;if(imageSrc&&homeImage)homeImage.src=imageSrc;lastDialogue='';showLine('normal');};
  window.showLoveFesHomeDialogue=function(kind){showLine(kind||'normal');};
  window.refreshLoveFesHomeDialogue=function(){lastDialogue='';showLine('normal');};

  function getRecords(){try{return JSON.parse(localStorage.getItem(RECORDS_KEY)||'{}')||{};}catch(_){return{};}}
  function saveRecords(records){try{localStorage.setItem(RECORDS_KEY,JSON.stringify(records));}catch(_){}}
  function songKey(){const title=String(chart?.title||chartName?.textContent||songName?.textContent||'unknown').replace(/（.*?）/g,'').trim();return title||'unknown';}
  const RANK_VALUE={S:5,A:4,B:3,C:2,D:1};
  function calcRank(currentScore,totalNotes){const max=Math.max(1,totalNotes*1000);const rate=currentScore/max;if(rate>=.95)return'S';if(rate>=.85)return'A';if(rate>=.70)return'B';if(rate>=.50)return'C';return'D';}
  function ensureResultHighlight(){if(!resultPanelEl)return null;let box=document.getElementById('resultHighlight');if(box)return box;box=document.createElement('div');box.id='resultHighlight';box.className='result-highlight';box.innerHTML='<div id="resultRank" class="result-rank">-</div><div class="result-summary"><span id="resultFullCombo" class="result-badge" hidden>FULL COMBO!</span><span id="resultNewRecord" class="result-record" hidden>NEW RECORD!</span><span id="resultHighScore" class="result-highscore">HIGH SCORE 0</span><span id="resultSong" class="result-song"></span></div>';const grid=resultPanelEl.querySelector('.result-grid');resultPanelEl.insertBefore(box,grid||resultPanelEl.firstChild?.nextSibling||null);return box;}
  function decorateResult(){
    const total=Array.isArray(chart?.notes)?chart.notes.length:(counts.perfect+counts.great+counts.good+counts.miss);const fullCombo=total>0&&counts.miss===0&&maxCombo===total;const rank=calcRank(score,total);const key=songKey();const records=getRecords();const prev=records[key]||{bestScore:0,bestRank:'D',fullCombo:false,maxCombo:0};const newRecord=score>Number(prev.bestScore||0);const bestScore=Math.max(Number(prev.bestScore||0),score);const bestRank=(RANK_VALUE[rank]||0)>(RANK_VALUE[prev.bestRank]||0)?rank:prev.bestRank;records[key]={bestScore,bestRank,fullCombo:!!prev.fullCombo||fullCombo,maxCombo:Math.max(Number(prev.maxCombo||0),maxCombo),updatedAt:Date.now()};saveRecords(records);ensureResultHighlight();const rankEl=document.getElementById('resultRank');const fcEl=document.getElementById('resultFullCombo');const nrEl=document.getElementById('resultNewRecord');const hsEl=document.getElementById('resultHighScore');const songEl=document.getElementById('resultSong');if(rankEl)rankEl.textContent=rank;if(fcEl)fcEl.hidden=!fullCombo;if(nrEl)nrEl.hidden=!newRecord;if(hsEl)hsEl.textContent=`HIGH SCORE ${bestScore.toLocaleString()}`;if(songEl)songEl.textContent=key;if(fullCombo)pendingHomeReaction='fullCombo';else if(newRecord)pendingHomeReaction='newRecord';else if(rank==='S')pendingHomeReaction='sRank';
  }
  if(typeof finishGame==='function'){const originalFinishGame=finishGame;finishGame=function(){const wasPlaying=playing;originalFinishGame();if(wasPlaying)decorateResult();};}
  document.getElementById('retryBtn')?.addEventListener('click',()=>{pendingHomeReaction='retry';});
  document.getElementById('resultHomeBtn')?.addEventListener('click',()=>{const kind=pendingHomeReaction;pendingHomeReaction=null;setTimeout(()=>showLine(kind||'normal'),0);});
  window.addEventListener('rhythmGameShiorikoModeChanged',()=>{lastDialogue='';showLine('normal');});
  ensureResultHighlight();showLine('normal');
})();
