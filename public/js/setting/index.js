var modal;
$(function () {
    modal = new SASAKI.Modal();
    pageInit();
    /**
     * 次へクリックイベント
     */
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        validation();
        if ($('.validation').length > 0) {
            return;
        }
        loadingStart(function () {
            saveConfig();
            loadingEnd();
        });
    });
    $(document).on('click', '.certificate', function (event) {
        var value = $('input[name=printer]').val();
        if (!value) {
            event.preventDefault();
            alert('プリンターが入力されていません。');
        }
        $(this).attr('download', value + '.cer');
        $(this).attr('href', '/cer/' + value + '.cer');
    });
});

/**
 * 初期化
 * @function pageInit
 * @returns {void}
 */
function pageInit() {
    var data = localStorage.getItem('config');
    if (data) {
        var json = JSON.parse(data);
        Object.keys(json).forEach(function (key) {
            var target = $('select[name=' + key + '], input[name=' + key + ']');
            target.val(json[key]);
        });
    }
}

/**
 * 設定保存
 * @function saveConfig
 * @returns {void}
 */
function saveConfig() {
    var data = {
        theater: $('select[name=theater]').val(),
        device_id: $('input[name=device_id]').val(),
        last_name_hira: $('input[name=last_name_hira]').val(),
        first_name_hira: $('input[name=first_name_hira]').val(),
        mail_addr: $('input[name=mail_addr]').val(),
        printer: $('input[name=printer]').val(),
    }
    localStorage.setItem('config', JSON.stringify(data));
}

/**
 * バリデーション
 * @function validation
 * @returns {void}
 */
function validation() {
    $('.validation').removeClass('validation');
    $('.validation-text').remove();
    var modalBody = $('.modal[data-modal=validation] .modal-body');
    modalBody.html('');

    var NAME_MAX_LENGTH = 12;
    var MAIL_MAX_LENGTH = 50;
    var TEL_MAX_LENGTH = 11;
    var TEL_MIN_LENGTH = 9;
    var validationList = [
        { name: 'device_id', label: locales.label.device_id, required: true, maxLength: NAME_MAX_LENGTH, regex: [/^[\-0-9a-zA-Z\.\+_]+$/, locales.validation.is_alphanumeric_characters] },
        { name: 'last_name_hira', label: locales.label.last_name_hira, required: true, maxLength: NAME_MAX_LENGTH, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
        { name: 'first_name_hira', label: locales.label.first_name_hira, required: true, maxLength: NAME_MAX_LENGTH, regex: [/^[ぁ-ゞー]+$/, locales.validation.is_hira] },
        { name: 'mail_addr', label: locales.label.mail_addr, required: true, maxLength: MAIL_MAX_LENGTH, regex: [/^[\-0-9a-zA-Z\.\+_]+@[\-0-9a-zA-Z\.\+_]+\.[a-zA-Z]{2,}$/, locales.validation.is_email] },
        { name: 'printer', label: locales.label.printer, required: true, regex: [/^(([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([1-9]?[0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/, locales.validation.is_ip] }
    ];

    var validations = [];
    var names = [];

    validationList.forEach(function (validation, index) {

        var target = $('input[name=' + validation.name + ']');
        var msg = '';
        if (target.length === 0) {
            return;
        }
        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            msg = validation.label + locales.validation.required;
        } else if (validation.maxLength
            && value
            && value.length > validation.maxLength) {
            msg = validation.label + locales.validation.maxlength.replace('30', validation.maxLength);
        } else if (validation.minLength
            && value
            && value.length < validation.minLength) {
            msg = validation.label + locales.validation.minlength.replace('30', validation.minLength);
        } else if (validation.regex
            && value
            && !value.match(validation.regex[0])) {
            msg = validation.label + validation.regex[1];
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + ']').val()) {
            msg = validation.label + locales.validation.equals;
        } else if (validation.agree
            && !target.is(':checked')) {
            target = $('label[for=' + validation.name + ']');
            msg = validation.label + locales.validation.agree;
        }

        if (msg !== '') {
            target.addClass('validation');
            // 券売機
            modalBody.append('<div class="mb-small">' + msg + '</div>');
        }
        if (target.hasClass('validation')) {
            validations.push(validation.label + ': ' + target.next().text());
            names.push(validation.name)
        }
    });
    if (validations.length > 0) {
        if (isFixed()) {
            // 券売機
            modal.open('validation');
        }
    }
}
