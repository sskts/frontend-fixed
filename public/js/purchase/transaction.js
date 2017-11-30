$(function () {
    if (!isSupportBrowser()) {
        $('.not-recommended').show();
        $('.wrapper-inner').show();
        return;
    }
    loadingStart();
    getToken();
});

/**
 * トークン取得
 * @function getToken
 * @returns {void}
 */
function getToken() {
    var performanceId = getParameter()['id'];
    if (performanceId === undefined) {
        showAccessError();
        return;
    }
    var endPoint = (/development|localhost/i.test(location.hostname))
        ? 'https://sskts-waiter-development.appspot.com'
        : (/test/i.test(location.hostname))
            ? 'https://sskts-waiter-test.appspot.com'
            : 'https://sskts-waiter-production.appspot.com'
    var option = {
        dataType: 'json',
        url: endPoint + '/passports',
        type: 'POST',
        timeout: 10000,
        data: {
            scope: 'placeOrderTransaction.' + performanceId.slice(0, 3)
        }
    };
    var doneFunction = function (res) {
        if (res.token) {
            var getTransactionArgs = {
                performanceId: performanceId,
                identityId: getParameter()['identityId'],
                passportToken: res.token
            };
            getTransaction(getTransactionArgs);
            return;
        }
        showAccessCongestionError();
        loadingEnd();
    };
    var failFunction = function (jqxhr, textStatus, error) {
        showAccessCongestionError();
        loadingEnd();
    };
    $.ajax(option)
        .done(doneFunction)
        .fail(failFunction);
}

/**
 * 取引取得
 * @param {Object} args
 * @param {string} args.performanceId
 * @param {string | undefined} args.identityId
 * @param {string} args.passportToken
 * @returns {void}
 */
function getTransaction(args) {
    var option = {
        dataType: 'json',
        url: '/purchase/transaction',
        type: 'POST',
        timeout: 10000,
        data: args
    };
    var doneFunction = function (res) {
        if (res.redirect !== null) {
            location.replace(res.redirect);
            return;
        }
        showAccessError();
    };
    var failFunction = function (jqxhr, textStatus, error) {
        showAccessError();
    };
    var alwaysFunction = function () {
        loadingEnd();
    };
    $.ajax(option)
        .done(doneFunction)
        .fail(failFunction)
        .always(alwaysFunction);
}

/**
 * アクセスエラー表示
 * @function showAccessError
 * @returns {void}
 */
function showAccessError() {
    $('.error').hide();
    $('.access-error').show();
    $('.wrapper-inner').show();
}


/**
 * アクセス混雑エラー表示
 * @function showAccessCongestionError
 * @returns {void}
 */
function showAccessCongestionError() {
    $('.error').hide();
    $('.access-congestion').show();
    $('.wrapper-inner').show();
    retry();
}

/**
 * リトライ
 * @function retry
 * @returns {void}
 */
function retry() {
    var timer = 60000;
    setTimeout(function () {
        getToken();
    }, timer);
}

/**
 * ブラウザ対応判定
 * @function isSupportBrowser
 * @returns {boolean}
 */
function isSupportBrowser() {
    var result = true;
    var userAgent = window.navigator.userAgent.toLowerCase();
    var version = window.navigator.appVersion.toLowerCase();
    if (userAgent.indexOf('msie') > -1) {
        if (version.indexOf('msie 6.') > -1) {
            result = false;
        } else if (version.indexOf('msie 7.') > -1) {
            result = false;
        } else if (version.indexOf('msie 8.') > -1) {
            result = false;
        } else if (version.indexOf('msie 9.') > -1) {
            result = false;
        }
    }
    return result;
}
