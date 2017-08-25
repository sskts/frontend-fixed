(function () {
    // viewport変更
    changeViewport();

    // 複数タッチ禁止
    document.addEventListener('touchstart', function (event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });

    // ダブルタップ禁止
    var lastTouch = 0;
    document.addEventListener('touchend', function (event) {
        var now = window.performance.now();
        if (now - lastTouch <= 500) {
            event.preventDefault();
        }
        lastTouch = now;
    });

    // 戻るボタン禁止
    history.pushState(null, null, null);
    window.addEventListener('popstate', function () {
        history.pushState(null, null, null);
    });

    // 初期処理
    fixedInit();
})();

$(function () {
    // ナビゲーション
    navigationInit();
    // 自動TOP遷移
    autoTop();
    $(document).on('click', '.ticketing-button a', function (event) {
        event.preventDefault();
        location.href = '/inquiry/login?theater=' + window.config.theater;
    })
});

/**
 * ナビゲーション設定
 * @function navigationInit
 * @returns {void}
 */
function navigationInit() {
    if ($('.purchase-seat, .purchase-ticket, .purchase-input, .purchase-confirm').length > 0) {
        $('.navigation .top-button a').attr({
            href: '#',
            'data-modal': 'backToTop'
        });
    }
}

/**
 * viewport変更
 * @function changeViewport
 * @returns {void}
 */
function changeViewport() {
    var base = 1024;
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
        var parseData = JSON.parse(data);
        if (parseData.device_id) {
            // 一時対応
            var changeData = {
                deviceId: parseData.device_id,
                givenName: parseData.first_name_hira,
                familyName: parseData.last_name_hira,
                email: parseData.mail_addr,
                printer: parseData.printer,
                theater: parseData.theater
            }
            localStorage.setItem('config', JSON.stringify(changeData));
            window.config = changeData;
        } else {
            window.config = JSON.parse(data);
        }
    }
}

/**
 * 自動TOP遷移
 * @function autoTop
 * @return {void}
 */
function autoTop() {
    if ($('.purchase-performances').length === 1) {
        return;
    }
    var controlTime = 1000 * 60 * 5;
    var timeFunction = function () {
        window.timer = setTimeout(function () {
            location.href = '/';
        }, controlTime);
    }
    timeFunction();
    // 自動TOP遷移
    $(document).on('touchstart', function (event) {
        clearTimeout(window.timer);
        timeFunction();
    });
    $(document).on('touchend', function (event) {
        clearTimeout(window.timer);
        timeFunction();
    });
}
