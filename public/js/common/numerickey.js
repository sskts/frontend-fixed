(function () {
    // ターゲットID
    var target = null;
    // 数値の配列
    var keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'delete', '0', 'done'];
    $(function () {
        var eventName = (window.ontouchend === null) ? 'touchend' : 'click';
        // カバー削除
        $(document).on(eventName, '.numkey-cover', numkeyCoverRemove);
        // フォームをクリックしたとき
        $(document).on(eventName, '.numerickeybord', numerickeyFormClick);
        // マウスで押したときの処理
        $(document).on(eventName, '.numerickey', numerickeyClick);

        // 閉じる・クリアボタンを押したとき
        $(document).on(eventName, '.numerickey-button', numerickeyButtonClick);

    });

    /**
     * @function numkeyCoverRemove
     */
    function numkeyCoverRemove() {
        $('.numkey-cover').remove();
        $('.numkey').remove();
    }
    /**
     * @function numerickeyFormClick
     */
    function numerickeyFormClick() {
        $('.numkey-cover').remove();
        $('.numkey').remove();
        $(this).blur(); //フォーカスを外す

        var html = '<div class="numkey-cover" onclick=""></div>';
        html += '<div class="numkey">';
        html += '<ul>';
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i]
            if (key === 'delete') {
                html += '<li id="delete" class="numerickey-button">消去</li>';
            } else if (key === 'done') {
                html += '<li id="done" class="numerickey-button">OK</li>';
            } else {
                html += '<li id="numerickey' + key + '" class="numerickey" unselectable="on">' + key + '</li>';
            }
        }
        html += '</ul>';
        html += '</div>';

        $('body').append(html);
        var offset = $(this).offset();
        var top = ($(this).hasClass('numerickeybord-top'))
            ? Math.ceil(offset.top) - ($('.numkey').outerHeight() + 10)
            : Math.ceil(offset.top) + $(this).height() + 10;
        var left = Math.ceil(offset.left);
        $('.numkey').css({ 'top': top, 'left': left });
        target = $(this);
    }
    /**
     * @function numerickeyClick
     */
    function numerickeyClick() {
        var maxlength = target.attr('maxlength');
        var id = $(this).attr('id');
        id = id.match(/numerickey(\d+)/)[1];
        var value = target.val() + id;
        if (maxlength !== undefined && maxlength < value.length) {
            return;
        }
        target.val(value);
    }
    /**
     * @function numerickeyButtonClick
     * @param {Event} event
     */
    function numerickeyButtonClick(event) {
        event.preventDefault();
        var id = $(this).attr('id');
        if (id === 'delete') {
            var value = target.val();
            target.val(value.slice(0, value.length - 1));
        } else if (id === 'done') {
            $('.numkey-cover').remove();
            $('.numkey').remove();
        }
    }
})();



