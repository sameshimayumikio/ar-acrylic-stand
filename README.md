# Ubiquitous DENGEI — AR Acrylic Stand

「ユビキタス伝芸シリーズ／野行の宝財踊り」のWebAR実装用リポジトリです。

アクリルスタンドそのものを画像ターゲットとして認識し、対応する透過動画をWebAR上で再生します。  
実装は **MindAR + Three.js**、公開は **GitHub Pages** を使用します。

## AR構成

最終構成は14種類です。

- 単体10種: `/01/` ～ `/10/`
- ペア3種: `/pair-02-03/`、`/pair-04-05/`、`/pair-07-10/`
- 全員集合1種: `/all/`

各URLは独立したAR入口です。

## 現在の実装

### 単体AR

単体10種は共通ランタイム

```
js/ar.js
```

を使用します。

認識後は動画の先頭フレームと再生ボタンを表示し、ユーザーのタップで再生します。

- 動画は非ループ
- マーカーを見失うと一時停止
- 再認識時は先頭フレームへ戻る
- SBS動画をThree.jsシェーダーで透過合成

各ページの `window.AR_CONFIG` で以下を個別調整します。

- `planeAspect` — 表示動画の縦横比
- `planeScale` — 表示サイズ
- `brightness` — 明るさ

### ペアAR

ペア3種は共通ランタイム

```
js/ar-pair-two-targets.js
```

を使用します。

2体を1枚の画像として認識する方式ではなく、**2体を別々のターゲットとして同時に認識する方式**です。

- `maxTrack: 2`
- 2体とも認識したときだけペアARを表示
- target A を位置・向き・大きさの基準にする
- target B は「もう1体も存在する」ことの確認用
- 2体の座標やスケールは平均しない

現在の基準ターゲットは以下です。

- 02 + 03 → 02がtarget A
- 04 + 05 → 04がtarget A
- 07 + 10 → 07がtarget A

ペアページでは単体の調整値に加えて、

- `planeOffsetX` — 左右位置（マイナス=左、プラス=右）
- `planeOffsetY` — 上下位置（プラス=上、マイナス=下）

を使用します。

## MindAR

MindAR **1.2.5ベースのカスタム版**を使用しています。  
全14ページはローカルの

```
vendor/relaxed/mindar-image-three.prod.js
```

を読み込みます。

認識条件は以下へ調整済みです。

```
HAMMING_THRESHOLD = 0.80
MIN_NUM_INLIERS    = 5
INLIER_THRESHOLD   = 4
```

アプリ側の共通トラッキング設定は以下です。

```
warmupTolerance = 0
missTolerance   = 30
filterMinCF     = 0.00001
filterBeta      = 0.001
```

カスタム版の再ビルド用Workflow:

```
.github/workflows/build-mindar-relaxed.yml
```

## ターゲット作成ルール

### 単体

標準ターゲット画像:

- 透過PNG
- 元画像の縦横比を維持
- 人物と実際の小道具を含む
- 長辺800px
- 人物ぎりぎりに近い切り抜き + わずかな透明余白

MindAR Image Target Compilerでコンパイルし、

```
assets/XX/XX_target_800.mind
```

として配置します。

800pxで認識が弱い個体のみ、600pxまたは1000pxを個別検証します。

### ペア

各人物のターゲット画像2枚を、**MindAR Image Target Compilerへ同時に入れて1つの .mind にコンパイル**します。

画像を入れる順番:

- 02 → 03
- 04 → 05
- 07 → 10

生成ファイル:

```
assets/pair-02-03/pair-02-03_targets.mind
assets/pair-04-05/pair-04-05_targets.mind
assets/pair-07-10/pair-07-10_targets.mind
```

先に入れた画像がtarget A（index 0）、次がtarget B（index 1）です。

## 動画仕様

動画はSBS形式のMP4です。

- 左半分: RGB映像
- 右半分: アルファマスク
- 音声: MP4内に含める
- ループ: しない
- 再生終了後: 先頭フレームへ戻る

`planeAspect` はRGB側の実寸比に合わせて各ページで設定します。

## 現在のアセット状況

| AR | .mind | MP4 |
|---|---|---|
| 01 | 配置済み | 配置済み |
| 02 | 配置済み | 配置済み |
| 03 | 配置済み | 配置済み |
| 04 | 配置済み | 配置済み |
| 05 | 配置済み | 配置済み |
| 06 | 配置済み | 未配置 |
| 07 | 配置済み | 未配置 |
| 08 | 配置済み | 未配置 |
| 09 | 配置済み | 未配置 |
| 10 | 配置済み | 未配置 |
| pair-02-03 | 2ターゲット版配置済み | 配置済み |
| pair-04-05 | 2ターゲット版配置済み | 未配置 |
| pair-07-10 | 2ターゲット版配置済み | 未配置 |
| all | 未配置 | 未配置 |

## ディレクトリ構成

```
ar-acrylic-stand/
├── 01/ ～ 10/
│   └── index.html
├── pair-02-03/
│   └── index.html
├── pair-04-05/
│   └── index.html
├── pair-07-10/
│   └── index.html
├── all/
│   └── index.html
├── assets/
│   ├── 01/ ～ 10/
│   ├── pair-02-03/
│   ├── pair-04-05/
│   ├── pair-07-10/
│   └── all/
├── css/
│   └── style.css
├── js/
│   ├── ar.js
│   └── ar-pair-two-targets.js
├── vendor/
│   └── relaxed/
├── .github/
│   └── workflows/
│       └── build-mindar-relaxed.yml
└── README.md
```

## 使用ライブラリ

- Three.js 0.160.0
- MindAR 1.2.5ベースのカスタム版
- GitHub Pages

## バックアップ

初期の動作デモは

```
demo-working-v1
```

ブランチに保存しています。  
`main` は現在の本番制作・調整用です。
