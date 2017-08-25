/*!
*  スター精密社製サーマルプリンタで入場券を印刷する用モジュール (操作にはPromiseを返す。重大な処理エラーのみその場でalertを出す)
*  StarWebPRNT = http://www.star-m.jp/products/s_print/solutions/sdk/webprnt.html
*/
window.starThermalPrint = (function (StarWebPrintBuilder, StarWebPrintTrader) {
    'use strict';

    var port = /https/.test(window.location.protocol) ? 443 : 80;

    // 使用端末ID
    var device_id = '';

    // 印刷内容生成インスタンス
    var builder = new StarWebPrintBuilder();

    //制御用インスタンス
    var trader = null;

    // 初期化済みフラグ
    var bool_initialized = false;

    // プリンターが使える状態かのBooleanを返す (状態ステータスは拾えないのでほぼ無意味だがEPSON版との互換性のため残置)
    var isReady = function () { return (bool_initialized) ? true : false; };

    var getErrorMsgByReceivedResponse = function (response) {
        var msg = '';
        try {
            
            if (trader.isOffLine({ traderStatus: response.traderStatus })) {
                msg += 'プリンターがオフラインです\n';
            }
            if (trader.isNonRecoverableError({ traderStatus: response.traderStatus })) {
                msg += 'プリンターに復帰不可能エラーが発生しています\n';
            }
            if (response.traderCode === '1100') {
                msg += 'プリンターまたはご利用端末が通信不能な状態です\n';
            }
            if (response.traderCode === '2001') {
                msg += 'プリンターがビジー状態です\n';
            }
            if (trader.isHighTemperatureStop({ traderStatus: response.traderStatus })) {
                msg += '印字ヘッドが高温のため停止しています\n';
            }
            if (trader.isAutoCutterError({ traderStatus: response.traderStatus })) {
                msg += '用紙カッターに異常が起きています\n';
            }
            if (trader.isBlackMarkError({ traderStatus: response.traderStatus })) {
                msg += 'ブラックマークエラー\n';
            }
            if (trader.isCoverOpen({ traderStatus: response.traderStatus })) {
                msg += 'プリンターカバーが開いています\n';
            }
            if (trader.isPaperEnd({ traderStatus: response.traderStatus })) {
                msg += '用紙切れです\n';
            }
            if (!response.traderSuccess || response.traderCode !== '0') {
                msg += '[traderSuccess:' + response.traderSuccess + ', ';
                msg += 'TraderCode:' + response.traderCode + ', ';
                msg += 'TraderStatus:' + response.traderStatus + ', ';
                msg += 'Status:' + response.status + ']';
            }
        } catch (e) {
            msg = e.message;
        }
        return msg;
    };


    // 打刻用ゼロパディング
    var zp = function (num) { return (parseInt(num, 10) < 10) ? '0' + num : num; };


    // 印刷命令組み立て
    var genRequestByReservationObj = function (reservation) {
        //印刷命令
        var request = '';

        try {
            // 印刷に必要な情報が欠けていないか確認
            var missings = [
                'reserveNo',
                'filmNameJa',
                'filmNameEn',
                'theaterName',
                'screenName',
                'performanceDay',
                'performanceStartTime',
                'seatCode',
                'ticketName',
                'ticketSalePrice',
                'qrStr'
            ].filter(function (item) {
                return (reservation[item] === undefined || reservation[item] === null);
            });
            if (missings[0]) {
                throw ({ message: '[!] 予約番号' + reservation.reserveNo + 'の以下の情報が見つかりませんでした\n' + missings.join('\n') });
            }

            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            canvas.width = 560;
            canvas.height = 450;
            var left = 0;
            var center = canvas.width / 2;
            var right = canvas.width;
            var top = 0;
            var bottom = 450;

            // 劇場
            ctx.fillStyle = "black";
            ctx.font = "normal 24px sans-serif";
            ctx.textAlign = 'center';
            ctx.fillText(reservation.theaterName, center, 30);
            // 鑑賞日時
            ctx.font = "bold 30px sans-serif";
            ctx.fillText(reservation.performanceDay + ' ' + reservation.performanceStartTime + '～', center, 70);
            ctx.strokeStyle = '#000';
            ctx.beginPath();
            ctx.moveTo(80, 80);
            ctx.lineTo((canvas.width - 80), 80);
            ctx.closePath();
            ctx.stroke();

            // 作品名
            ctx.font = "normal 30px sans-serif";
            var title = reservation.filmNameJa;
            var titleLimit = 20;
            if (title.length > titleLimit) {
                ctx.fillText(title.slice(0, titleLimit), center, 120);
                ctx.fillText(title.slice(titleLimit, title.length), center, 160);
            } else {
                ctx.fillText(title, center, 120);
            }
            // スクリーン
            ctx.beginPath();
            ctx.fillRect(0, 170, canvas.width, 50);
            ctx.font = "bold 40px sans-serif";
            ctx.fillStyle = '#FFF';
            ctx.fillText(reservation.screenName, center, 210);
            // 座席
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 220, canvas.width - 2, 50);
            ctx.strokeRect(0, 220, canvas.width, 50);
            ctx.fillStyle = '#000';
            ctx.fillText(reservation.seatCode, center, 260);
            // 券種
            ctx.textAlign = 'left';
            ctx.font = "normal 30px sans-serif";
            ctx.fillText(reservation.ticketName, 0, 310);
            // 金額
            ctx.textAlign = 'right';
            ctx.fillText('￥' + reservation.ticketSalePrice + '-', right, 310);
            // QR
            var qr = new VanillaQR({
                url: reservation.qrStr,
                width: 120,
                height: 120,
                colorLight: '#FFF',
                colorDark: '#000',
                noBorder: true
            });

            ctx.drawImage(qr.domElement, (canvas.width - 120), 320, 120, 120);
            // 発券時間
            ctx.textAlign = 'left';
            ctx.font = "normal 24px sans-serif";
            var dateObj = new Date();
            var dateStr = '(' + dateObj.getFullYear() + '/' + zp(dateObj.getMonth() + 1) + '/' + zp(dateObj.getDate()) + ' ' + zp(dateObj.getHours()) + ':' + zp(dateObj.getMinutes()) + ' 発券)';
            ctx.fillText(dateStr, left, bottom);
            // 購入番号
            ctx.fillText('購入番号: ' + reservation.reserveNo, left, bottom - 60);
            // 端末ID
            ctx.fillText('端末ID: ' + device_id, left, bottom - 30);

            request = builder.createBitImageElement({ context: ctx, x: 0, y: 0, width: 560, height: 450 });

            // 紙を切断
            request += builder.createCutPaperElement({
                feed: true,
                type: 'partial' // (プリンタから落ちないように首の皮一枚残す)
            });

        } catch (e) {
            console.log(e.message);
            request = null;
        }

        return request;
    };



    // 予約印刷
    var printReservationArray = function (reservations) {
        return new Promise(function (resolve, reject) {
            if (!bool_initialized) {
                return reject('プリンターが初期化されていません ( window.starThermalPrint.init() してください )');
            }
            try {
                // 念のためクリア
                trader.onReceive = function () { };
                trader.onError = function () { };

                //予約情報の配列を印刷データに変換
                var request = '';
                reservations.forEach(function (reservation) {
                    var temp = genRequestByReservationObj(reservation);
                    if (!temp) {
                        console.log('[!] 予約番号' + reservation.reserve_no + 'の印刷は印刷データ作成エラーが起きたためスキップされました');
                    } else {
                        request += temp;
                    }
                });
                if (!request) {
                    throw ({ message: '[!] 印刷に失敗しました' });
                }

                // 印刷命令送信後のコールバックイベントでresolve/reject
                trader.onReceive = function (response) {
                    var errorMsg = getErrorMsgByReceivedResponse(response);
                    if (errorMsg) {
                        console.log('StarWebPRNT: ' + errorMsg);
                        reject(errorMsg);
                    } else {
                        console.log('StarWebPRNT: 印刷成功');
                        resolve();
                    }
                };

                // 印刷命令失敗処理 (ajax:errorの意味であって印刷のエラーで着火するものではない)
                trader.onError = function (response) {
                    var errorMsg = 'プリンターとの通信に失敗しました\n[' + trader.url + ', ErrorStatus:' + response.status + ', ResponseText:' + response.responseText + ']';
                    console.log('StarWebPRNT: ' + errorMsg);
                    reject(errorMsg);
                };

                // プリンターに送信
                console.log('StarWebPRNT: 印刷命令を送信 [' + trader.url + ']');
                // console.log('trader.sendMessage()', request);
                trader.sendMessage({ request: request });
            }
            catch (e) {
                reject(e.message);
            }
        });
    };

    // 予約単体印刷
    var printReservation = function (reservation) { return printReservationArray([reservation]); };


    // 初期化
    var init = function (args) {
        return new Promise(function (resolve, reject) {
            if (!args || !args.ipAddress || typeof args.ipAddress !== 'string') {
                reject('プリンターのIPアドレスが正しく指定されていません');
            }
            if (!args.deviceId || typeof args.deviceId !== 'string') {
                reject('端末IDが正しく指定されていません');
            }
            args.port = port;
            console.log('StarWebPRNT: StarWebPrintTrader初期化中...', args);

            try {
                // ※設定が入ったtraderオブジェクトが作られるだけでここで非同期処理は起きない
                trader = new StarWebPrintTrader({
                    url: '//' + args.ipAddress + ':' + port + '/StarWebPRNT/SendMessage',
                    papertype: 'normal',
                    blackmark_sensor: 'front_side'
                });

                // プリンター通信タイムアウトms (sendMessageしてからonReceiveイベント発生(プリンタが印刷を終えた時)までの時間)
                var timeout = parseInt(args.timeout, 10);
                trader.timeout = isNaN(timeout) ? 10000 : timeout;

                device_id = args.deviceId;

                // 初期化完了とする
                bool_initialized = true;
                console.log('StarWebPRNT: StarWebPrintTrader初期化OK', trader);

                resolve();
            } catch (e) {
                reject(e.message);
            }
        });
    };


    return {
        init: init,
        isReady: isReady,
        builder: builder,
        trader: trader,
        printReservation: printReservation,
        printReservationArray: printReservationArray
    };

})(StarWebPrintBuilder, StarWebPrintTrader);
