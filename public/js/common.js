var SASAKI = {};
$(function () {
    settingValidation();
    $(document).on('click', '.prev-button button', function (event) {
        event.preventDefault();
        
    });
});

/**
 * サーバーバリデーション時設定
 */
function settingValidation() {
    $('.validation-text').each(function (index, elem) {
        var target = $(elem).prev('input');
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
 */
function toHalfWidth(value) {
    return value.replace(/./g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

/**
 * 半角=>全角
 */
function toFullWidth(value) {
    return value.replace(/./g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) + 0xFEE0);
    });
}

/**
 * カンマ区切りへ変換
 */
function formatPrice(price) {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/**
 * 高さ統一
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
 */
function loadingStart(_cb) {
    $('.loading-cover').addClass('active');
    $('.loading').addClass('active');
    $('.wrapper').addClass('blur');
    setTimeout(function() {
        if (_cb) _cb();
    }, 1000);
}

/**
 * ローディングエンド
 */
function loadingEnd() {
    $('.loading-cover').removeClass('active');
    $('.loading').removeClass('active');
    $('.wrapper').removeClass('blur');
}

