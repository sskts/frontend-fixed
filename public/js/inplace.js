inplaceInit();
/**
 * 券売機初期化
 * @function inplaceInit
 * @returns {void}
 */
function inplaceInit() {
    // 設定確認
    if (!(location.pathname.indexOf('/setting') > -1 
    || location.pathname.indexOf('/stop') > -1)) {
        var data = localStorage.getItem('config');
        if (data === null) {
            // 設定なければリダイレクト
            location.replace = '/stop';
        }
    }
}