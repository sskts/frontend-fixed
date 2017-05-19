/**
 * 情報を送る
 * ※ DBへ保存するものは直接書く（外部ツールからは挿入しない）
 * @function collection
 * @param {string} args.client クライアントID
 * @param {string} args.label ラベル
 * @param {string} args.category カテゴリー(使用方法はクライアント次第)
 * @param {string} args.action アクション(使用方法はクライアント次第)
 * @param {string} args.message メッセージ(使用方法はクライアント次第)
 * @param {string} args.notes 備考(使用方法はクライアント次第)
 * @param {string} args.transaction 取引ID
 * @returns {void}
 */
function collection(args) {
    var API_ENDPOINT = $('input[name=webhookApiEndPoint]').val();
    var TIMEOUT = 5000;
    // 必須チェック
    if (args.client === undefined || args.label === undefined) return;
    getCurrentPosition(function (locations) {
        var data = {
            client: args.client, // クライアントID
            occurred_at: new Date().toISOString(), // 発生日時(ISO 8601 format)
            label: args.label, // ラベル
            url: location.href, // URL
            category: (args.category === undefined) ? '' : args.category, // カテゴリー(使用方法はクライアント次第)
            action: (args.action === undefined) ? '' : args.action, // アクション(使用方法はクライアント次第)
            message: (args.message === undefined) ? '' : args.message, // メッセージ(使用方法はクライアント次第)
            notes: (args.notes === undefined) ? '' : args.notes, // 備考(使用方法はクライアント次第)
            useragent: window.navigator.userAgent, // ユーザーエージェント
            location: locations, // ユーザー位置情報
            transaction: (args.transaction === undefined) ? '' : args.transaction, // 取引ID
        };
        $.ajax({
            dataType: 'json',
            url: API_ENDPOINT + '/clientEvents',
            type: 'POST',
            data: data,
            timeout: TIMEOUT
        });
    });
}

/**
 * 位置情報取得
 * @function getCurrentPosition
 * @param {function(number[])} cb コールバック
 * @returns {void}
 */
function getCurrentPosition(cb) {
    var geolocation = [];
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (data) {
            if (data.latitude !== null && data.longitude !== null) {
                geolocation = [data.coords.latitude, data.coords.longitude];
            }
            cb(geolocation);
        });
    } else {
        cb(geolocation);
    }
}
