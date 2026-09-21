# AR Pair 04-05 assets

pair-04-05 用ARの本番アセット格納先です。

配置するファイル:

```
pair-04-05_target_800.mind
pair-04-05_dance.mp4
```

- `pair-04-05_target_800.mind` — 配置状態のターゲット画像から生成したMindARファイル
- `pair-04-05_dance.mp4` — 左半分=RGB / 右半分=アルファマスクのSBS動画。音声はMP4内に含める

ページ:

```
/pair-04-05/index.html
```

共通ランタイム:

```
/js/ar.js
```

固有の表示調整値（planeAspect / planeScale / brightness / missTolerance など）は、実機確認後に `/pair-04-05/index.html` の `window.AR_CONFIG` へ追加する。
