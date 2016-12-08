$(function () {
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        $.ajax({
            dataType: 'json',
            url: '/purchase/confirmPurchase',
            type: 'POST',
            timeout: 100000,
            data: {
                reservationNo: $('input[reservationNo]').val(),
                token: $('input[token]').val(),
                toBeExpiredAt: $('input[toBeExpiredAt]').val(),
                isSecurityCodeSet: $('input[isSecurityCodeSet]').val(),
            },
            beforeSend: function () {

            }
        }).done(function (res) {
            var dom = getHtml({
                purchaseNo: res.purchaseNo,
                theater: $('.theater').html(),
                filmName: $('.film-name').html(),
                date: $('.date').html(),
                seat: $('.seat').html(),
                price: $('.price').html(),
            });
            
            //ver1
            $('.contents').html(dom);
            $('.steps li').removeClass('active');
            $('.steps li:last-child').addClass('active');
            

        }).fail(function (jqxhr, textStatus, error) {
            var dom = getHtml({
                purchaseNo: '',
                theater: $('.theater').html(),
                filmName: $('.film-name').html(),
                seat: $('.seat').html(),
                price: $('.price').html(),
            });
            
            //ver2
            $(dom).find('.purchase-no').remove();
            $('.contents').html(dom);
            $('.steps li').removeClass('active');
            $('.steps li:last-child').addClass('active');

        }).always(function () {

        });
    });
});

function getHtml(_data) {
    var html = '<div class="finish-purchaser">' +
        '<h1 class="page-ttl">購入完了</h1>' +
        '<p class="read">ご希望の座席を選択して次へボタンを押してください。予約できる座席枚数は最大4席までとなります。<br> 画面をタッチすると画面がズームしますので座席を選択してください。</p>' +
        '<ul class="box">' +
            '<li class="purchase-no"><dl><dt>購入番号</dt><dd>'+ _data.purchaseNo +'</dd></dl></li>' +
            '<li>' + _data.theater + '</li>' +
            '<li>' + _data.filmName + '</li>' +
            '<li>' + _data.date + '</li>' +
            '<li>' + _data.seat + '</li>' +
            '<li>' + _data.price + '</li>' +
        '</ul>' +
        '<div class="button-area">' +
            '<div class="prev-link"><a href="/">TOPへ戻る</a></div>' +
        '</div>' + 
    '</div>'
    return html;
}