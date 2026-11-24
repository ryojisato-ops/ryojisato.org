<!-- author_agent: Claude Code — role: instruction — date: 2026-11-24 — RJ 依頼(次回ローカルのセッションで実施するため) -->
# Google 検索に載せるための作業手順（ローカルセッション用）

RJ の Mac で動く Claude Code が、ブラウザ（Claude in Chrome か内蔵ブラウザ）を操作して進めるための手順書です。RJ がやるのはログインと、変更を保存してよいかの判断だけで済むように書いてあります。

## これまでに分かっていること（2026-11-24、クラウドセッションで確認）

- サイトの技術面には問題がない。本番の各ページ・`robots.txt`・`sitemap.xml` はすべて 200 を返す。`www.ryojisato.org` と `ryojisato-ops.github.io/ryojisato.org/` は `https://ryojisato.org/` へ 301 で転送される。`noindex` は 404 ページだけで、canonical も正しい。
- 配信は Cloudflare（DNS とプロキシ）経由の GitHub Pages。
- 検索に出ない原因は、公開から日が浅いこと（実際のデプロイは 2026-10-17 から）、外部からのリンクがないこと、Search Console に登録していない（とみられる）ことの3つ。
- 構造化データ（JSON-LD）を足す PR は [ryojisato-ops/ryojisato.org#11](https://github.com/ryojisato-ops/ryojisato.org/pull/11) にある（draft、未 merge）。この手順書も同じ PR に入っている。インデックス登録は PR #11 の merge を待たずに進めてよい。

## エージェントが守ること

- パスワード・2段階認証・ログインは RJ が自分で入力する。エージェントは入力欄に触らない。
- DNS レコードの追加、プロフィールの保存など、外に出る変更は、保存の前に内容を RJ に見せて了承を得る。
- Cloudflare のセキュリティ設定は、確認だけで変更しない。変える必要がありそうなら、理由を添えて RJ に提案する。
- PR の merge と main への push は、RJ の明示的な指示があるときだけ（`CLAUDE.md` を参照）。
- 作業記録に、アカウント名・メールアドレス・確認コードを書かない。

## 手順

### 1. Search Console にドメインを登録する

1. <https://search.google.com/search-console> を開く。RJ が Google アカウントでログインする。
2. 「プロパティを追加」で **ドメイン** を選び、`ryojisato.org` を入れる（URL プレフィックスではなくドメインにする。www・http・https を一度にまとめて扱えるため）。
3. 所有権の確認には DNS の TXT レコードを使う。
   - Cloudflare での自動確認が出てきたら、それを使ってよい。Cloudflare 側の承認画面の内容を、RJ に見せてから進める。
   - 自動確認が出なければ、Cloudflare のダッシュボードで ryojisato.org → DNS → レコードを追加。種類は `TXT`、名前は `@`、内容は Search Console に表示された `google-site-verification=…` をそのまま入れる。既存のレコードには触らない。保存の前に RJ の了承を得る。
4. Search Console に戻って「確認」を押す。DNS の反映待ちで失敗したら、数分おいてもう一度押す。

### 2. sitemap を送る

Search Console の「サイトマップ」で `https://ryojisato.org/sitemap.xml` を送信する。状態が「成功しました」になり、検出されたページ数が 15 になることを確かめる。

### 3. 主なページのインデックス登録をリクエストする

Search Console 上部の URL 検査に、次の URL を順に入れる。

1. `https://ryojisato.org/`
2. `https://ryojisato.org/about/`
3. `https://ryojisato.org/books/free-energy-principle/`
4. `https://ryojisato.org/en/`
5. `https://ryojisato.org/research/`

URL ごとに、まず「公開 URL をテスト」を押し、取得できたことを確かめる。**ここで取得に失敗したら、Cloudflare が Googlebot を弾いている可能性がある**ので、手順 4 に進む。成功したら「インデックス登録をリクエスト」を押す。1日にリクエストできる数には上限があるので、上限に当たったら翌日に続きをやる。

### 4. Cloudflare の設定を確かめる（確認だけ）

手順 3 のテストがすべて通ったら、ここは省いてよい。

- Security → Bots：Bot Fight Mode などがオンかどうかを見る。Cloudflare は、確認済みのボット（Googlebot を含む）を通す仕様になっている。
- Security → WAF：カスタムルールやレート制限が、ボットや海外からのアクセスを止めていないかを見る。
- AI クローラーのブロック設定や「管理された robots.txt」：オンのとき、本番の `robots.txt` がリポジトリの `dist/robots.txt` と違っていないかを確かめる（2026-11-24 時点では同じだった）。

気になる設定があれば、変更はせずに RJ に報告する。

### 5. 外部からリンクを張る

Google がよく巡回するページから ryojisato.org にリンクを張る。それぞれ保存の前に RJ の了承を得る。

- **researchmap**（<https://researchmap.jp/ryoji-sato>）：RJ がログインし、プロフィールの URL（ホームページ）欄に `https://ryojisato.org/` を入れる。
- **ORCID**（<https://orcid.org/0009-0002-4783-7126>）：RJ がログインし、「Websites & social links」に `https://ryojisato.org/` を足す。
- **大学の教員紹介**（<https://www.tmu.ac.jp/stafflist/data/sa/24048.html>）：自分で編集できるかは不明。できないなら、大学の担当部署に依頼する文面の案を作って RJ に渡す。

画面の作りが上の説明と違っていたら、実際の画面に合わせ、何が違ったかを RJ に報告する。

### 6. 任意：Bing にも登録する

<https://www.bing.com/webmasters> では、Search Console からサイトを取り込める。RJ が望むときだけ行う。

## 終わったあとの確認

- 数日から数週間たってから、Google で `site:ryojisato.org` を検索して、ページが出てくるかを見る。
- PR #11 が merge されたら、Search Console の URL 検査か <https://search.google.com/test/rich-results> で、トップページの構造化データ（`Person`・`WebSite`）が検出されるかを見る。
- 結果を RJ に報告する。この手順書の内容が実際と違っていたら、直す案をブランチで出す。
