(function () {
    // viewport変更
    changeViewport();

    // 複数タッチ禁止
    document.addEventListener('touchstart', function (event) {
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

    // 戻るボタン禁止
    history.pushState(null, null, null);
    window.addEventListener('popstate', function () {
        history.pushState(null, null, null);
    });

    // 初期処理
    fixedInit();
})();

/**
 * viewport変更
 * @function changeViewport
 * @returns {void}
 */
function changeViewport() {
    var base = 1366;
    var ua = navigator.userAgent.toLowerCase();
    var isiOS = (ua.indexOf('iphone') > -1) || (ua.indexOf('ipod') > -1) || (ua.indexOf('ipad') > -1);
    var width = (isiOS) ? document.documentElement.clientWidth / base : window.outerWidth / base;
    var viewport = 'width=device-width, initial-scale=' + width + ', maximum-scale=1, user-scalable=no, minimal-ui';
    document.querySelector('meta[name=viewport]').setAttribute('content', viewport);
}

/**
 * 券売機初期化
 * @function fixedInit
 * @returns {void}
 */
function fixedInit() {
    // 設定確認
    if (!(location.pathname.indexOf('/setting') > -1
        || location.pathname.indexOf('/stop') > -1)) {
        var data = localStorage.getItem('config');
        if (data === null) {
            // 設定なければリダイレクト
            location.href = '/stop';
            return;
        }
        window.config = JSON.parse(data);
    }
}
