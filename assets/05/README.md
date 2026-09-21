# AR 05 assets

05番ARの本番用アセットです。

## 使用中ファイル

```
05_target_800.mind
05_dance.mp4
```

- `05_target_800.mind`  
  05番アクリルスタンド用のMindAR画像ターゲット。長辺800pxの透過PNGから生成。

- `05_dance.mp4`  
  左半分=RGB / 右半分=アルファマスクのSBS動画。音声はMP4内に含む。

## 実装

ページ:

```
/05/index.html
```

共通ランタイム:

```
/js/ar.js
```

05固有設定:

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

05番を、今後の単体・ペア・集合ARの基準実装とする。
