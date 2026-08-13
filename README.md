# AR Acrylic Stand

アクリルスタンドをマーカーにして、その前で透過動画（キャラクターのダンスなど）が再生される画像マーカー型 AR デモです。
Three.js + [MindAR](https://github.com/hiukim/mind-ar-js) を使用し、ビルド不要・静的ファイルのみで動作します。

## 仕組み

- `assets/targets/targets.mind` を画像マーカーとして検出します（元画像は `assets/images/sample.jpg`）。
- マーカーを認識すると、その上に `assets/videos/dance.mp4`（サイドバイサイド形式の透過動画）の最初のフレームが静止画として表示され、中央に再生ボタン（赤丸+▷アイコン）が現れます。
- 再生ボタンをタップすると動画が音声付きで再生されます。ループはせず、再生が終わると自動的に最初のフレーム（静止画+再生ボタン）に戻ります。
- 動画は **左半分=RGB / 右半分=アルファマスク** のサイドバイサイド形式を想定しており、`js/main.js` のシェーダーで合成して透過再生します（しきい値はデフォルト `0.5`）。
- マーカーがフレームから外れると、動画はその時点で一時停止し、再度マーカーを認識すると静止画（最初のフレーム）にリセットされます。

## ディレクトリ構成

```
ar-acrylic-stand/
├── index.html              # エントリポイント
├── css/style.css
├── js/main.js              # MindAR + Three.js 本体
└── assets/
    ├── images/sample.jpg   # マーカー元画像（プレビュー用）
    ├── targets/targets.mind# MindAR 用マーカーファイル
    └── videos/dance.mp4    # サイドバイサイド形式の透過動画
```

## 必要なもの

- モダンブラウザ（カメラアクセスが必要なため **HTTPS** か `localhost` で開く必要があります）
- ローカル HTTP サーバー（後述のとおり Python / Node のどちらでも可）
- スマホ実機で確認する場合は [ngrok](https://ngrok.com/) （HTTPS トンネリング用）

## ローカルで起動する（PC のみ）

カメラ API は `localhost` でなら HTTP でも動作します。プロジェクトルートで任意の静的サーバーを起動してください。

Python の場合：

```bash
python3 -m http.server 8000
```

Node の場合：

```bash
npx serve -l 8000 .
```

ブラウザで [http://localhost:8000](http://localhost:8000) を開き、「タップして、アクリルスタンドをスキャンしよう」を押すとカメラが起動します。
マーカー（`assets/images/sample.jpg` を印刷したもの、もしくはアクリルスタンドの絵柄）にカメラを向けてください。

## スマホで動かす（ngrok）

スマホのブラウザは `localhost` を使えず、また **カメラ API は HTTPS が必須** です。
ngrok でローカルサーバーに HTTPS の公開 URL を割り当てて、スマホからアクセスします。

### 1. ngrok のセットアップ（初回のみ）

[ngrok 公式サイト](https://ngrok.com/download)からインストールし、アカウント取得後に authtoken を設定します。

```bash
brew install ngrok           # macOS の場合
ngrok config add-authtoken <あなたの authtoken>
```

### 2. ローカルサーバーを起動

プロジェクトルートで：

```bash
python3 -m http.server 8000
```

### 3. ngrok でトンネルを張る

別ターミナルで：

```bash
ngrok http 8000
```

`Forwarding` 行に表示される `https://xxxx-xxx-xxx-xxx-xxx.ngrok-free.app` のような URL がスマホからアクセスする URL です。

### 4. スマホで開く

- 表示された HTTPS URL をスマホのブラウザ（**iOS は Safari / Android は Chrome 推奨**）で開きます。
- QR コードで渡すと楽です（`ngrok` の Web UI [http://127.0.0.1:4040](http://127.0.0.1:4040) からも URL をコピーできます）。
- 初回アクセス時に ngrok の警告ページが表示される場合は「Visit Site」を押して進んでください。
- 「タップして、アクリルスタンドをスキャンしよう」を押し、カメラ利用を許可するとマーカー検出が始まります。
- マーカーを認識すると静止画+再生ボタンが表示されるので、タップすると動画が再生されます。

### うまく動かないときのチェックポイント

| 症状 | 確認すること |
| --- | --- |
| カメラが起動しない | URL が `https://` になっているか / ブラウザでカメラ権限を許可したか |
| iOS で映像が黒い | Safari で開いているか（Chrome for iOS など他ブラウザでは制限あり） |
| マーカーを認識しない | 印刷物の照明・ピント・歪みを確認、`targets.mind` を高解像度で再生成 |
| 動画が透過しない | 動画がサイドバイサイド形式（左:RGB / 右:アルファ）になっているか |
| 動画が再生されない | `assets/videos/dance.mp4` のパスとファイル形式（H.264 + AAC 推奨）を確認 |

## 素材を差し替える

### マーカー画像を変える

1. 高コントラスト・特徴点の多い画像を用意します（推奨：1024px 程度の JPG/PNG）。
2. [MindAR Image Compiler](https://hiukim.github.io/mind-ar-js-doc/tools/compile/) に画像をアップロードし、`.mind` ファイルをダウンロード。
3. `assets/targets/targets.mind` を上書きします。

### 動画を変える

`assets/videos/dance.mp4` を **左半分=RGB / 右半分=アルファマスク** のサイドバイサイド形式の MP4 に差し替えてください。
After Effects などからの書き出し例：

- 横幅 = 元動画の 2 倍
- 左半分にカラー、右半分にアルファ（白=不透明 / 黒=透明）のグレースケール

平面のアスペクト比は [js/main.js:74](js/main.js#L74) の `PlaneGeometry(1, 1.5)` を素材に合わせて調整してください。
透過のしきい値は [js/main.js:48](js/main.js#L48) の `alphaThreshold` で変更できます。
