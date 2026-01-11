<?php
/**
 * お絵描き機能（AXNOS Paint版）
 * 新しいタブでお絵かきし、完了時に画像を添付
 */
?>
<script src="/assets/js/pc-paint-modal.js?v=1"></script>
<script>
// ページ読み込み時にプレビュー編集機能をセットアップ
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(setupPreviewEdit, 500);
});
</script>
