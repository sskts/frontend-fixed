$(function () {
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        $.ajax({
            dataType: 'json',
            url: '/purchase/confirm',
            type: 'POST',
            timeout: 100000,
            data: {
                toBeExpiredAt: $('input[toBeExpiredAt]').val(),
                isSecurityCodeSet: $('input[isSecurityCodeSet]').val(),
            },
            beforeSend: function () {

            }
        }).done(function (res) {
            //step変更
            $('.steps li').removeClass('active');
            $('.steps li:last-child').addClass('active');
            $('.purchase-confirm').remove();
            $('.purchase-complete').show();
        }).fail(function (jqxhr, textStatus, error) {
            
        }).always(function () {
            
        });
    });
});
