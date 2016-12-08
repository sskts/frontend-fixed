$(function () {
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        validation();
        if ($('.validation').length > 0) {
            return;
        }

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
});

/**
     * トークン取得後イベント
     */
function someCallbackFunction(response) {
    if (response.resultCode != 000) {
        alert('購入処理中にエラーが発生しました');
    } else {
        //カード情報は念のため値を除去
        $('input[name=cardno]').val('');
        $('select[name=creditYear]').val('');
        $('select[name=creditMonth]').val('');
        $('input[name=securitycode]').val('');
        $('input[name=holdername]').val('');
        //予め購入フォームに用意した token フィールドに、値を設定
        $('input[name=gmoTokenObject]').val(JSON.stringify(response.tokenObject));
        //スクリプトからフォームを submit
        document.getElementById('purchaseform').submit();
    }
}

/**
 * バリデーション
 */
function validation() {
    $('.validation').remove();

    var validationList = [
        { name: 'lastNameKanji', label: '姓', required: true, maxLength: 15 },
        { name: 'firstNameKanji', label: '名', required: true, maxLength: 15 },
        { name: 'lastNameHira', label: 'せい', required: true, maxLength: 30, regex: [/^[ぁ-ゞ]+$/, 'は全角ひらがなで入力してください'] },
        { name: 'firstNameHira', label: 'めい', required: true, maxLength: 30, regex: [/^[ぁ-ゞ]+$/, 'は全角ひらがなで入力してください'] },
        { name: 'mail', label: 'メールアドレス', required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, 'は不適切です'] },
        { name: 'mailConfirm', label: 'メールアドレス(確認)', required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, 'は不適切です'], equals: 'mail' },
        { name: 'tel', label: '電話番号', required: true, regex: [/^[0-9]+$/, 'は不適切です'] },
        { name: 'cardno', label: 'クレジットカード番号', required: true, regex: [/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[0-9]{15})$/, 'は不適切です'] },
        { name: 'creditMonth', label: '有効期限（月）', required: true },
        { name: 'creditYear', label: '有効期限（年）', required: true },
        { name: 'holdername', label: 'カード名義人', required: true, regex: [/^[A-Z]+[\s|　]+[A-Z]+[\s|　]*[A-Z]+$/, 'は不適切です'] },
        { name: 'securitycode', label: 'セキュリティーコード', required: true, regex: [/^[0-9]{3,4}$/, 'は不適切です'] },
    ];


    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + '], select[name=' + validation.name + ']');
        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            target.after('<div class="validation">' + validation.label + 'が未入力です</div>');
        } else if (validation.maxLength
            && value.length > validation.maxLength) {
            target.after('<div class="validation">' + validation.label + 'は' + validation.maxLength + '文字以内で入力してください</div>');
        } else if (validation.regex
            && !value.match(validation.regex[0])) {
            target.after('<div class="validation">' + validation.label + validation.regex[1] + '</div>');
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + '], select[name=' + validation.equals + ']').val()) {
            target.after('<div class="validation">' + validation.label + 'が一致しません</div>');
        }
    });

}