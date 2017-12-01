$(function () {
    if (!isSupportBrowser()) {
        $('.not-recommended').show();
        $('.wrapper-inner').show();
        return;
    }
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
            : 'https://sskts-waiter-production.appspot.com';
    var scope = 'placeOrderTransaction.MovieTheater-' + performanceId.slice(0, 3);
    var option = {
        dataType: 'json',
        url: endPoint + '/passports',
        type: 'POST',
        timeout: 10000,
        data: {
            scope: scope
        }
    };
    var expired = Date.now() + 60000;
    var congestion = JSON.parse(sessionStorage.getItem('congestion'));
    if (congestion !== null && Date.now() < congestion.expired && scope === congestion.scope) {
        // 混雑期間内
        showAccessCongestionError();
        return;
    }
    var prosess = function (data, jqXhr) {
        if (jqXhr.status === HTTP_STATUS.CREATED) {
            var getTransactionArgs = {
                performanceId: performanceId,
                identityId: getParameter()['identityId'],
                passportToken: data.token
            };
            getTransaction(getTransactionArgs);
        } else if (jqXhr.status === HTTP_STATUS.BAD_REQUEST
            || jqXhr.status === HTTP_STATUS.NOT_FOUND) {
            // アクセスエラー
            showAccessError();
            loadingEnd();
        } else if (jqXhr.status === HTTP_STATUS.TOO_MANY_REQUESTS
            || jqXhr.status === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
            // 混雑エラー
            sessionStorage.setItem('congestion', JSON.stringify({
                expired: expired,
                scope: scope
            }));
            showAccessCongestionError();
            loadingEnd();
        } else if (jqXhr.status === HTTP_STATUS.SERVICE_UNAVAILABLE) {
            // メンテナンス
            showMaintenance();
            loadingEnd();
        }
    }

    var doneFunction = function (data, textStatus, jqXhr) {
        prosess(data, jqXhr);
    };
    var failFunction = function (jqXhr, textStatus, error) {
        prosess(null, jqXhr);
    };
    loadingStart();
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
    var doneFunction = function (data, textStatus, jqXhr) {
        if (jqXhr.status === HTTP_STATUS.OK) {
            location.replace(data.redirect);
            return;
        }
        showAccessError();
        loadingEnd();
    };
    var failFunction = function (jqxhr, textStatus, error) {
        showAccessError();
        loadingEnd();
    };
    $.ajax(option)
        .done(doneFunction)
        .fail(failFunction);
}

/**
 * メンテナンス表示
 * @function showMaintenance
 * @returns {void}
 */
function showMaintenance() {
    $('.maintenance').show();
    $('.wrapper-inner').show();
}

/**
 * アクセスエラー表示
 * @function showAccessError
 * @returns {void}
 */
function showAccessError() {
    $('.access-error').show();
    $('.wrapper-inner').show();
}

/**
 * アクセス混雑エラー表示
 * @function showAccessCongestionError
 * @returns {void}
 */
function showAccessCongestionError() {
    $('.access-congestion').show();
    $('.wrapper-inner').show();
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
