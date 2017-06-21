(function () {
    // ターゲットID
    var target = null;
    // 数値の配列
    var numeric = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
    $(document).ready(function () {
        $('body').on('click', function () {
            if ($('.numkey').is(':visible')) {
                $('.numkey').remove();
            }
        });
        // フォームをクリックしたとき
        $(document).on('click', '.numerickeybord', function () {
            $('.numkey').remove(); //全部削除
            $(this).blur(); //フォーカスを外す

            var html = '';
            html += '  <div class="numkey">';
            html += '    <ul>';
            for (var i = 0; i < numeric.length; i++) {
                html += '      <li id="numerickey' + numeric[i] + '" class="numerickey" unselectable="on">' + numeric[i] + '</li>';
            }
            html += '       <li id="numkeyclear" class="numerickey_button">クリア</li>';
            html += '       <li id="numkeyclose" class="numerickey_button">閉じる</li>';
            html += '    </ul>';
            html += '  </div>';

            $('body').append(html);
            var offset = $(this).offset();
            var top = ($(this).hasClass('numerickeybord-top'))
                ? Math.ceil(offset.top) - ($('.numkey').height() + 10)
                : Math.ceil(offset.top) + $(this).height() + 10;
            var left = Math.ceil(offset.left);
            $('.numkey').css({ 'top': top, 'left': left });
            target = $(this);
        });

        var eventName = (window.ontouchend === null) ? 'touchend' : 'click';
        // マウスで押したときの処理
        $(document).on(eventName, '.numerickey', function () {
            var id = $(this).attr('id');
            id = id.match(/numerickey(\d+)/)[1];
            var val = target.val();
            target.val(val + id);
        });

        // 閉じる・クリアボタンを押したとき
        $(document).on(eventName, '.numerickey_button', function (event) {
            event.preventDefault();
            var id = $(this).attr('id');
            if (id === 'numkeyclear') {
                var value = target.val();
                target.val(value.slice(0, value.length - 1));
            } else if (id === 'numkeyclose') {
                $('.numkey').remove(); //全部削除
            }
        });

    });
})();



