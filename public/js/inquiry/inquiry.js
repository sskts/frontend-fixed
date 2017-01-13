$(function () {
    /**
     * 閉じるクリックイベント
     */
    $(document).on('click', '.close-link a', function (event) {
        event.preventDefault();
        window.close();
    });

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
});
