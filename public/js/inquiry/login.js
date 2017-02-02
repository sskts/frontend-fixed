$(function () {
    toInquiry();
});

/**
 * 照会情報取得して照会
 */
function toInquiry() {
    var params = location.search.replace('?', '').split('&');
    var transactionId = null;
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split('=');
        var key = param[0];
        var value = param[1];
        if (key && value && key === 'transaction_id') {
            transactionId = value;
        }
    }
    //取引IDなければ終了
    if (!transactionId) return;
    var data = localStorage.getItem('inquiryInfo');
    //照会データなければ終了
    if (!data) return;
    var inquiryInfo = JSON.parse(data);

    var submitFlg = false;
    for (var i = 0; i < inquiryInfo.length; i++) {
        var info = inquiryInfo[i];
        if (transactionId === info.transaction_id) {
            //対象取引データ
            $('input[name=theater_code]').val(info.theater_code);
            $('input[name=reserve_num]').val(info.reserve_num);
            $('input[name=tel_num]').val(info.tel_num);
            submitFlg = true;
            break;
        }
    }

    var saveData = [];
    for (var i = 0; i < inquiryInfo.length; i++) {
        var info = inquiryInfo[i];
        if (Date.now() < Number(info.expire) {
            //対象取引データ
            saveData.push(info);
        }
    }

    localStorage.setItem('inquiryInfo', JSON.stringify(saveData));

    if (submitFlg) {
        loadingStart(function () {
            $('form').submit();
        });
    }


}