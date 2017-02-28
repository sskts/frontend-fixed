$(function () {
    saveInquiry();

    /**
     * コピークリックイベント
     */
    $(document).on('click', '.copy-button a', function (event) {
        event.preventDefault();
        var parent = $(this).parent().parent().parent();
        var text = parent.find('input[name=copy]').val();
        var textArea = $('<textarea></textarea>');
        textArea.val(text);
        $('body').append(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
        alert('コピーしました');
    });

    /**
     * チケット情報へ移動
     */
    $(document).on('click', '.ticket-scroll-button a', function(event) {
        event.preventDefault();
        var target = $('.qr-tickets');
        var top = target.offset().top - 20;
        $('html,body').animate({scrollTop: top}, 300);
    });
});

/**
 * 照会情報保存
 * @function saveInquiry
 * @returns {void}
 */
function saveInquiry() {
    var inquiryInfo = {
        transaction_id: $('input[name=transaction_id]').val(),
        theater_code: $('input[name=theater_code]').val(),
        reserve_num: $('input[name=reserve_num]').val(),
        tel_num: $('input[name=tel_num]').val(),
        expire: $('input[name=expire]').val()
    };
    var data = localStorage.getItem('inquiryInfo');
    var saveData = [];
    if (data) {
        try {
            saveData = JSON.parse(data);
        } catch (err) {
            console.log(err);
        }
    }
    saveData.push(inquiryInfo);
    localStorage.setItem('inquiryInfo', JSON.stringify(saveData));
}
            