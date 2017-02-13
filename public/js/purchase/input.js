
$(function () {
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

        var cardno = $('input[name=cardno]').val();
        var expire = $('select[name=credit_year]').val() + $('select[name=credit_month]').val();
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
});

/**
 * トークン取得後イベント
 */
function someCallbackFunction(response) {
    //カード情報は念のため値を除去
    var date = new Date();
    $('input[name=cardno]').val('');
    $('select[name=credit_year]').val((String(date.getFullYear())));
    $('select[name=credit_month]').val((date.getMonth() + 1 < 10) ? '0' + String(date.getMonth() + 1) : String(date.getMonth() + 1));
    $('input[name=securitycode]').val('');
    $('input[name=holdername]').val('');
    if (response.resultCode != 000) {
        gmoValidation();
        validationScroll();
    } else {
        //予め購入フォームに用意した token フィールドに、値を設定
        $('input[name=gmo_token_object]').val(JSON.stringify(response.tokenObject));
        //スクリプトからフォームを submit
        loadingStart(function () {
            document.getElementById('purchaseform').submit();
        });
        
    }
}

/**
 * バリデーションスクロール
 */
function validationScroll() {
    var target = $('.validation').eq(0);
    var top = target.offset().top - 20;
    $('html,body').animate({ scrollTop: top }, 300);
}

/**
 * バリデーション
 */
function validation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();

    var validationList = [
        { name: 'last_name_hira', label: locales.label.last_name_hira, required: true, maxLength: 30, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
        { name: 'first_name_hira', label: locales.label.first_name_hira, required: true, maxLength: 30, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
        { name: 'mail_addr', label: locales.label.mail_addr, required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, locales.validation.is_email] },
        { name: 'mail_confirm', label: locales.label.mail_confirm, required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, locales.validation.is_email], equals: 'mail_addr' },
        { name: 'tel_num', label: locales.label.tel_num, required: true, regex: [/^[0-9]+$/, locales.validation.is_tel] },
        { name: 'cardno', label: locales.label.cardno, required: true },
        { name: 'securitycode', label: locales.label.securitycode, required: true },
        { name: 'holdername', label: locales.label.holdername, required: true },
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

/**
 * バリデーション
 */
function gmoValidation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();
    
    var validationList = [
        { name: 'cardno', label: locales.label.cardno},
        { name: 'expire', label: locales.label.expire},
        { name: 'securitycode', label: locales.label.securitycode},
        { name: 'holdername', label: locales.label.holdername},
    ];

    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + ']');
        if (validation.name === 'expire') {
            $('select[name=credit_month], select[name=credit_year]').addClass('validation');
        } else {
            target.addClass('validation');
        }
        target.after('<div class="validation-text">' + validation.label + locales.validation.card + '</div>');
        
    });

}

