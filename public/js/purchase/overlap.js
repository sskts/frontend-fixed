$(function () {
    /**
     * 仮予約を削除して次へ進むクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        var form = $(this).parent().parent();
        loadingStart(function () {
            form.submit();
        });
    });

    /**
     * 仮予約の購入手続きへ戻るクリックイベント
     */
    $(document).on('click', '.prev-button button', function (event) {
        event.preventDefault();
        var form = $(this).parent().parent();
        loadingStart(function () {
            form.submit();
        });
    });
});