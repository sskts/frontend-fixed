var modal;
$(function () {
    modal = new SASAKI.Modal();
    validation();
    if (!isFixed()) {
        toInquiry();
    }
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        loadingStart(function () {
            $('form').submit();
        });
    });
});

/**
 * バリデーション
 * @function validation
 * @returns {void}
 */
function validation() {
    var validations = [];
    var names = [];

    if (isFixed()) {
        // 券売機
        var str = $('input[name=validation]').val();
        var errors = JSON.parse(str);
        if (errors === null) return;
        var modalBody = $('.modal[data-modal=validation] .modal-body');
        modalBody.html('');
        Object.keys(errors).forEach(function(value) {
            var error = errors[value];
            var target = $('input[name=' + error.param + ']');
            validations.push(target.parent().prev().text() + ': ' + error.msg);
            names.push(error.parm);
            target.addClass('validation');
            modalBody.append('<div class="mb-small">' + error.msg + '</div>');
        });
        modal.open('validation');
    } else {
        $('.validation').each(function (index, elem) {
            var target = $(elem);
            validations.push(target.parent().prev().text() + ': ' + target.next().text());
            names.push(target.attr('name'));
        });
    }

    if (validations.length > 0) {
        // 計測
        collection({
            client: 'sskts-frontend',
            label: 'inquiryValidationMessage',
            action: 'validation',
            category: 'form',
            message: validations.join(', '),
            notes: names.join(', '),
            transaction: $('input[name=transactionId]').val()
        });
    }
}

/**
 * 照会情報取得して照会
 * @function toInquiry
 * @returns {void}
 */
function toInquiry() {
    var transactionId = getParameter()['transactionId'];

    //取引IDなければ終了
    if (!transactionId) return;
    var data = localStorage.getItem('inquiryInfo');
    //照会データなければ終了
    if (!data) return;
    try {
        var inquiryInfo = JSON.parse(data);
    } catch (err) {
        console.log(err);
        return;
    }

    var submitFlg = false;
    for (var i = 0; i < inquiryInfo.length; i++) {
        var info = inquiryInfo[i];
        if (transactionId === info.transaction_id) {
            //対象取引データ
            $('input[name=theaterCode]').val(info.theaterCode);
            $('input[name=reserveNum]').val(info.reserveNum);
            $('input[name=telNum]').val(info.telNum);
            submitFlg = true;
            break;
        }
    }

    var saveData = [];
    for (var i = 0; i < inquiryInfo.length; i++) {
        var info = inquiryInfo[i];
        if (Date.now() < Number(info.expire)) {
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