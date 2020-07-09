var screenSeatStatusesMap;

$(function () {
    $('.purchase-complete').hide();
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', nextButtonClick);

    var timer = false;
    $(window).on('resize', function () {
        if (timer !== false) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            heightFix();
        }, 200);
    });

    /**
     * 確認クリックイベント
     */
    $('.confirm-button a').on('click', confirmButtonClick);
});

/**
 * 確認クリックイベント
 * @function confirmButtonClick
 * @param {Event} event 
 */
function confirmButtonClick(event) {
    event.preventDefault();
    loadingStart(function () {
        screenStateUpdate(function () {
            modal.open('screen');
            setTimeout(function () {
                screenSeatStatusesMap.init();
                modal.resize();
            }, 0);
        });
    });
}

/**
 * 次へクリックイベント
 * @function nextButtonClick
 * @param {Event} event 
 */
function nextButtonClick(event) {
    event.preventDefault();
    validation();
    if ($('.validation-text').length > 0) {
        validationScroll();
        return;
    }
    $(this).prop('disabled', true);
    loadingStart();
    purchase();
}

/**
 * 購入完了
 * @function purchase
 * @returns {void}
 */
function purchase() {
    var option = {
        dataType: 'json',
        url: '/purchase/confirm',
        type: 'POST',
        timeout: API_TIMEOUT,
        data: {
            toBeExpiredAt: $('input[name=toBeExpiredAt]').val(),
            isSecurityCodeSet: $('input[name=isSecurityCodeSet]').val(),
            transactionId: $('input[name=transactionId]').val()
        }
    };
    var process = function (data, jqXhr) {
        if (jqXhr.status === HTTP_STATUS.OK) {
            var transactionId = $('input[name=transactionId]').val();
            var theaterCode = $('input[name=theaterCode]').val();
            try {
                // Google Analytics
                var sendData = {
                    hitType: 'event',
                    eventCategory: 'purchase',
                    eventAction: 'complete',
                    eventLabel: 'conversion-' + theaterCode
                };
                ga('send', sendData);
            } catch (err) {
                console.error(err);
            }
            if (isApp()) {
                try {
                    // プッシュ通知登録
                    var TARGET_VIEW = 'mainView';
                    var reservationFor = data.result.order.acceptedOffers[0].itemOffered.reservationFor;
                    var option = {
                        id: Number(data.result.order.orderNumber.replace(/\-/g, '')), // ID
                        title: '鑑賞時間が近づいています。', // タイトル
                        text: '劇場 / スクリーン: ' + reservationFor.superEvent.location.name.ja + '/' + reservationFor.location.name.ja + '\n' +
                            '作品名: ' + reservationFor.workPerformed.name + '\n' +
                            '上映開始: ' + moment(reservationFor.startDate).format('YYYY/MM/DD HH:mm'), // テキスト
                        trigger: {
                            at: moment(reservationFor.startDate).subtract(30, 'minutes').toISOString() // 通知を送る時間（ISO）
                        },
                        foreground: true // 前面表示（デフォルトは前面表示しない）
                    };
                    var json = JSON.stringify({
                        method: 'localNotification',
                        option: option
                    });
                    window.wizViewMessenger.postMessage(json, TARGET_VIEW);
                } catch (err) {
                    console.error(err);
                }
            }
            // if (data.result.mail === null) {
            //     resendMail(0);
            // }
            showComplete(data.result);
            loadingEnd();
        } else if (jqXhr.status === HTTP_STATUS.BAD_REQUEST) {
            showError(data.error);
            loadingEnd();
        } else {
            getComplete(0);
        }
    }
    var doneFunction = function (data, textStatus, jqXhr) {
        process(data, jqXhr);
    }
    var failFunction = function (jqXhr, textStatus, errorThrown) {
        process(null, jqXhr);
    };
    var alwaysFunction = function () {
        $('.next-button button').prop('disabled', false);
    }
    $.ajax(option)
        .done(doneFunction)
        .fail(failFunction)
        .always(alwaysFunction);
}

/**
 * メール再送信
 * @function resendMail
 * @param {number} count
 * @returns {void}
 */
function resendMail(count) {
    var option = {
        dataType: 'json',
        url: '/purchase/resendMail',
        type: 'POST',
        timeout: API_TIMEOUT
    };
    var process = function (data, jqXhr) {
        if (jqXhr.status !== HTTP_STATUS.OK) {
            count++;
            var limit = 10;
            if (count > limit) {
                return;
            }
            var timer = 3000;
            setTimeout(function () {
                resendMail(count);
            }, timer);
        }
    }
    var doneFunction = function (data, textStatus, jqXhr) {
        process(data, jqXhr);
    }
    var failFunction = function (jqXhr, textStatus, errorThrown) {
        process(null, jqXhr);
    }
    $.ajax(option)
        .done(doneFunction)
        .fail(failFunction);
}

/**
 * 購入情報取得
 * @function getComplete
 * @param {number} count
 * @returns {void}
 */
function getComplete(count) {
    var option = {
        dataType: 'json',
        url: '/purchase/getComplete',
        type: 'GET',
        timeout: API_TIMEOUT
    };
    var process = function (data, jqXhr) {
        if (jqXhr.status === HTTP_STATUS.OK) {
            showComplete(data.result);
            loadingEnd();
        } else {
            count++;
            var limit = 10;
            if (count > limit) {
                showError();
                loadingEnd();
                return;
            }
            var timer = 3000;
            setTimeout(function () {
                getComplete(count);
            }, timer);
        }
    }
    var doneFunction = function (data, textStatus, jqXhr) {
        process(data, jqXhr);
    }
    var failFunction = function (jqXhr, textStatus, errorThrown) {
        process(null, jqXhr);
    }
    $.ajax(option).done(doneFunction).fail(failFunction);
}

/**
 * エラー画面表示
 * @function showError
 * @param {string | undefined} message
 * @returns {void}
 */
function showError(message) {
    if (message !== undefined) {
        $('.error .read').html(message);
    }
    $('.purchase-confirm').remove();
    $('.header .steps').remove();
    $('.navigation .top-button a').attr({
        href: '/',
        'data-modal': ''
    });
    $('.error').show();
    $(window).scrollTop(0);
    history.pushState(null, null, '/error');
    loadingEnd();
}

/**
 * 完了画面表示
 * @function showError
 * @param {any} result
 * @returns {void}
 */
function showComplete(result) {
    if (isFixed()) {
        loadingEnd();
        var printDom = $('.purchase-print');
        var navigationDom = $('.navigation .buttons');
        // 券売機
        $('.ticket-length').text($('input[name=ticketLength]').val());
        navigationDom.hide();
        //コンテンツ切り替え
        $('.purchase-confirm').remove();
        printDom.show();
        $(window).scrollTop(0);
        printTicket(0, function () {
            //step変更
            $('.steps li').removeClass('active');
            $('.steps li:last-child').addClass('active');
            navigationDom.find('.prev-button').hide();
            navigationDom.show();
            //コンテンツ切り替え
            printDom.remove();
            $('.navigation .top-button a').attr({
                href: '/',
                'data-modal': ''
            });
            $('.purchase-complete').show();
            history.pushState(null, null, '/purchase/complete');
            $(window).scrollTop(0);
        });
    } else {
        //step変更
        $('.steps li').removeClass('active');
        $('.steps li:last-child').addClass('active');
        //コンテンツ切り替え
        $('.purchase-confirm').remove();
        $('.purchase-complete').show();
        $(window).scrollTop(0);
        history.pushState(null, null, '/purchase/complete');
        heightFix();
    }
}

/**
 * バリデーションスクロール
 * @function validationScroll
 * @returns {void}
 */
function validationScroll() {
    var target = $('.validation').eq(0);
    var top = target.offset().top - 20;
    $('html,body').animate({ scrollTop: top }, 300);
}

/**
 * バリデーション
 * @function validation
 * @returns {void}
 */
function validation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();

    var validationList = [
        { name: 'notesAgree', label: locales.label.notes, agree: true },
    ];

    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + ']');
        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.required + '</div>');
        } else if (validation.maxLength
            && value.length > validation.maxLength) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.required + '</div>');
        } else if (validation.regex
            && !value.match(validation.regex[0])) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + validation.regex[1] + '</div>');
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + ']').val()) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.equals + '</div>');
        } else if (validation.agree
            && !target.is(':checked')) {
            target = $('label[for=' + validation.name + ']');
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.agree + '</div>');
        }
    });
}

