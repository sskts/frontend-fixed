$(function () {
    pageInit();
    // 次へクリックイベント
    $(document).on('click', '.next-button button', nextButtonClick);
});

/**
 * @function nextButtonClick
 * @param {Event} event 
 */
function nextButtonClick(event) {
    event.preventDefault();
    validation();
    if ($('.validation').length > 0) {
        validationScroll();
        return;
    }
    var price = $('input[name=price]').val();
    $(this).prop('disabled', true);
    if (Number(price) === 0) {
        loadingStart();
        $('#purchaseform').submit();
    } else {
        loadingStart(function () {
            var cardno = $('input[name=cardno]').val();
            var expire = $('select[name=creditYear]').val() + $('select[name=creditMonth]').val();
            var securitycode = $('input[name=securitycode]').val();
            var holdername = $('input[name=holdername]').val();
            var sendParam = {
                cardno: cardno, // 加盟店様の購入フォームから取得したカード番号
                expire: expire, // 加盟店様の購入フォームから取得したカード有効期限
                securitycode: securitycode, // 加盟店様の購入フォームから取得したセキュリティコード
                holdername: holdername // 加盟店様の購入フォームから取得したカード名義人
            }
            Multipayment.getToken(sendParam, someCallbackFunction);
        });
    }
}

/**
 * 初期化
 * @function pageInit
 * @returns {void}
 */
function pageInit() {
    if (isFixed()) {
        // 券売機
        var data = localStorage.getItem('config');
        var json = JSON.parse(data);
        $('input[name=familyName]').val(json.familyName);
        $('input[name=givenName]').val(json.givenName);
        $('input[name=email]').val(json.email);
        $('input[name=emailConfirm]').val(json.email);

        var str = $('input[name=validation]').val();
        if (str === '') return;
        var errors = JSON.parse(str);
        if (errors === null) return;
        var modalBody = $('.modal[data-modal=validation] .modal-body');
        modalBody.html('');
        Object.keys(errors).forEach(function(value) {
            var error = errors[value];
            var target = $('input[name=' + error.param + ']');
            target.addClass('validation');
            modalBody.append('<div class="mb-small">' + error.msg + '</div>');
        });
        modal.open('validation');
        return;
    }

    if ($('input[name=gmoError]').val()) {
        // 計測 ※gmoエラーはコードのみ。詳細は送らない。
        var theaterCode = $('input[name=theaterCode]').val();
        var gmoErrorMessage = $('input[name=gmoErrorMessage]').val();
        var transactionId = $('input[name=transactionId]').val();
        var msg = $('input[name=gmoError]').val();
        var target = $('.modal[data-modal=creditcardAlert]');
        target.find('p').html(msg);
        modal.open('creditcardAlert');

        // バリデーション
        $('.validation').removeClass('validation');
        $('.validation-text').remove();
        var validationList = [
            { name: 'cardno' },
            { name: 'expire' },
            { name: 'securitycode' },
            { name: 'holdername' },
        ];
        validationList.forEach(function (validation, index) {
            var target = $('input[name=' + validation.name + ']');
            if (validation.name === 'expire') {
                $('select[name=creditMonth], select[name=creditYear]').addClass('validation');
            } else {
                target.addClass('validation');
            }
        });
        validationScroll();
    }
}

/**
 * トークン取得後イベント
 * @function someCallbackFunction
 * @param {Object} response
 * @param {Object} response.tokenObject
 * @param {number} response.resultCode
 * @returns {void}
 */
function someCallbackFunction(response) {
    //カード情報は念のため値を除去
    var date = new Date();
    $('input[name=cardno]').val('');
    $('select[name=creditYear]').val((String(date.getFullYear())));
    $('select[name=creditMonth]').val((date.getMonth() + 1 < 10) ? '0' + String(date.getMonth() + 1) : String(date.getMonth() + 1));
    $('input[name=securitycode]').val('');
    $('input[name=holdername]').val('');
    if (response.resultCode != 000) {
        loadingEnd();
        gmoValidation();
        validationScroll();
        $('.next-button button').prop('disabled', false);
    } else {
        //予め購入フォームに用意した token フィールドに、値を設定
        $('input[name=gmoTokenObject]').val(JSON.stringify(response.tokenObject));
        //スクリプトからフォームを submit
        $('#purchaseform').submit();
    }
}

/**
 * バリデーションスクロール
 * @function validationScroll
 * @returns {void}
 */
function validationScroll() {
    if (isFixed()) {
        // 券売機
        return;
    }
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
    var modalBody = $('.modal[data-modal=validation] .modal-body');
    modalBody.html('');

    var NAME_MAX_LENGTH = 12;
    var MAIL_MAX_LENGTH = 50;
    var TEL_MAX_LENGTH = 11;
    var TEL_MIN_LENGTH = 9;
    if (isFixed()) {
        // 券売機
        var validationList = [
            { name: 'familyName', label: locales.label.last_name_hira, required: true, maxLength: NAME_MAX_LENGTH, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
            { name: 'givenName', label: locales.label.first_name_hira, required: true, maxLength: NAME_MAX_LENGTH, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
            { name: 'email', label: locales.label.mail_addr, required: true, maxLength: MAIL_MAX_LENGTH, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, locales.validation.is_email] },
            { name: 'emailConfirm', label: locales.label.mail_confirm, required: true, maxLength: MAIL_MAX_LENGTH, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, locales.validation.is_email], equals: 'email' },
            { name: 'telephone', label: locales.label.tel_num, required: true, maxLength: TEL_MAX_LENGTH, minLength: TEL_MIN_LENGTH, regex: [/^[0-9]+$/, locales.validation.is_tel] },
            { name: 'cardno', label: locales.label.cardno, required: true },
            { name: 'securitycode', label: locales.label.securitycode, required: true }
        ];
    } else {
        var validationList = [
            { name: 'familyName', label: locales.label.last_name_hira, required: true, maxLength: NAME_MAX_LENGTH, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
            { name: 'givenName', label: locales.label.first_name_hira, required: true, maxLength: NAME_MAX_LENGTH, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
            { name: 'email', label: locales.label.mail_addr, required: true, maxLength: MAIL_MAX_LENGTH, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, locales.validation.is_email] },
            { name: 'emailConfirm', label: locales.label.mail_confirm, required: true, maxLength: MAIL_MAX_LENGTH, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, locales.validation.is_email], equals: 'email' },
            { name: 'telephone', label: locales.label.tel_num, required: true, maxLength: TEL_MAX_LENGTH, minLength: TEL_MIN_LENGTH, regex: [/^[0-9]+$/, locales.validation.is_tel] },
            { name: 'cardno', label: locales.label.cardno, required: true },
            { name: 'securitycode', label: locales.label.securitycode, required: true },
            { name: 'holdername', label: locales.label.holdername, required: true },
        ];
    }
    

    var validations = [];
    var names = [];

    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + ']');
        var msg = '';
        if (target.length === 0) {
            return;
        }

        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            msg = validation.label + locales.validation.required;
        } else if (validation.maxLength
            && value
            && value.length > validation.maxLength) {
            msg = validation.label + locales.validation.maxlength.replace('30', validation.maxLength);
        } else if (validation.minLength
            && value
            && value.length < validation.minLength) {
            msg = validation.label + locales.validation.minlength.replace('30', validation.minLength);
        } else if (validation.regex
            && value
            && !value.match(validation.regex[0])) {
            msg = validation.label + validation.regex[1];
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + ']').val()) {
            msg = validation.label + locales.validation.equals;
        } else if (validation.agree
            && !target.is(':checked')) {
            target = $('label[for=' + validation.name + ']');
            msg = validation.label + locales.validation.agree;
        }

        if (msg !== '') {
            target.addClass('validation');
            if (isFixed()) {
                // 券売機
                modalBody.append('<div class="mb-small">' + msg + '</div>');
            } else {
                target.after('<div class="validation-text">' + msg + '</div>');
            }
        }

        if (target.hasClass('validation')) {
            validations.push(validation.label + ': ' + msg);
            names.push(validation.name)
        }
    });
    
    if (validations.length > 0) {
        if (isFixed()) {
            // 券売機
            modal.open('validation');
        }
    }
}

/**
 * GMOバリデーション
 * @function gmoValidation
 * @returns {void}
 */
function gmoValidation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();
    var modalBody = $('.modal[data-modal=validation] .modal-body');
    modalBody.html('');

    var validationList = [
        { name: 'cardno', label: locales.label.cardno },
        { name: 'expire', label: locales.label.expire },
        { name: 'securitycode', label: locales.label.securitycode },
        { name: 'holdername', label: locales.label.holdername },
    ];
    if (isFixed()) {
        // 券売機
        validationList.forEach(function (validation, index) {
            var target = $('input[name=' + validation.name + ']');
            if (validation.name === 'expire') {
                $('select[name=creditMonth], select[name=creditYear]').addClass('validation');
            } else {
                target.addClass('validation');
            }
            modalBody.append('<div class="mb-small">' + validation.label + locales.validation.card + '</div>');
        });
        modal.open('validation');
    } else {
        validationList.forEach(function (validation, index) {
            var target = $('input[name=' + validation.name + ']');
            if (validation.name === 'expire') {
                $('select[name=creditMonth], select[name=creditYear]').addClass('validation');
            } else {
                target.addClass('validation');
            }
            target.after('<div class="validation-text">' + validation.label + locales.validation.card + '</div>');
        });
    }
}

