// 複数タッチ禁止
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
}, true);

// ダブルタップ禁止
var lastTouch = 0;
document.addEventListener('touchend', function (event) {
    var now = window.performance.now();
    if (now - lastTouch <= 500) {
        event.preventDefault();
    }
    lastTouch = now;
}, true);

inplaceInit();

/**
 * 券売機初期化
 * @function inplaceInit
 * @returns {void}
 */
function inplaceInit() {
    // 設定確認
    if (!(location.pathname.indexOf('/setting') > -1 
    || location.pathname.indexOf('/stop') > -1)) {
        var data = localStorage.getItem('config');
        if (data === null) {
            // 設定なければリダイレクト
            location.replace = '/stop';
            return;
        }
        window.config = JSON.parse(data);
    }
}