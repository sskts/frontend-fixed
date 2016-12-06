$(function () {
    var modal = new Modal();
    $(document).on('click', '.prev-button button', function (event) {
        event.preventDefault();
    });


    var url = location.pathname;
    if (url === '/purchase/seatSelect') {
        var screenSeatStatusesMap = new ScreenSeatStatusesMap($('.screen'));
        /**
         * 座席クリックイベント
         */
        $(document).on('click', '.screen .seat a', function () {
            // スマホで拡大操作
            if (screenSeatStatusesMap.isDeviceType('sp') && screenSeatStatusesMap.state === ScreenSeatStatusesMap.STATE_DEFAULT) {
                return;
            }
            var limit = Number($('.screen-limit').attr('data-limit'));
            // 座席数上限チェック
            if (!$(this).hasClass('active')) {
                if ($('.screen .seat a.active').length > limit - 1) {
                    alert('上限');
                    return;
                }
            }

            $(this).toggleClass('active');
        });

        /**
         * 次へクリックイベント
         */
        $(document).on('click', '.next-button button', function (event) {
            event.preventDefault();
            // 座席コードリストを取得
            var seatCodes = $('.screen .seat a.active').map(function () {
                return $(this).attr('data-seat-code')
            }
            ).get();

            if (seatCodes.length < 1) {
                alert('未選択');
            } else {
                // location.hrefにpostする
                var form = $('form');
                var dom = $('<input type="hidden" name="seatCodes">').val(JSON.stringify(seatCodes));
                form.append(dom);
                form.submit();
            }
        });
    } else if (url === '/purchase/ticketTypeSelect') {
        /**
         * 券種クリックイベント
         */
        $(document).on('click', '.modal[data-modal="ticket-type"] a', function (event) {
            event.preventDefault();
            var ticketType = $(this).attr('data-ticket-type');
            var ticketName = $(this).parent().parent().parent().find('dt').text();
            var ticketPrice = $(this).attr('data-ticket-price');
            var triggerIndex = $('.modal[data-modal="ticket-type"]').attr('data-modal-trigger-index');
            var target = $('.seats li').eq(triggerIndex);
            target.find('dd a').text(ticketName);
            target.find('dd').attr('data-seat-type', ticketType);
        });

        /**
         * 次へクリックイベント
         */
        $(document).on('click', '.next-button button', function (event) {
            event.preventDefault();
            var result = [];
            var flag = true;
            $('.seats li').each(function (index, elm) {
                var code = $(elm).find('dt').text();
                var type = $(elm).find('dd').attr('data-seat-type');
                result.push({
                    code: code,
                    type: type
                });
                if (!code || !type) {
                    flag = false;
                }
            });

            if (!flag) {
                alert('未選択');
            } else {
                // location.hrefにpostする
                var form = $('form');
                var dom = $('<input type="hidden" name="seatCodes">').val(JSON.stringify(result));
                form.append(dom);
                form.submit();
            }
        });
    } else if (url === '/purchase/enterPurchaser') {
        /**
         * 次へクリックイベント
         */
        $(document).on('click', '.next-button button', function (event) {
            event.preventDefault();
            validation();
            if ($('.validation').length > 0) {
                return;
            }

            var cardno = $('input[name=cardno]').val();
            var expire = $('select[name=creditYear]').val() + $('select[name=creditMonth]').val();
            var securitycode = $('input[name=securitycode]').val();
            var holdername = $('input[name=holdername]').val();
            Multipayment.init('tshop00026096'); // トークンを利用するための api キー
            Multipayment.getToken({
                cardno: cardno, // 加盟店様の購入フォームから取得したカード番号
                expire: expire, // 加盟店様の購入フォームから取得したカード有効期限
                securitycode: securitycode, // 加盟店様の購入フォームから取得したセキュリティコード
                holdername: holdername // 加盟店様の購入フォームから取得したカード名義人
            },
            function(response) {
                someCallbackFunction(response)
            } // トークン取得後に実行する javascript function
            );
        });

        /**
         * トークン取得後イベント
         */
        function someCallbackFunction(response) {
            if (response.resultCode != 000) {
                alert('購入処理中にエラーが発生しました');
            } else {
                //カード情報は念のため値を除去
                $('input[name=cardno]').val('');
                $('select[name=creditYear]').val('');
                $('select[name=creditMonth]').val('');
                $('input[name=securitycode]').val('');
                $('input[name=holdername]').val('');
                //予め購入フォームに用意した token フィールドに、値を設定
                $('input[name=creditToken]').val(response.tokenObject.token);
                //スクリプトからフォームを submit
                //document.getElementById('purchaseform').submit();
                console.log(response)
            }
        }

        /**
         * バリデーション
         */
        function validation() {
            $('.validation').remove();

            var validationList = [
                { name: 'lastNameKanji', label: '姓', required: true, maxLength: 15 },
                { name: 'firstNameKanji', label: '名', required: true, maxLength: 15 },
                { name: 'lastNameHira', label: 'せい', required: true, maxLength: 30, regex: [/^[ぁ-ゞ]+$/, 'は全角ひらがなで入力してください'] },
                { name: 'firstNameHira', label: 'めい', required: true, maxLength: 30, regex: [/^[ぁ-ゞ]+$/, 'は全角ひらがなで入力してください'] },
                { name: 'mail', label: 'メールアドレス', required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, 'は不適切です'] },
                { name: 'mailConfirm', label: 'メールアドレス(確認)', required: true, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, 'は不適切です'], equals: 'mail' },
                { name: 'tel', label: '電話番号', required: true, regex: [/^[0-9]+$/, 'は不適切です'] },
                { name: 'cardno', label: 'クレジットカード番号', required: true, regex: [/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[0-9]{15})$/, 'は不適切です'] },
                { name: 'creditMonth', label: '有効期限（月）', required: true },
                { name: 'creditYear', label: '有効期限（年）', required: true },
                { name: 'holdername', label: 'カード名義人', required: true, regex: [/^[A-Z]+[\s|　]+[A-Z]+[\s|　]*[A-Z]+$/, 'は不適切です'] },
                { name: 'securitycode', label: 'セキュリティーコード', required: true, regex: [/^[0-9]{3,4}$/, 'は不適切です'] },
            ];
            
            
            validationList.forEach(function (validation, index) {
                
                var target = $('input[name=' + validation.name + '], select[name=' + validation.name + ']');
                var value = target.val();
                
                if (validation.required 
                && !value 
                && value == '') {
                    target.after('<div class="validation">' + validation.label + 'が未入力です</div>');
                } else if (validation.maxLength 
                && value.length > validation.maxLength) {
                    target.after('<div class="validation">' + validation.label + 'は' + validation.maxLength + '文字以内で入力してください</div>');
                } else if (validation.regex
                && !value.match(validation.regex[0])) {
                    target.after('<div class="validation">' + validation.label + validation.regex[1] + '</div>');
                } else if (validation.equals 
                && value !== $('input[name=' + validation.equals + '], select[name=' + validation.equals + ']').val()) {
                    target.after('<div class="validation">' + validation.label + 'が一致しません</div>');
                }
            });

        }
    }



});