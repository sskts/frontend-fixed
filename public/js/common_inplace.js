var SASAKI = {};

$(function () {
    scaleSetting();
    settingValidation();
    /**
     * 戻るクリックイベント
     */
    $(document).on('click', '.prev-button button', function (event) {
        event.preventDefault();
    });
    /**
     * 閉じるクリックイベント
     */
    $(document).on('click', '.window-close', function (event) {
        event.preventDefault();
        window.close();
    });
});

/**
 * 画面スケール設定 
 * @function scaleSetting
 * @returns {void}
 */
function scaleSetting() {
    var target = $('.contents');
    var ratio = { w: 1366, h: 1024 };
    var scale = $(window).width() / ratio.w;
    target.css({
        transformOrigin: '0 0',
        transform: 'scale(' + scale + ')'
    });
}

/**
 * サーバーバリデーション時設定
 * @function settingValidation
 * @returns {void}
 */
function settingValidation() {
    $('.validation-text').each(function (index, elem) {
        if ($(elem).hasClass('expire')) {
            var target = $('select[name=credit_month], select[name=credit_year]');
        } else {
            var target;
            if ($(elem).prev('input').length > 0) {
                target = $(elem).prev('input');
            } else {
                target = $(elem).prev('label');
            }
        }
        target.addClass('validation');
    });
    if ($('.validation-text').length > 0) {
        var target = $('.validation').eq(0);
        var top = target.offset().top - 20;
        $('html,body').animate({ scrollTop: top }, 300);
        return;
    }
}

/**
 * 全角=>半角
 * @function toHalfWidth
 * @param {string} value
 * @returns {string}
 */
function toHalfWidth(value) {
    return value.replace(/./g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

/**
 * 半角=>全角
 * @function toFullWidth
 * @param {string} value
 * @returns {string}
 */
function toFullWidth(value) {
    return value.replace(/./g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });
}

/**
 * カンマ区切りへ変換
 * @function formatPrice
 * @param {number} price
 * @returns {string}
 */
function formatPrice(price) {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/**
 * 高さ統一
 * @function heightFix
 * @returns {void}
 */
function heightFix() {
    $('.heighfix-group').each(function (index, elem) {
        var h = 0;
        $('.heighfix').each(function (index2, elem2) {
            $(elem2).height('auto');
            var tmpH = $(elem2).height();
            if (h < tmpH) {
                h = tmpH;
            }
        });
        $(elem).find('.heighfix').height(h);
    });
}

/**
 * ローディングスタート
 * @function loadingStart
 * @param {function} cb
 * @returns {void}
 */
function loadingStart(cb) {
    $('.loading-cover').addClass('active');
    $('.loading').addClass('active');
    $('.wrapper').addClass('blur');
    setTimeout(function () {
        if (cb) cb();
    }, 1000);
}

/**
 * ローディングエンド
 * @function loadingEnd
 * @returns {void}
 */
function loadingEnd() {
    $('.loading-cover').removeClass('active');
    $('.loading').removeClass('active');
    $('.wrapper').removeClass('blur');
}

/**
 * パラメーター取得
 * @returns {any}
 */
function getParameter() {
    var result = {};
    var params = location.search.replace('?', '').split('&');
    var transactionId = null;
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split('=');
        var key = param[0];
        var value = param[1];
        if (key && value) {
            result[key] = value;
        }
    }
    return result;
}
