# AXNOS Paint 掲示板統合サンプル

あいもげにAXNOS Paintを統合するためのサンプルファイルです。

## ファイル構成

| ファイル | 説明 |
|---------|------|
| `oekaki.php` | お絵描きページ（新タブで開く） |
| `pc-paint-modal.js` | 親ページとの連携（postMessageで画像転送） |
| `paint-modal.php` | 親ページでincludeするファイル |

## 特徴

- **新タブ方式**: ポップアップブロッカーを回避
- **postMessage通信**: お絵描き完了時に親ページへ画像を自動転送
- **はっちゃん互換**: キャンバス要素に `id="oejs"` を自動設定
- **デフォルトカラー**: 背景色 `#F0E0D6`、描画色 `#800000`

## 使い方

### 1. ファイル配置

```
public/
├── pc/
│   └── oekaki.php
├── assets/
│   ├── js/
│   │   └── pc-paint-modal.js
│   └── axnospaint/
│       └── dist/
│           └── axnospaint-lib-2.4.0.min.js
└── views/
    └── paint-modal.php
```

### 2. 親ページでの読み込み

```php
<!-- お絵かき機能 -->
<?php include __DIR__ . '/../views/paint-modal.php'; ?>
```

### 3. お絵描きボタンの設置

```html
<button class="paint-btn" onclick="openPaintModal('reply')">お絵描き</button>
```

### 4. ファイルinputとプレビュー

```html
<input type="file" id="reply-upfile" name="upfile" accept="image/*">
<div id="reply-preview"></div>
```

## はっちゃん連携

AXNOSタブで「はっちゃん」ブックマークレットを実行すると、`#oejs` キャンバスを自動認識します。

## カスタマイズ

### デフォルトカラーを変更

`oekaki.php` の以下の部分を編集:

```javascript
axp.colorMakerSystem.setMainColor('#800000');  // 描画色
```

### パレットに色を追加

`dist/axnospaint-lib-2.4.0.min.js` のパレット配列を編集するか、ビルド前のソースを修正してください。

## ライセンス

MPL-2.0 (AXNOS Paint本体と同じ)
