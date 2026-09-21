# AR 08 assets

08番AR用の本番アセット格納先です。

配置するファイル:

```
08_target_800.mind
08_dance.mp4
```

- `08_target_800.mind` — 長辺800pxのターゲット画像から生成したMindARファイル
- `08_dance.mp4` — 左半分=RGB / 右半分=アルファマスクのSBS動画。音声はMP4内に含める

ページ:

```
/08/index.html
```

共通ランタイム:

```
/js/ar.js
```

固有の表示調整値（planeAspect / planeScale / brightness / missTolerance など）は、実機確認後に `/08/index.html` の `window.AR_CONFIG` へ追加する。
