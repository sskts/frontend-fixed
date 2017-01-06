var SASAKI = {};
$(function () {
    $(document).on('click', '.prev-button button', function (event) {
        event.preventDefault();
    });
});

/**
 * 全角=>半角
 */
function replaceHalfSize(str) {
    var result = '';
    var arr = str.split('');
    arr.forEach(function (value, index) {
        if (value.match(/[!-~a-z]/)) {
            result += value;
        } else if (value.match(/[！-～ａ-ｚ]/)) {
            result += String.fromCharCode(value.charCodeAt(0) - 0xFEE0);
        }
    });
    
    return result;
}