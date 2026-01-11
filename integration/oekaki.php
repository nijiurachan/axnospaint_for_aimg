<?php
/**
 * お絵描きツール (AXNOS Paint)
 * ポップアップウィンドウで開き、完成した画像を親ウィンドウに送信
 */

// URLパラメータから初期サイズを取得
$width = isset($_GET['width']) ? intval($_GET['width']) : 600;
$height = isset($_GET['height']) ? intval($_GET['height']) : 400;

// サイズ制限
$width = max(100, min(1000, $width));
$height = max(100, min(1000, $height));

// 下書き画像のURL（編集モード用）
$draftImage = isset($_GET['draft']) ? htmlspecialchars($_GET['draft'], ENT_QUOTES, 'UTF-8') : null;
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
    <title>お絵かき - AI_BBS</title>
    <style>
        html, body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #2d2d2d;
        }
        #axnospaint_body {
            width: 100vw;
            height: 100vh;
        }
    </style>
</head>
<body>
    <div id="axnospaint_body"></div>
    <script>
        // ページ遷移防止
        window.onbeforeunload = function (event) {
            event.preventDefault();
            event.returnValue = "";
        };

        document.addEventListener("DOMContentLoaded", function () {
            var axp = new AXNOSPaint({
                // AXNOS Paintの画面を展開するdiv要素のid属性
                bodyId: 'axnospaint_body',
                // キャンバスサイズ設定
                minWidth: 100,
                minHeight: 100,
                maxWidth: 1000,
                maxHeight: 1000,
                width: <?php echo $width; ?>,
                height: <?php echo $height; ?>,
                <?php if ($draftImage): ?>
                // 下書き画像（編集モード）
                draftImageFile: '<?php echo $draftImage; ?>',
                <?php endif; ?>
                // 下書き機能の画像読込タイムアウト時間
                oekakiTimeout: 15000,
                // 同一掲示板チェック
                checkSameBBS: false,
                // 投稿タブを有効化
                restrictPost: false,
                // ヘッダーテキスト
                headerText: 'AI_BBS お絵かき',
                // ヘルプタブ
                expansionTab: {
                    name: 'ヘルプ',
                    msg: 'AXNOS Paint のヘルプを別タブで開きます。',
                    link: 'https://dic.nicovideo.jp/id/5703111',
                },
                // 投稿処理
                post: axnospaint_post,
                // 投稿フォームのカスタマイズ（フォームは非表示、画像のみ）
                postForm: {
                    input: {
                        isDisplay: false,
                    },
                    notice: {
                        isDisplay: false,
                    },
                },
            });

            // 起動後にデフォルトカラーを設定 & はっちゃん互換エイリアス追加
            setTimeout(function() {
                try {
                    // メインカラーを #800000 に設定
                    if (axp && axp.colorMakerSystem) {
                        axp.colorMakerSystem.setMainColor('#800000');
                    }
                    
                    // はっちゃん互換: キャンバス要素に id="oejs" を追加
                    var canvas = document.querySelector('#axnospaint_body canvas');
                    if (canvas) {
                        canvas.id = 'oejs';
                    }
                } catch (e) {
                    console.log('初期化エラー:', e);
                }
            }, 500);
        });

        // 投稿処理（親ウィンドウに画像を送信）
        function axnospaint_post(postObj) {
            return new Promise(function(resolve) {
                try {
                    // PNG画像のBase64データ
                    var imageData = postObj.strEncodeImg;
                    
                    if (!imageData) {
                        alert('画像データの取得に失敗しました。');
                        resolve();
                        return;
                    }

                    // ページ遷移防止を解除
                    window.onbeforeunload = null;

                    // 親ウィンドウに画像を送信
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage({
                            type: 'oekaki-image',
                            imageData: 'data:image/png;base64,' + imageData
                        }, '*');
                        
                        // ウィンドウを閉じる
                        setTimeout(function() {
                            window.close();
                        }, 100);
                    } else {
                        alert('親ウィンドウが見つかりません。画像を保存してください。');
                    }
                } catch (e) {
                    console.error('投稿エラー:', e);
                    alert('エラーが発生しました: ' + e.message);
                }
                resolve();
            });
        }
    </script>
    <script defer src="/assets/axnospaint/dist/axnospaint-lib-2.4.0.min.js"></script>
</body>
</html>
