# Ubiquitous DENGEI — AR Acrylic Stand

「ユビキタス伝芸シリーズ／野行の宝財踊り」のWebAR実装用リポジトリです。

アクリルスタンドそのものを画像マーカーとして認識し、その人物に対応した透過動画をWebAR上で再生します。  
実装は **MindAR + Three.js**、公開は **GitHub Pages** を使用します。

---

## 現在の状態

**05番のARが完成済み**です。  
01〜04・06〜10番については、05と同じ共通JSを使用するページ構造とアセット格納先まで作成済みです。各番号の `.mind` とMP4を配置し、個別調整値を確認すれば実装を進められます。

完成済み05の公開URL:

```
https://sameshimayumikio.github.io/ar-acrylic-stand/05/
```

05番では以下が実装・確認済みです。

- アクスタ画像をMindARの画像ターゲットとして認識
- 認識後に動画の先頭フレームを表示
- 再生ボタンをタップして動画再生
- 音声はMP4内に含める
- 動画は非ループ
- マーカーを見失うと一時停止
- 再認識時は先頭フレームに戻す
- SBS動画（左半分=RGB / 右半分=アルファマスク）をThree.jsシェーダーで透過合成

---

## 最終AR構成

最終的に14種類のARを個別URLで用意します。

### 単体 10種

```
/01/
/02/
/03/
/04/
/05/
/06/
/07/
/08/
/09/
/10/
```

### ペア 3種

```
/pair-02-03/
/pair-04-05/
/pair-07-10/
```

### 集合 1種

```
/all/
```

各URLはそれぞれ独立したAR入口とし、共通の切り替え画面は使用しません。

---

## 共通実装

AR本体の処理は、

```
js/ar.js
```

に共通化しています。

各ARページでは、`window.AR_CONFIG` にそのAR固有の値だけを指定します。

例：05番

```js
window.AR_CONFIG = {
  imageTargetSrc: '../assets/05/05_target_800.mind',
  videoSrc: '../assets/05/05_dance.mp4',
  planeAspect: 1.4407,
  planeScale: 1.4,
  brightness: 1.2,
  missTolerance: 20
};
```

これにより、今後14パターンに増えてもAR本体のロジックは1か所で管理できます。

---

## 現在のディレクトリ構成

単体10種について、ページとアセット用フォルダを準備済みです。

```
ar-acrylic-stand/
├── 01/
│   └── index.html
├── 02/
│   └── index.html
├── 03/
│   └── index.html
├── 04/
│   └── index.html
├── 05/
│   └── index.html
├── 06/
│   └── index.html
├── 07/
│   └── index.html
├── 08/
│   └── index.html
├── 09/
│   └── index.html
├── 10/
│   └── index.html
├── assets/
│   ├── 01/
│   │   └── README.md
│   ├── 02/
│   │   └── README.md
│   ├── 03/
│   │   └── README.md
│   ├── 04/
│   │   └── README.md
│   ├── 05/
│   │   ├── 05_target_800.mind
│   │   ├── 05_dance.mp4
│   │   └── README.md
│   ├── 06/
│   │   └── README.md
│   ├── 07/
│   │   └── README.md
│   ├── 08/
│   │   └── README.md
│   ├── 09/
│   │   └── README.md
│   └── 10/
│       └── README.md
├── css/
│   └── style.css
├── js/
│   └── ar.js
└── README.md
```

01〜04・06〜10番の各ページは、対応する以下のファイルを参照する構造です。

```
assets/XX/XX_target_800.mind
assets/XX/XX_dance.mp4
```

05以外の固有調整値（`planeAspect` / `planeScale` / `brightness` / `missTolerance` など）はまだ固定せず、各ARの実機確認後に追加します。

ペア3種と集合1種は、単体10種の調整後に同じ考え方で追加します。

---

## MindARターゲット画像の作成ルール

人物単体のターゲット画像は、以下を標準とします。

- 形式：透過PNG
- 縦横比：元画像を維持
- 人物・小道具を含む
- **長辺800px**
- ファイル名例：`05_target_800.png`
- MindAR Image Target Compilerで `.mind` を生成

生成後のファイル名例：

```
05_target_800.mind
```

### 800pxを標準にする理由

元の2000px級画像では認識しにくいケースがありましたが、縮小すると安定して認識しました。  
05番では長辺600 / 800 / 1000pxを比較し、いずれも安定して認識できました。

そのため、800pxを「理論上の最適値」とはせず、**運用上の共通標準値**として採用します。  
800pxで認識が弱い個体が出た場合のみ、600pxまたは1000pxを個別検証します。

---

## 動画仕様

動画はSBS形式のMP4です。

- 左半分：RGB映像
- 右半分：アルファマスク
- 音声：MP4内に含める
- ループ：しない
- 再生終了後：先頭フレームへ戻る

Three.jsのシェーダーで左右を合成し、透過動画として表示します。

各ARの動画ファイル名は、

```
01_dance.mp4
02_dance.mp4
...
10_dance.mp4
```

を基本とします。

---

## 使用ライブラリ

現在の完成05では以下を使用しています。

- Three.js 0.160.0
- MindAR 1.2.5
- GitHub Pages

共通ARページのimport mapからCDN版を読み込みます。

---

## 05番の現在設定

```
target        assets/05/05_target_800.mind
video         assets/05/05_dance.mp4
planeAspect   1.4407
planeScale    1.4
brightness    1.2
missTolerance 20
alphaThreshold 0.5
```

この05を、今後作る他のARの基準実装とします。

---

## バックアップ

初期の動作デモはGitHubの

```
demo-working-v1
```

ブランチに保存しています。

そのため、mainブランチは本番用の構造に整理し、旧テストファイルや旧デモ一式は保持しません。
