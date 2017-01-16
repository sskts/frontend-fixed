var SASAKI = {};
$(function () {
    $(document).on('click', '.prev-button button', function (event) {
        event.preventDefault();
    });
});

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
    return String(price).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}