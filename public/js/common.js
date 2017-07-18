var SASAKI = {};

$(function () {
    if (!isFixed()) {
        settingValidation();
    }
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
 * アプリ判定
 * @function isApp
 * @returns {boolean} 
 */
function isApp() {
    return $('body').hasClass('app');
}

/**
 * 券売機判定
 * @function isFixed
 * @returns {boolean} 
 */
function isFixed() {
    return $('body').hasClass('fixed');
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
    setTimeout(function() {
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

/**
 * 時間フォーマット
 * @function timeFormat
 * @param {string} str
 * @returns {string}
 */
function timeFormat(str) {
    if (typeof str !== 'string') {
        return '';
    }
    const start = 2;
    const end = 4;
    return str.slice(0, start) + ':' + str.slice(start, end);
}

/**
 * QRコード生成
 * @function createQRCode
 * @param {string} url QRコードURL
 * @param {any} options オプション
 * @param {number} options.width 幅
 * @param {number} options.height 高さ
 * @param {string} options.alt alt
 * @param {string} options.ext 形式
 * @returns {HTMLImageElement} QR画像
 */
function createQRCode(url, options) {
    options = options || {};
    var width = (options.width !== undefined) ? options.width : 100;
    var height = (options.height !== undefined) ? options.height : 100;
    var alt = (options.alt !== undefined) ? options.alt : '';
    var ext = (options.ext !== undefined) ? options.ext : 'png';
    // QR
    var qr = new VanillaQR({
        url: url,
        width: width,
        height: height,
        colorLight: '#FFF',
        colorDark: '#000',
        noBorder: true
    });
    var image = qr.toImage(ext);
    image.width = width;
    image.height = height;
    image.alt = alt;
    return image;
}
