var screenSeatStatusesMap;

$(function () {
    $('.purchase-complete').hide();
    var modal = new SASAKI.Modal();
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        validation();
        if ($('.validation-text').length > 0) {
            validationScroll();
            return;
        }
        purchase();
    });

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
    $('.confirm-button a').on('click', function (event) {
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
    });
});

/**
 * 購入完了
 * @function purchase
 * @returns {void}
 */
function purchase() {
    $.ajax({
        dataType: 'json',
        url: '/purchase/confirm',
        type: 'POST',
        timeout: 10000,
        data: {
            toBeExpiredAt: $('input[name=toBeExpiredAt]').val(),
            isSecurityCodeSet: $('input[name=isSecurityCodeSet]').val(),
            transaction_id: $('input[name=transaction_id]').val()
        },
        beforeSend: function () {
            loadingStart();
        }
    }).done(function (res) {
        if (res.err || !res.result) {
            //エラー表示
            showError(res.err.message);
        } else {
            //完了画面表示
            showComplete(res.result);
        }
        loadingEnd();
    }).fail(function (jqxhr, textStatus, error) {
        getComplete(0);
    }).always(function () {

    });
}

/**
 * 購入情報取得
 * @function getComplete
 * @param {number} count
 * @returns {void}
 */
function getComplete(count) {
    $.ajax({
        dataType: 'json',
        url: '/purchase/getComplete',
        type: 'POST',
        timeout: 10000,
        data: {},
        beforeSend: function () { }
    }).done(function (res) {
        if (res.err || !res.result) {
            //エラー表示
            showError(res.err.message);
        } else {
            //完了画面表示
            showComplete(res.result);
        }
        loadingEnd();
    }).fail(function (jqxhr, textStatus, error) {
        count++;
        var limit = 10;
        if (count > limit) return showError();
        var timer = 3000;
        setTimeout(function () {
            getComplete(count);
        }, timer);
    }).always(function () {

    });
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
    $('.error').show();
    $(window).scrollTop(0);
    history.pushState(null, null, '/error');
}

/**
 * 完了画面表示
 * @function showError
 * @param {any} result
 * @returns {void}
 */
function showComplete(result) {
    console.log(result);
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
        { name: 'notes_agree', label: locales.label.notes, agree: true },
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
