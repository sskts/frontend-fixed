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
            $('.purchase-confirm').remove();
            var dom = '<li><dl><dt>購入番号</dt><dd class="red-text"><strong>'+ res.purchaseNo +'</strong></dd><dd class="small-text">※チケットの発行等に必要な番号となりますので必ず忘れないようにしてください。</dd></dl></li>';
            $('.purchase-complete .info').prepend(dom);
            $('.purchase-complete').show();
        }).fail(function (jqxhr, textStatus, error) {
            $('.confirm').remove();
            $('.complete').show();
        }).always(function () {
            //step変更
            $('.steps li').removeClass('active');
            $('.steps li:last-child').addClass('active');
        });
    });
});
