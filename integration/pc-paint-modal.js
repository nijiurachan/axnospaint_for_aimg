/**
 * お絵描き機能（AXNOS Paint版）
 * 新しいタブでお絵かきし、完了時に画像を添付
 */
var currentPaintTarget = null;
var oekakiWindow = null;

/**
 * お絵かきページを新タブで開く
 * @param {string} target - 'thread' または 'reply'
 */
function openPaintModal(target) {
    currentPaintTarget = target;

    // 既に画像が添付されている場合は編集モードで開く
    var existingImageUrl = getExistingImageUrl(target);
    
    var width = 600;
    var height = 400;
    var url = '/pc/oekaki.php?width=' + width + '&height=' + height;
    
    if (existingImageUrl) {
        url += '&draft=' + encodeURIComponent(existingImageUrl);
    }

    // 新しいタブで開く（ポップアップブロッカー回避）
    oekakiWindow = window.open(url, '_blank');

    if (!oekakiWindow) {
        alert('タブを開けませんでした。ポップアップブロッカーを確認してください。');
        return;
    }
}

/**
 * 既存の添付画像のURLを取得
 * @param {string} target - 'thread' または 'reply'
 * @returns {string|null}
 */
function getExistingImageUrl(target) {
    // プレビュー画像をチェック
    var previewImg = document.querySelector('#' + target + '-preview img');
    if (previewImg && previewImg.src && previewImg.src.startsWith('data:image')) {
        return previewImg.src;
    }
    return null;
}

/**
 * お絵かきタブからのメッセージを受信
 */
window.addEventListener('message', function(event) {
    // セキュリティ: 同一オリジンチェック
    if (event.origin !== window.location.origin) {
        return;
    }

    if (event.data && event.data.type === 'oekaki-image') {
        handleOekakiImage(event.data.imageData);
    }
});

/**
 * お絵かき画像を受け取って添付
 * @param {string} imageDataUrl - data:image/png;base64,... 形式の画像データ
 */
function handleOekakiImage(imageDataUrl) {
    if (!currentPaintTarget || !imageDataUrl) {
        return;
    }

    try {
        // Data URLをBlobに変換
        var byteString = atob(imageDataUrl.split(',')[1]);
        var mimeString = imageDataUrl.split(',')[0].split(':')[1].split(';')[0];
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        var blob = new Blob([ab], { type: mimeString });

        // ファイルオブジェクトを作成
        var timestamp = new Date().getTime();
        var file = new File([blob], 'oekaki_' + timestamp + '.png', { type: 'image/png' });

        // ターゲットのファイルinputに設定
        var fileInput = document.getElementById(currentPaintTarget + '-upfile');
        if (fileInput) {
            var dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            fileInput.removeAttribute('required');

            // プレビューを更新
            updatePreview(currentPaintTarget, imageDataUrl);
        }

        alert('お絵かき画像を添付しました！');
    } catch (e) {
        console.error('お絵かき画像の処理エラー:', e);
        alert('画像の処理に失敗しました: ' + e.message);
    }

    currentPaintTarget = null;
    oekakiWindow = null;
}

/**
 * プレビュー画像を更新
 * @param {string} target - 'thread' または 'reply'
 * @param {string} imageDataUrl - 画像のDataURL
 */
function updatePreview(target, imageDataUrl) {
    var previewContainer = document.getElementById(target + '-preview');
    if (!previewContainer) {
        return;
    }

    // 既存のプレビューをクリア
    previewContainer.innerHTML = '';

    // 新しいプレビュー画像を追加
    var img = document.createElement('img');
    img.src = imageDataUrl;
    img.style.maxWidth = '200px';
    img.style.maxHeight = '200px';
    img.style.objectFit = 'contain';
    img.style.cursor = 'pointer';
    img.title = 'クリックで編集';
    img.onclick = function() {
        if (confirm('画像を編集しますか？')) {
            openPaintModal(target);
        }
    };
    previewContainer.appendChild(img);
    previewContainer.style.display = 'block';
}

/**
 * 添付画像を編集する機能
 * @param {string} target - 'thread' または 'reply'
 */
function editAttachedImage(target) {
    openPaintModal(target);
}

/**
 * プレビュー画像をクリックして編集する機能を追加
 */
function setupPreviewEdit() {
    document.querySelectorAll('.preview-container, .file-preview').forEach(function(preview) {
        if (preview.dataset.editSetup) return;
        preview.dataset.editSetup = 'true';

        preview.addEventListener('click', function(e) {
            // 既に画像がある場合のみ
            var img = preview.querySelector('img');
            if (!img || !img.src || img.src.includes('placeholder')) return;

            // targetを特定
            var target = preview.id.replace('-preview', '');
            if (!target) {
                // idから推測
                var form = preview.closest('form');
                if (form && form.id) {
                    target = form.id.replace('-form', '');
                }
            }

            if (target && confirm('画像を編集しますか？')) {
                openPaintModal(target);
            }
        });

        preview.style.cursor = 'pointer';
        preview.title = 'クリックで編集';
    });
}
