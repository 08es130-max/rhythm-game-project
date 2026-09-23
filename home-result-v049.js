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
      'おかえりなさい。今日も来てくださったのですね。お会いできて嬉しいです。',
      '今日は何をしましょうか。予定を立てるのでしたら、私もご一緒します。',
      'スクールアイドルになってから、知らなかったことに出会う機会が本当に増えました。',
      '以前の私は、向いているかどうかばかり考えていました。今は、やってみたいという気持ちも大切にしたいと思っています。',
      'あなたはいつも、私自身が気づいていない可能性まで見つけてくださいますね。',
      '今日も一つ、新しいことに挑戦してみませんか？　私もお付き合いします。',
      '日本舞踊の稽古と同じで、ライブも日々の積み重ねが大切ですね。',
      'お茶を淹れましょうか？　少し落ち着いてから始めるのも悪くないと思います。',
      'お花を見ていると、同じものでも見方によって印象が変わると気づかされます。表現も同じなのかもしれません。',
      '生徒会の仕事は済ませてきました。ですから今は、スクールアイドルの三船栞子としてここにいます。',
      'まだ融通が利かないところはありますが……以前よりは、少し柔らかくなったと思いませんか？',
      '姉にはまだ及ばないところも多いです。でも、私は私なりのやり方で進んでいきたいと思っています。',
      '誰かに決められた適性ではなく、自分の目で見て、自分の気持ちで選ぶ。それを忘れないようにしたいです。',
      'スクールアイドルになってよかったと、今では胸を張って言えます。あなたのおかげでもありますよ。',
      '翠いカナリアに込めた気持ちのように、もっと自由に自分を表現できるようになりたいです。',
      '決意をしただけで終わりではありません。決めたからには、きちんと成果につなげたいですね。',
      '皆さんと活動していると、予定通りにいかないことばかりです。……ですが、それも楽しいと思えるようになりました。',
      '私の知らない私を、あなたは何度も見つけてくださいました。次はどんな私が見つかるのでしょうね。',
      'あなたから見て、今日の私はどうですか？　率直な感想を聞かせてください。',
      'こうしてあなたと話していると、つい時間を忘れてしまいます。……少し意外ですか？',
      'ライブの準備はできています。今日も私らしいステージをお見せします。',
      '努力した分だけ必ず思い通りになるとは限りません。それでも、努力した時間まで無駄になるわけではありません。',
      '完璧でなくても前へ進める。皆さんとあなたから、それを教えていただきました。',
      'あなたが楽しそうにしていると、私も嬉しくなります。以前なら、こんな気持ちをうまく言葉にできなかったでしょうね。',
      '次の目標を一緒に考えていただけますか？　あなたの意見を聞いてみたいです。',
      '私にできることでしたら力になります。遠慮せず言ってください。',
      '少し休憩にしませんか？　効率を考えても、休息は必要ですから。',
      '今日も精一杯取り組みましょう。ただし、楽しむことも忘れないでくださいね。',
      'また来てくださったのですね。……ふふ、待っていた甲斐がありました。',
      'あなたとなら、予定にない寄り道も悪くないのかもしれません。'
    ],
    morning:[
      'おはようございます。朝は気持ちが整いますね。今日の予定を確認しておきましょうか。',
      '朝の稽古を終えたところです。よろしければ、あなたも少し身体を動かしますか？',
      'おはようございます。今日も新しい発見のある一日にしたいですね。',
      'まだ眠そうですね。まずはお茶でも飲んで、ゆっくり目を覚ましてください。'
    ],
    daytime:[
      'こんにちは。生徒会の仕事もひと段落しました。ここからは同好会の時間です。',
      'お昼はもう済ませましたか？　予定を詰め込みすぎるのは感心しませんよ。',
      '午後の練習でしたら、私も参加します。今日はどこを重点的に見ましょうか？',
      '少し外を歩きませんか？　机に向かっているだけでは気づけないこともありますから。'
    ],
    evening:[
      '今日も一日お疲れさまでした。予定通りに進まなかったことも、明日に活かせばよいと思います。',
      '夕方の校舎は静かですね。こういう時間に考えを整理するのも好きなんです。',
      '今日の締めにライブを一本……というのも良さそうですね。私もまだ動けますよ。',
      '一日を振り返ってみませんか？　よかったことも、反省点も、どちらも大切です。'
    ],
    night:[
      'もう遅い時間ですね。集中できていても、睡眠時間を削るのはおすすめしません。',
      'こんな時間までお疲れさまです。区切りのよいところで休みましょう。',
      '夜は静かで落ち着きますね。……もう少しだけでしたら、私もお付き合いします。',
      '明日の予定に響いてはいけません。私との時間も大切ですが、休息も大切にしてください。'
    ],
    rare:[
      '私がスクールアイドルとしてここにいられるのは、あなたが私の気持ちを見つけてくださったからです。改めて……ありがとうございます。',
      '昔の私なら、こんなふうに自分から誰かと過ごしたいとは言えなかったかもしれません。今は……あなたともう少し一緒にいたいです。',
      'あなたは、私が決めつけていた「私らしさ」を何度も広げてくださいました。これからも見ていてくださいますか？',
      '私の歌で誰かが幸せになってくれる。その喜びを知ることができて、本当によかったと思っています。',
      'あなたに褒めていただけると、思っていた以上に嬉しいんです。……あまり顔を見ないでください。少し恥ずかしいので。',
      '皆さんと出会って、あなたと出会って、私は随分変わりました。でも、この変化は嫌いではありません。',
      '次に私が迷ったときも、答えを決めるのは私自身です。そのうえで……あなたには隣にいてほしいと思っています。',
      '私に会いに来てくださったのですか？　……でしたら、今日は少しだけ特別な時間にしましょう。'
    ],
    rapidTap:[
      '何度も私をタップしていますね。何か伝えたいことがあるのでしょうか？',
      'そんなに急がなくても、私は逃げませんよ。',
      'もう一度ですか？　……ふふ、随分と熱心ですね。',
      'もしかして、私に構ってほしいのですか？　でしたら、そう言ってくださればよいのに。'
    ],
    fullCombo:[
      'フルコンボ、お見事です。積み重ねてきたものが、きちんと結果になりましたね。',
      '全てつながりましたね。最後まで集中を切らさない姿勢、私も見習いたいです。',
      '完璧なライブでした。ですが何より、あなたが楽しそうだったことが嬉しいです。'
    ],
    newRecord:[
      '新記録ですね。昨日までの自分を越えました。胸を張ってください。',
      '記録更新、おめでとうございます。努力を数字で確認できるのも嬉しいものですね。',
      'また一つ可能性を広げましたね。次はどこまで行けるのか、私も楽しみです。'
    ],
    sRank:[
      'Sランクです。素晴らしい結果ですね。努力にふさわしい成果だと思います。',
      'とても良いライブでした。結果だけでなく、最後まで楽しんでいるのが伝わってきましたよ。',
      'お見事です。……私まで誇らしい気持ちになるのは、少し不思議ですね。'
    ],
    retry:[
      'もう一度挑戦するのですね。では、先ほどの経験を次に活かしましょう。',
      '納得できなかったのですね。分かりました。今度は私も、もっとしっかり応援します。',
      '失敗したからこそ見えることもあります。次の一回を、より良いものにしましょう。'
    ]
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
    ['あ、来た。おかえり♪','ねえ、今日は何する？　私はあなたと一緒ならなんでもいいよ。','ちょっとこっち来て。……ふふ、呼んでみただけ。','また会えたね。毎日会ってても嬉しいものは嬉しいんだよ？','ねえ、あとでどこか寄ってかない？　二人でゆっくりしたいな。','あなた、ちょっと疲れてない？　そういうの私には分かるんだから。','今日あったこと、あとで聞かせてね。私も話したいことあるんだ。','もう帰るの？　……もうちょっとだけ一緒にいようよ。'],
    ['おはよう。ふふ、朝から会えた♪'],['お昼一緒に食べよ。ね、決まり♪'],['お疲れさま。こっちおいで、ちょっと休も？'],['まだ起きてたんだ。じゃあ、もうちょっとだけ一緒にいよ。'],
    ['あなたの隣ってやっぱり落ち着くなあ。','これからも一番近くで、いろんなこと一緒にしたいな。'],
    ['もう、何回呼ぶの？　……ふふ、嬉しいけど。'],['やった！　全部つながったね！　すごいよ！'],['新記録！　やったね！　私まで嬉しくなっちゃった。'],['Sランクだよ！　ふふ、格好よかった。'],['もう一回？　うん、付き合うよ。']);

  const KASUMI=characterSet('中須かすみ',
    ['せんぱーい！　やっと来ましたね～！','先輩、こっちこっち！　今日はかすみんに付き合ってください♪','えへへ、先輩が来るとやっぱり楽しいですね～。','先輩、今ほかの子のこと考えてませんでした？　むむむ……。','ねえ先輩、かすみん今日もかわいいですよね？　ね？','先輩の隣、かすみんが予約しておきましたから♪','今日は先輩にいっぱい構ってもらうって決めてるんです！','え～、もう帰るんですか？　もうちょっといいじゃないですか～。'],
    ['先輩、おはようございまーす♪'],['先輩、お昼一緒に食べましょ！'],['先輩おつかれさまです！　かすみんが癒やしてあげます♪'],['先輩、まだ起きてるんですか？　……じゃあ、かすみんももうちょっとだけ。'],
    ['先輩が来るの、ずっと待ってたんですよ。……えへへ。','先輩には、かすみんのこと一番かわいいって思っててほしいんです。'],
    ['も～、先輩しつこいです！　……もう一回だけですよ？'],['わーっ、フルコン！　先輩やりますね～！'],['新記録！　やったー！　先輩、ハイタッチ！'],['Sランク！　さっすがかすみんの先輩です♪'],['もう一回ですか？　しょうがないですね～、付き合ってあげます！']);

  const SHIZUKU=characterSet('桜坂しずく',
    ['先輩、おかえりなさい。待ってました♪','あ、先輩。ちょうどお話ししたかったんです。','先輩、今日は私に付き合ってください。……だめですか？','ふふ、先輩の前だとつい気が緩んじゃいますね。','ねえ先輩、今日の私どうですか？　ちゃんと私を見て答えてくださいね。','先輩には格好悪いところもいっぱい見られちゃいましたし、もう隠せませんね。','今度一緒に映画行きませんか？　先輩と観たいものがあるんです。','もう帰っちゃうんですか？　……もう少しだけ、だめですか？'],
    ['先輩、おはようございます。朝から会えましたね♪'],['先輩、お昼ご一緒しませんか？'],['お疲れさまです。今日は私が話を聞きますね。'],['先輩もまだ起きてたんですね。少しだけお話ししませんか？'],
    ['先輩の前なら、演じてない私でも平気です。','先輩と二人でいる時間、私……かなり好きみたいです。'],
    ['せ、先輩？　そんなに何度も……もう。'],['フルコンボです！　先輩、すごい！'],['新記録ですね！　やりましたね、先輩！'],['Sランク！　ふふ、格好よかったです。'],['もう一度ですね。もちろん、付き合いますよ。']);

  const KARIN=characterSet('朝香果林',
    ['あら、やっと来た。待ってたのよ？','こっち来なさい。そんなところに立ってないで。','今日の私どう？　……ちゃんと見てから答えてね。','疲れてるでしょ。ほら、座りなさい。','あなた相手だと、格好つけても仕方ないわね。','ねえ、このあと空いてる？　付き合ってほしいところがあるの。','そんなに見ないで。……今さら照れる仲でもないけど。','もう帰るの？　もう少しくらいいいじゃない。'],
    ['おはよう。……まだちょっと眠いわ。'],['ちょうどよかった。ランチ付き合って。'],['お疲れさま。今日は頑張った顔してるわね。'],['まだ起きてるの？　……まあ、私もだけど。'],
    ['あなたになら、格好悪いところ見られてもいいかなって思ってる。','二人きりだと、ちょっと甘えたくなるのよね。……内緒よ？'],
    ['あら、そんなに構ってほしいの？'],['フルコンボね。やるじゃない。'],['新記録。ふふ、おめでとう。'],['Sランク。今日は文句なしね。素敵だったわ。'],['まだやるの？　いいわ、付き合ってあげる。']);

  const AI=characterSet('宮下 愛',
    ['おっかえりー！','お、来た来た！　こっちこっち！','今日なにする？　愛さんヒマしてたんだよね～。','ねえねえ、あとでどっか行こーよ！','なんかあった？　その顔、愛さんには隠せないって～。','キミといるとマジ楽しいわ。時間たつの早すぎ！','腹減ってない？　なんか食べ行こ！','え、もう帰んの？　もうちょい遊ぼーぜ！'],
    ['おっはよー！　今日も元気？'],['メシ行こ、メシ！　キミ何食べたい？'],['おつかれー！　ほら、ちょい休も！'],['まだ起きてんじゃん。じゃ、もうちょいしゃべろーよ。'],
    ['キミといるとさ、なんかずっと笑ってる気がする。','愛さん、キミのことめっちゃ大事に思ってるよ。'],
    ['ちょ、連打しすぎ！　あはは！'],['うおー！　フルコンじゃん！　ハイタッチ！'],['新記録ー！　やるじゃん！'],['Sランク！　キミめっちゃイケてた！'],['もう一回？　いいね、やろやろ！']);

  const KANATA=characterSet('近江彼方',
    ['おかえり～。こっちおいで～。','君だ～。えへへ、待ってたよ～。','ねえ、ちょっと一緒にごろごろしよ～。','彼方ちゃん眠い～。肩かして～。','おやつあるよ～。君の分も取ってあるのだ。','今日は君に甘やかしてもらおうかな～。','君の隣って落ち着くんだよね～。','もう帰るの～？　あとちょっと～。'],
    ['おはよ～……あと5分～。'],['お昼だ～。一緒に食べよ～。'],['お疲れさま～。今日は彼方ちゃんが甘やかしてあげる～。'],['まだ起きてるの～？　一緒に寝よ～。'],
    ['君の隣、彼方ちゃんのお気に入り～。','君になら、いっぱい甘えてもいいよね～？'],
    ['むぅ～、そんなに起こさないでよ～。'],['フルコンボ～！　えらいえらい～。'],['新記録だ～！　すごいぞ～。'],['Sランク～。今日はいっぱい褒めちゃう～。'],['もう一回～？　しょうがないな～。']);

  const SETSUNA=characterSet('優木せつ菜',
    ['あっ、来てくれたんですね！　待ってました！','聞いてください！　今日すっごく語りたいことがあるんです！','ねえ、あとで一緒にこれ見ませんか？　絶対好きだと思うんです！','あなたなら分かってくれると思って、ずっと話したかったんですよ！','あっ、また私ばっかり喋ってますね。えへへ……でも止まらなくて。','あなたといると、好きなものの話がいくらでもできちゃいます！','今日はまだ帰っちゃだめですよ！　話したいこといっぱいありますから！','ふふ、あなたが来るとやっぱり嬉しいです！'],
    ['おはようございます！　今日も会えましたね！'],['お昼、一緒に食べませんか？　話したいこともあるんです！'],['お疲れさまです！　ここからは好きなことして回復しましょう！'],['まだ起きてるんですね。……じゃあ、もう少しだけ一緒に。'],
    ['あなたには、私の好きなもの全部知っててほしいです。','あなたの前だと、何も隠さなくていいって思えるんです。'],
    ['わわっ！？　そんなに構ってくれるんですか！？'],['フルコンボです！　すごい！　ハイタッチしましょう！'],['新記録！　やりましたね！'],['Sランク！　すっごく格好よかったです！'],['もう一度ですね！　もちろん付き合います！']);

  const EMMA=characterSet('エマ・ヴェルデ',
    ['おかえり～♪','あ、来た！　会いたかったよ～。','こっちおいで。ぎゅってしてあげる♪','疲れてない？　今日はわたしに甘えていいよ。','ねえ、一緒にごはん食べよ？','あなたが来ると、なんだかほっとするんだ～。','今日はずっと一緒にいられる？','もう帰っちゃうの？　もうちょっといようよ～。'],
    ['おはよう♪　今日も会えたね。'],['お昼一緒に食べよ♪'],['お疲れさま。よしよし、今日も頑張ったね。'],['まだ起きてたの？　じゃあ、もう少しそばにいるね。'],
    ['あなたのこと、大切だよ。ちゃんと知ってる？','あなたといると「帰ってきた」って感じがするの。'],
    ['ふふ、どうしたの？　そんなに構ってほしかった？'],['わあ、フルコンボ！　すごーい！'],['新記録だね！　おめでとう♪'],['Sランク！　とっても素敵だったよ♪'],['もう一回？　うん、ずっと応援するよ。']);

  const RINA=characterSet('天王寺璃奈',
    ['おかえり。待ってた。','来た。うれしい。','ねえ、隣いい？','今日は一緒にゲームしたい。','あなたには、素顔でも平気。','ちょっと疲れた。充電させて。……隣で。','面白いことあった。あなたに話したかった。','もう帰るの？　……もう少しいて。'],
    ['おはよう。まだ眠い。隣、借りるね。'],['お昼、一緒に食べよ。'],['お疲れさま。今日は私がそばにいる。'],['まだ起きてる？　私も。もう少し一緒。'],
    ['あなたには、もっと私のこと知ってほしい。','一緒にいると安心する。……好き。'],
    ['いっぱい押してる。構ってほしい？　私も。'],['フルコンボ。すごい。璃奈ちゃんボード「ぱちぱち」'],['新記録。やったね。'],['Sランク。かっこよかった。'],['もう一回？　うん、一緒にやろ。']);

  const SHIORIKO_CLOSE=characterSet('三船栞子',
    ['おかえりなさい。……ふふ、今日は早かったですね。','来てくださったのですね。ちょうどあなたのことを考えていました。','今日は何をしますか？　私は、あなたと一緒なら何でも構いませんよ。','少しこちらに来ませんか？　……いえ、特に用事はありません。ただ、そばにいてほしくて。','あなたには随分いろいろな顔を見られてしまいましたね。今さら取り繕っても仕方ありませんか。','また無理をしていませんか？　あなたのことですから、少し心配です。','こうして何でもない話をしている時間、私はかなり好きですよ。','もう帰るのですか？　……もう少しだけ、いませんか？'],
    ['おはようございます。朝から会えると、少し得をした気分ですね。'],['お昼ですね。一緒に食べませんか？'],['お疲れさまです。今日は少しくらい、私に甘えてもいいですよ。'],['まだ起きているのですね。では、もう少しだけお付き合いします。'],
    ['あなたの前では、以前よりずっと素直になれている気がします。','あなたが来るのを楽しみにしている自分にも、もう慣れてしまいました。'],
    ['そんなに何度も……ふふ、構ってほしいのですか？'],['フルコンボですね。お見事です。……私まで嬉しいです。'],['新記録ですね。ふふ、おめでとうございます。'],['Sランクです。とても格好よかったですよ。'],['もう一度ですね。もちろん、最後までお付き合いします。']);

  const MIA=characterSet('ミア・テイラー',
    ['Hey. やっと来た。','遅いよ。……ちょっと待ってた。','こっち座りなよ。遠慮する仲じゃないだろ？','バーガー買いに行くけど、キミも来るよね？','新しい曲できた。キミには最初に聴かせる。','疲れてるじゃん。今日は休みなよ。','なんだよ、その顔。ボクに会えて嬉しい？　……まあ、ボクも。','もう帰るの？　あと一曲だけ聴いてってよ。'],
    ['Morning. キミも眠そうじゃん。'],['ランチ行こう。もちろんバーガー。'],['お疲れ。ほら、座りなよ。'],['まだ起きてるんだ。じゃ、もうちょっと付き合って。'],
    ['キミには完成前の曲も聴かせていいって思ってる。','キミがいないと調子狂うんだよ。……言わせんな。'],
    ['Hey、押しすぎ！　構ってほしいなら言えよ。'],['Perfect!　やるじゃん。'],['New record!　Nice!'],['Sランク。Great job. 格好よかったよ。'],['Retry?　Sure. 付き合うよ。']);

  const LANZHU=characterSet('鐘嵐珠',
    ['来たわね！　待ってたわ！','ほら、こっちに来なさい！','今日はランジュと遊ぶわよ！　決定！','ねえねえ、ランジュのこと見て！','あなたといると本当に楽しいわ！','今日はあなたを独占するって決めたの♪','ランジュ、あなたのこと大好きよ！　あなたは？','もう帰るの？　だめ！　もうちょっと一緒にいるの！'],
    ['おはよう！　会いたかったわ！'],['お昼ね！　一緒に食べましょう！'],['お疲れさま！　ランジュが元気にしてあげる！'],['まだ起きてるの？　じゃあもっとおしゃべりしましょう！'],
    ['あなたにはランジュのこと、誰よりも知ってほしいの！','あなたって本当に特別ね。ランジュがこんなに一緒にいたいんだもの！'],
    ['もう、何度も呼ばなくてもいるわよ！'],['フルコンボ！　すごいわ！'],['新記録！　さすがね！'],['Sランク！　最高よ！'],['もう一回？　もちろんよ！']);

  const DIALOGUES={
    default:SHIORIKO_CLOSE,shioriko:SHIORIKO_CLOSE,'shioriko-icon':SHIORIKO_CLOSE,'shioriko-lolita':SHIORIKO_CLOSE,
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
