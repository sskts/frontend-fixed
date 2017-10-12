$(function () {
    // 初期化
    pageInit();
    // 追加クリックイベント
    $(document).on('click', '.add-button a', addButtonClick);
    // 削除クリックイベント
    $(document).on('click', '.remove-button a', removeButtonClick);
    // QR読み込みクリックイベント
    $(document).on('click', '.read-button a', qrReaderButtonClick);
    // 次へクリックイベント
    $(document).on('click', '.next-button button', nextButtonClick);
    // QRリーダー入力
    $(window).on('keypress', qrReaderInput);
});

/**
 * QRリーダー入力
 * @function qrReaderInput
 * @param {Event} event 
 */
function qrReaderInput(event) {
    var targetModal = $('.modal[data-modal=mvtkQrReader]');
    if (!targetModal.hasClass('active')) {
        return;
    }
    var qrReaderInput = $('input[name=qrReaderInput]');
    var value = qrReaderInput.val();
    if (event.keyCode === 13 && value.length > 0) {
        var index = targetModal.attr('data-index');
        var parent = $('.mvtk-box').eq(index);
        var code = value.slice(0, 10);
        var password = value.slice(10, value.length);
        alert('code: ' + code + ' password: ' + password);
        parent.find('input[name=mvtkCode]').val(code);
        parent.find('input[name=mvtkPassword]').val(password);
        modal.close();
    } else {
        value += String.fromCharCode(event.charCode);
        qrReaderInput.val(value);
    }
}

/**
 * QR読み込みクリックイベント
 * @function qrReaderButtonClick
 * @param {Event} event 
 */
function qrReaderButtonClick(event) {
    event.preventDefault();
    modal.open('mvtkQrReader');
    var qrReaderInput = $('input[name=qrReaderInput]');
    qrReaderInput.val('');
    var target = $(this).parents('.mvtk-box');
    var index = $('.mvtk-box').index(target);
    $('.modal[data-modal=mvtkQrReader]').attr('data-index', index);
}

/**
 * 追加クリックイベント
 * @function addButtonClick
 * @param {Event} event 
 */
function addButtonClick(event) {
    event.preventDefault();
    if ($('.mvtk-box:hidden').length > 0) {
        $('.mvtk-box:hidden').eq(0).addClass('active');
    }
    if ($('.mvtk-box:hidden').length === 0) {
        $('.add-button').hide();
    }
    if ($('.mvtk-box:visible').length > 1) {
        $('.remove-button').show();
    };
}

/**
 * 削除クリックイベント
 * @function removeButtonClick
 * @param {Event} event 
 */
function removeButtonClick(event) {
    event.preventDefault();
    var target = $(this).parents('.mvtk-box');
    target.find('input').val('');
    target.removeClass('active');
    target.find('.validation').removeClass('validation');
    target.find('.validation-text').remove();
    $('.ticket-list').append(target);
    if ($('.mvtk-box:hidden').length > 0) {
        $('.add-button').show();
    }
    if ($('.mvtk-box:visible').length === 1) {
        $('.remove-button').hide();
    };
    var first = $('.mvtk-box').eq(0);
    first.find('input[name=mvtkCode]').removeClass('numerickeybord-top');
    first.find('input[name=mvtkPassword]').removeClass('numerickeybord-top');
}

/**
 * 次へクリックイベント
 * @function nextButtonClick
 * @param {Event} event 
 */
function nextButtonClick(event) {
    event.preventDefault();
    var mvtkList = [];
    var modalBody = $('.modal[data-modal=validation] .modal-body');
    modalBody.html('');
    $('.ticket-list .mvtk-box.active').each(function (index, elem) {
        var target = $(elem);
        var code = target.find('input[name=mvtkCode]').val();
        var password = target.find('input[name=mvtkPassword]').val();
        if (code && password) {
            mvtkList.push({
                code: code,
                password: password
            });
        }
        validation(target);
    });

    if ($('.validation').length > 0) {
        validationScroll();
        return;
    }

    loadingStart(function () {
        var form = $('form');
        var dom = $('input[name=mvtk]').val(JSON.stringify(mvtkList));
        form.append(dom);
        form.submit();
    });
}

/**
 * 初期化
 * @function pageInit
 * @returns {void}
 */
function pageInit() {
    if ($('.mvtk-validation').val()) {
        modal.open('mvtkValidation');
        var errorData = JSON.parse($('.mvtk-validation').val());
        errorData.forEach(function (value) {
            var target = $('.ticket-list .mvtk-box input[value=' + value + ']').parents('.mvtk-box');
            target.find('input[name=mvtkPassword]').val('');
            target.find('input').addClass('validation');
        });
    }
    if ($('.mvtk-box:visible').length === 1) {
        $('.remove-button').hide();
    };
}

/**
 * バリデーションスクロール
 * @function validationScroll
 * @returns {void}
 */
function validationScroll() {
    if (isFixed()) {
        // 券売機
        return;
    }
    var target = $('.validation').eq(0);
    var top = target.offset().top - 20;
    $('html,body').animate({ scrollTop: top }, 300);
}

/**
 * バリデーション
 * @function validation
 * @param {JQuery} parent
 * @returns {void}
 */
function validation(parent) {
    parent.find('.validation').removeClass('validation');
    parent.find('.validation-text').remove();
    var modalBody = $('.modal[data-modal=validation] .modal-body');

    var validationList = [
        { name: 'mvtkCode', label: locales.label.mvtk_code, required: true, maxLength: 10, minLength: 10, regex: [/^[0-9]+$/, locales.validation.is_number] },
        { name: 'mvtkPassword', label: locales.label.mvtk_password, required: true, maxLength: 4, minLength: 4, regex: [/^[0-9]+$/, locales.validation.is_number] }
    ];

    if (isFixed()) {
        validationList = [
            { name: 'mvtkCode', label: locales.label.mvtk_code, required: true, maxLength: 10, minLength: 10, regex: [/^[0-9]+$/, locales.validation.is_number] },
            { name: 'mvtkPassword', label: locales.label.mvtk_password, required: true }
        ];
    }

    var validations = [];
    var names = [];

    validationList.forEach(function (validation, index) {

        var target = parent.find('input[name=' + validation.name + ']');
        var value = target.val();
        var msg = '';

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
            if (isFixed()) {
                // 券売機
                modalBody.append('<div class="mb-small">' + msg + '</div>');
            } else {
                target.after('<div class="validation-text">' + msg + '</div>');
            }
        }
        if (target.hasClass('validation')) {
            validations.push(validation.label + ': ' + msg);
            names.push(validation.name)
        }
    });

    if (validations.length > 0) {
        if (isFixed()) {
            // 券売機
            modal.open('validation');
        }
        // 計測
        collection({
            client: 'sskts-frontend',
            label: 'mvtkValidationMessage',
            action: 'validation',
            category: 'form',
            message: validations.join(', '),
            notes: names.join(', '),
            transaction: $('input[name=transactionId]').val()
        });
    }
}
