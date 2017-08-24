var SASAKI = {};
var modal;
$(function () {
    modal = new SASAKI.Modal();
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

/**
 * 時間フォーマット
 * @function timeFormat
 * @param {moment.Moment} referenceDate
 * @param {moment.Moment} screeningTime
 * @returns {string}
 */
function timeFormat(referenceDate, screeningTime) {
    var HOUR = 60;
    var diff = screeningTime.diff(referenceDate, 'minutes');
    var hour = ('00' + Math.floor(diff / HOUR)).slice(-2);
    var minutes = screeningTime.format('mm');

    return hour + ':' + minutes;
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

/**
 * Array.prototype.find追加
 */
if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

/**
 * Array.prototype.map追加
 */
if (!Array.prototype.map) {

  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(' this is null or not defined');
    }

    // 1. Let O be the result of calling ToObject passing the |this| 
    //    value as the argument.
    var O = Object(this);

    // 2. Let lenValue be the result of calling the Get internal 
    //    method of O with the argument "length".
    // 3. Let len be ToUint32(lenValue).
    var len = O.length >>> 0;

    // 4. If IsCallable(callback) is false, throw a TypeError exception.
    // See: http://es5.github.com/#x9.11
    if (typeof callback !== 'function') {
      throw new TypeError(callback + ' is not a function');
    }

    // 5. If thisArg was supplied, let T be thisArg; else let T be undefined.
    if (arguments.length > 1) {
      T = thisArg;
    }

    // 6. Let A be a new array created as if by the expression new Array(len) 
    //    where Array is the standard built-in constructor with that name and 
    //    len is the value of len.
    A = new Array(len);

    // 7. Let k be 0
    k = 0;

    // 8. Repeat, while k < len
    while (k < len) {

      var kValue, mappedValue;

      // a. Let Pk be ToString(k).
      //   This is implicit for LHS operands of the in operator
      // b. Let kPresent be the result of calling the HasProperty internal 
      //    method of O with argument Pk.
      //   This step can be combined with c
      // c. If kPresent is true, then
      if (k in O) {

        // i. Let kValue be the result of calling the Get internal 
        //    method of O with argument Pk.
        kValue = O[k];

        // ii. Let mappedValue be the result of calling the Call internal 
        //     method of callback with T as the this value and argument 
        //     list containing kValue, k, and O.
        mappedValue = callback.call(T, kValue, k, O);

        // iii. Call the DefineOwnProperty internal method of A with arguments
        // Pk, Property Descriptor
        // { Value: mappedValue,
        //   Writable: true,
        //   Enumerable: true,
        //   Configurable: true },
        // and false.

        // In browsers that support Object.defineProperty, use the following:
        // Object.defineProperty(A, k, {
        //   value: mappedValue,
        //   writable: true,
        //   enumerable: true,
        //   configurable: true
        // });

        // For best browser support, use the following:
        A[k] = mappedValue;
      }
      // d. Increase k by 1.
      k++;
    }

    // 9. return A
    return A;
  };
}
