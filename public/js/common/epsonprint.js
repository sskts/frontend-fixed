/*!
*  EPSON製サーマルプリンタで入場券を印刷 (操作にはPromiseを返す。プリンタのエラーはdocumentにEventを渡す。重大な処理エラーのみその場でalertを出す)
*  Epson ePOS SDK for JavaScript = http://partner.epson.jp/support/small_printer/develop/devkit.htm
*/
window.epsonThermalPrint = (function (epson) {
    'use strict';

    // 使用ポート (http = 8008, SSL = 443) ※ SSL接続するにはブラウザに事前準備した証明書(.der)のインストールが必要
    var port = /https/.test(window.location.protocol) ? 443 : 8008;

    // 接続先ePOSデバイスオブジェクト
    var ePOSDevice = null;

    // ePOSデバイスから取得するプリンターオブジェクト
    var printer = null;

    // 初期化済みフラグ
    var bool_initialized = false;

    // エラーステータス (該当するのが1個とは限らないので配列)
    var errorStatusArray = [];

    // ステータスエラー発生中フラグ
    var bool_statusErrorOccuring = false;

    // プリンターが使える状態かのBooleanを返す
    var isReady = function () { return bool_initialized && printer && ePOSDevice.isConnected() && !bool_statusErrorOccuring && !errorStatusArray[0]; };

    // "printer.send()"で印刷命令送信後に"onreceive"イベントで渡される"code"の対応表 (ref. "ePOS_SDK_JavaScript_um_ja_revD.pdf" p.170)
    var CONST_ERRORMSG = {
        EPTR_AUTOMATICAL: '自動復帰エラー発生',
        EPTR_BATTERY_LOW: 'バッテリー残量なし',
        EPTR_COVER_OPEN: 'カバーオープンエラー発生',
        EPTR_CUTTER: 'オートカッターエラー発生',
        EPTR_MECHANICAL: 'メカニカルエラー発生',
        EPTR_REC_EMPTY: 'ロール紙エンド',
        EPTR_UNRECOVERABLE: '復帰不可能エラー発生',
        SchemaError: '印刷要求 XML の構文に誤りがある',
        DeviceNotFound: 'デバイス ID で指定したプリンターが存在しない',
        PrintSystemError: '印刷システムにエラーが発生',
        EX_BADPORT: '通信ポートに異常を検出',
        EX_TIMEOUT: '印刷タイムアウト発生',
        EX_SPOOLER: '印刷キューに空き容量がない',
        JobNotFound: '指定のジョブ ID が存在しない',
        Printing: '印刷中',
        TooManyRequests: '印刷データ送信数が許容量を超えた'
    };
    var getErrorMsgString = function (code) {
        return CONST_ERRORMSG[code] || '';
    };

    // "printer"オブジェクトの"onstatuschange"で渡される"status"でエラー系のものをチェック (ref. "ePOS_SDK_JavaScript_um_ja_revD.pdf" p.170)
    var CONST_STATUSMSG = {
        // ASB_NO_RESPONSE: 'プリンター無応答', ※ ページリロード時なども出てくるので無視する
        ASB_OFF_LINE: 'オフライン状態',
        ASB_COVER_OPEN: 'カバーオープン',
        ASB_PAPER_FEED: ' 紙送りスイッチによる紙送り中',
        ASB_WAIT_ON_LINE: 'オンライン復帰待ち中',
        ASB_PANEL_SWITCH: 'パネルスイッチ操作中',
        ASB_MECHANICAL_ERR: 'メカニカルエラー発生',
        ASB_AUTOCUTTER_ERR: 'オートカッターエラー発生',
        ASB_UNRECOVER_ERR: '復帰不可能エラー発生',
        ASB_AUTORECOVER_ERR: '自動復帰エラー発生',
        ASB_RECEIPT_END: 'ロール紙エンド',
        ASB_SPOOLER_IS_STOPPED: 'スプーラーが停止'
    };
    // プリンターのstatusをステータスコードのArrayに変換
    var getStatusCodeArrayFromStatus = function (status) {
        var ret = [];
        Object.keys(CONST_STATUSMSG).forEach(function (code) {
            if (status & printer[code]) { // statusとprinter内の定数とのAND演算
                ret.push(code);
            }
        });
        return ret;
    };
    // ↑のステータスコードの配列をメッセージ化する
    var getStatusMsgFromCodeArray = function (statusCodeArray, prefix, suffix) {
        var ret = '';
        if (typeof prefix !== 'string') { prefix = ''; }
        if (typeof suffix !== 'string') { suffix = ''; }
        statusCodeArray.forEach(function (code) {
            ret += prefix + CONST_STATUSMSG[code] + suffix;
        });
        return ret;
    };

    // イベント監視 ()
    var setPrinterEventHandlers = function () {
        // プリンターのステータスが変わってエラー系になった時に表示
        printer.onstatuschange = function (status) {
            errorStatusArray = getStatusCodeArrayFromStatus(status);
            if (errorStatusArray[0]) {
                var errMsg = getStatusMsgFromCodeArray(errorStatusArray, 'プリンター:', '\n');
                console.log(errMsg);
                bool_statusErrorOccuring = true;
                document.dispatchEvent(new CustomEvent('printerError', { detail: {
                    errorStatusArray: errorStatusArray,
                    errorMsg: errMsg
                }}));
            } else if (bool_initialized && bool_statusErrorOccuring) {
                bool_statusErrorOccuring = false;
                document.dispatchEvent(new CustomEvent('printerErrorClear'));
            }
        };

        /* 以下はonstatuschangeに現れないのでイベントで拾う */
        // プリンターがオンラインになった時
        printer.ononline = function () {
            console.log('プリンター: オンライン');
        };
        // プリンターのカバーの状態がOKになった時
        printer.oncoverok = function () {
            console.log('プリンター: カバー状態OK');
        };
        // 紙が正常にセットされた時
        printer.onpaperok = function () {
            console.log('プリンター: 給紙状態OK');
        };
        // 紙が残り少なくなった時 (これは筐体のLEDにも表示される)
        printer.onpapernearend = function () {
            console.log('プリンター: 印刷用紙の残りが少なくなっています');
        };

        // プリンターのタイムアウトを5000msに (初期値 = 10000)
        printer.timeout = 5000;

        // 監視開始 (2000msごとにステータス取得)
        printer.interval = 2000;
        printer.startMonitor()
    };


    // 打刻用ゼロパディング
    var zp = function (num) { return (parseInt(num, 10) < 10) ? '0' + num : num; };

    // 印刷命令組み立て (ref. "ePOS_SDK_JavaScript_um_ja_revD.pdf" p.30-32)
    var genRequestByReservationObj = function (reservation) {
        // 印刷命令はprinter.messageに追記されていく(実体はXMLのString)ので避難しておいてまた戻す (この関数はあくまで印刷命令のStringを作って返すだけのものとする)
        var ret = '';
        var temp = printer.message;
        printer.message = '';

        try{
            // 印刷に必要な情報が欠けていないか確認
            var missings = [
                'reserve_no',
                'film_name_ja',
                'film_name_en',
                'theater_name',
                'screen_name',
                'performance_day',
                'performance_start_time',
                'seat_code',
                'ticket_name',
                'ticket_sale_price',
                'qr_str'
            ].filter(function (item) {
                return (!reservation[item]);
            });
            if (missings[0]) {
                throw({ message: '[!] 予約番号' + reservation.reserve_no + 'の以下の情報が見つかりませんでした\n' + missings.join('\n') });
            }

            // 念のためprinterの書式を初期化
            printer.addTextLang('ja');
            printer.addTextSize(1, 1);
            printer.addTextStyle(false, false, false);

            // 中央揃え開始
            printer.addTextAlign(printer.ALIGN_CENTER);

            // 一行目
            printer.addText('チケット兼領収書\n\n');

            // ロゴ画像
            // printer.addImage(); request += tiff_logo;

            // 案内文言
            printer.addText('\nこちらのQRコードを入場時リーダーにかざし、ご入場ください\n\n');


            // 予約IDからQRコードを生成して配置
            printer.addSymbol(reservation.qr_str, printer.SYMBOL_QRCODE_MODEL_2, printer.LEVEL_M, 8);

            // 中央揃え解除
            printer.addTextAlign(printer.ALIGN_LEFT);

            // 作品名見出し
            printer.addText('\n作品名-TITLE-\n');

            // 作品名を強調で
            printer.addTextStyle(false, false, true);
            printer.addText(reservation.film_name_ja + '\n');
            printer.addText(reservation.film_name_en + '\n');

            // 強調を解除して日時見出し
            printer.addTextStyle(false, false, false);
            printer.addText('鑑賞日時\n');

            // 日付と上映時刻を強調で
            printer.addTextStyle(false, false, true);
            printer.addText(reservation.performance_day + ' ' + reservation.performance_start_time + '\n');

            // 強調を解除して座席位置の見出し
            printer.addTextStyle(false, false, false);
            printer.addText('座席位置-スクリーン\n');

            // 中央揃え開始
            printer.addTextAlign(printer.ALIGN_CENTER);

            // 文字サイズ2でスクリーン名
            printer.addTextSize(2, 2);
            printer.addText(reservation.screen_name + '\n');

            // 文字サイズ3で座席コード
            printer.addTextSize(3, 3);
            printer.addText(reservation.seat_code + '\n');

            // 中央揃え解除 & 文字サイズ戻し
            printer.addTextAlign(printer.ALIGN_LEFT);
            printer.addTextSize(1, 1);

            // 劇場名見出し
            printer.addText('劇場\n');

            // 劇場名を強調で
            printer.addTextStyle(false, false, true);
            printer.addText(reservation.theater_name + '\n');

            // 強調解除して券種金額見出し
            printer.addTextStyle(false, false, false);
            printer.addText('券種・金額\n');

            // 券種と金額を強調で
            printer.addTextStyle(false, false, true);
            printer.addText(reservation.ticket_name + ' ' + reservation.ticket_sale_price + '\n');

            // 強調解除して購入番号見出し
            printer.addTextStyle(false, false, false);
            printer.addText('\n購入番号\n');

            // 予約番号を強調で
            printer.addTextStyle(false, false, true);
            printer.addText(reservation.reserve_no + '\n\n');

            //最後右端に印刷時刻(Y/m/d H:i:s)を入れる
            printer.addTextAlign(printer.ALIGN_RIGHT);
            printer.addTextStyle(false, false, false);
            var dateObj = new Date();
            var dateStr = dateObj.getFullYear()+'/'+zp(dateObj.getMonth()+1)+'/'+zp(dateObj.getDate())+' '+zp(dateObj.getHours())+':'+zp(dateObj.getMinutes())+':'+zp(dateObj.getSeconds());
            printer.addText(dateStr);

            // 紙を切断 ※EPSON機種はパーシャルカットのみ。
            printer.addText('\n'); // ※addCut命令は改行の直後でないと無視される
            printer.addCut(printer.CUT_FEED);
        } catch (e) {
            alert(e.message);
            printer.message = '';
            ret = '';
        }

        ret = printer.message;
        printer.message = temp;

        return ret;
    };



    // 予約印刷
    var printReservationArray = function (reservations) { return new Promise(function (resolve, reject) {
        if (!bool_initialized) {
            return reject('プリンターが初期化されていません ( window.epsonThermalPrint.init() してください )');
        }
        if (!isReady()) {
            return reject('プリンターが現在使用できない状態になっています\n\n' + getStatusMsgFromCodeArray(errorStatusArray, '', '\n' ));
        }
        try{
            // 念のため印刷命令をクリア
            printer.message = '';

            //予約情報の配列を印刷データに変換
            var request = '';
            reservations.forEach(function (reservation) {
                var temp = genRequestByReservationObj(reservation);
                if (!temp) {
                    alert('[!] 予約番号' + reservation.reserve_no + 'の印刷は印刷データ作成エラーが起きたためスキップされました');
                } else {
                    request += temp;
                }
            });
            if (!request) {
                throw({ message: '[!] 印刷に失敗しました' });
            }

            // 印刷命令にセット
            printer.message = request;

            // 印刷命令送信後のコールバックイベントでresolve/reject
            printer.onreceive = function (res) {
                if (res.success) {
                    resolve();
                } else {
                    reject(getErrorMsgString(res.code));
                }
            };

            //プリンターに送信
            // console.log('printer.send()', printer.message);
            printer.send();
        }
        catch (e) {
            reject(e.message);
        }
    });};


    // 予約単体印刷
    var printReservation = function (reservation) { return printReservationArray([reservation]); };


    // 初期化
    var init = function (ipAddress) { return new Promise(function (resolve, reject) {
        if (!ipAddress || typeof ipAddress !== 'string') {
            reject('プリンターのIPアドレスが指定されていません');
        }
        try {
            // ※プリンタに限らないePOSデバイス共通の初期化処理
            ePOSDevice = new window.epson.ePOSDevice();
            ePOSDevice.onreconnecting = function () {
                console.log('ePOSDevice Service Interface: (接続後ネットワークが途絶したため再接続中)');
            };
            ePOSDevice.onreconnect = function () {
                console.log('ePOSDevice Service Interface: ネットワーク再接続成功'); 
            };
            ePOSDevice.ondisconnect = function () {
                console.log('ePOSDevice Service Interface: ネットワーク切断');
            };

            // ePOSデバイスに接続(socket.ioで接続を試みて失敗するとajaxでのポーリングに切り替わる)
            console.log('ePOSDevice Service Interface: 接続中... [' + ipAddress + ':' + port +']');
            ePOSDevice.connect(ipAddress, port, function (res) {
                if (res !== 'OK' && res !== 'SSL_CONNECT_OK') {
                    var msg = 'ePOSDeviceに接続できせんでした [' + ipAddress + ':' + port + '][' + res + ']';
                    console.log('ePOSDevice Service Interface: ' + msg);
                    return reject(msg);
                }
                console.log('ePOSDevice Service Interface: 接続OK');

                // 接続したePOSデバイスからプリンターのインスタンスを取得
                console.log('ePOSDevice Service Interface: プリンター取得中...')
                ePOSDevice.createDevice('local_printer', ePOSDevice.DEVICE_TYPE_PRINTER, { crypto: true, buffer: true }, function (createdDevice, code) {
                    if (!createdDevice) {
                        var msg = 'ePOSDeviceからプリンターを取得できせんでした [' + code + ']';
                        console.log('ePOSDevice Service Interface: ' + msg);
                        return reject(msg);
                    }
                    console.log('ePOSDevice Service Interface: プリンター取得OK');
                    printer = createdDevice;

                    // プリンターの監視を開始
                    setPrinterEventHandlers();

                    // 初期化完了とする
                    bool_initialized = true;

                    resolve();
                });
            });
        } catch (e) {
            reject(e.message);
        }
    });};


    return {
        init: init,
        isReady: isReady,
        getErrorStatusString: function () { return getStatusMsgFromCodeArray(errorStatusArray, '', ','); },
        getErrorStatusArray: function () { return errorStatusArray; },
        ePOSDevice: ePOSDevice,
        printer: printer,
        printReservation: printReservation,
        printReservationArray: printReservationArray
    };

})(window.epson);
