
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
            // holdername: holdername // 加盟店様の購入フォームから取得したカード名義人
        }
        Multipayment.getToken(sendParam, someCallbackFunction);
        $(this).prop('disabled', true);
        

    });
});

/**
 * トークン取得後イベント
 */
function someCallbackFunction(response) {
    if (response.resultCode != 000) {
        gmoValidation();
        validationScroll();
    } else {
        //カード情報は念のため値を除去
        $('input[name=cardno]').val('');
        $('select[name=credit_year]').val('');
        $('select[name=credit_month]').val('');
        $('input[name=securitycode]').val('');
        $('input[name=holdername]').val('');
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
        { name: 'last_name_hira', label: 'せい', required: true, maxLength: 30, regex: [/^[ぁ-ゞー]+$/, 'は全角ひらがなで入力してください'] },
        { name: 'first_name_hira', label: 'めい', required: true, maxLength: 30, regex: [/^[ぁ-ゞー]+$/, 'は全角ひらがなで入力してください'] },
        { name: 'mail_addr', label: 'メールアドレス', required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, 'が正しくありません'] },
        { name: 'mail_confirm', label: 'メールアドレス(確認)', required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, 'が正しくありません'], equals: 'mail_addr' },
        { name: 'tel_num', label: '電話番号', required: true, regex: [/^[0-9]+$/, 'が正しくありません'] },
        // { name: 'agree', label: '利用規約', agree: true },
        { name: 'cardno', label: 'クレジットカード番号', required: true },
        { name: 'credit_month', label: '有効期限（月）', required: true },
        { name: 'credit_year', label: '有効期限（年）', required: true },
        // { name: 'holdername', label: 'カード名義人', required: true, regex: [/^[A-Z]+[\s|　]+[A-Z]+[\s|　]*[A-Z]+$/, 'が正しくありません'] },
        { name: 'securitycode', label: 'セキュリティーコード', required: true },
    ];


    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + '], select[name=' + validation.name + ']');
        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + 'が未入力です</div>');
        } else if (validation.maxLength
            && value.length > validation.maxLength) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + 'は' + validation.maxLength + '文字以内で入力してください</div>');
        } else if (validation.regex
            && !value.match(validation.regex[0])) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + validation.regex[1] + '</div>');
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + '], select[name=' + validation.equals + ']').val()) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + 'が一致しません</div>');
        } else if (validation.agree
            && !target.is(':checked')) {
            target = $('label[for=' + validation.name + ']');
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + 'に同意してください</div>');
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
        { name: 'cardno', label: 'クレジットカード番号'},
        { name: 'expire', label: '有効期限'},
        { name: 'securitycode', label: 'セキュリティーコード'},
    ];


    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + ']');
        if (validation.name === 'expire') {
            $('select[name=credit_month], select[name=credit_year]').addClass('validation');
        } else {
            target.addClass('validation');
        }
        target.after('<div class="validation-text">' + validation.label + 'をご確認ください</div>');
        
    });

}

