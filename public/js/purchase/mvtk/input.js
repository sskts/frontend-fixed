$(function () {
    var modal = new SASAKI.Modal();
    // 追加クリックイベント
    $(document).on('click', '.add-button a', function (event) {
        event.preventDefault();
        addTicket();
    });
    // 次へクリックイベント
    $(document).on('click', '.next-button button', function (event) {
        event.preventDefault();
        var mvtkList = [];
        $('.ticket-list ul').each(function(index, elem){
            var target = $(elem);
            var code = target.find('input[name=mvtk_code]').val();
            var password = target.find('input[name=mvtk_password]').val();
            if (code && password) {
                mvtkList.push({
                    code: code,
                    password: password,
                    error: null
                });
            }
            validation(target);
        });

        if ($('.validation-text').length > 0) {
            validationScroll();
            return;
        }

        if (mvtkList.length === 0) {
            modal.open('mvtkNotInput');
            return;
        }

        loadingStart(function () {
            var form = $('form');
            var dom = $('input[name=mvtk]').val(JSON.stringify(mvtkList));
            form.append(dom);
            form.submit();
        });
    });
});

/**
 * チケット追加
 * @function addTicket
 * @returns {void}
 */
function addTicket() {
    var dom = $('.clone').clone();
    dom.removeClass('clone');
    $('.ticket-list').append(dom);
    if ($('.ticket-list ul').length > 2) {
        $('.add-button').remove();
    };
}

/**
 * バリデーションスクロール
 * @function validationScroll
 * @returns {void}
 */
function validationScroll() {
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

    var validationList = [
        { name: 'mvtk_code', label: locales.label.mvtk_code, required: false, maxLength: 10, minLength: 10, regex: [/^[0-9]+$/, locales.validation.is_number]  },
        { name: 'mvtk_password', label: locales.label.mvtk_password, required: false, maxLength: 4, minLength: 4, regex: [/^[0-9]+$/, locales.validation.is_number]  }
    ];

    validationList.forEach(function (validation, index) {

        var target = parent.find('input[name=' + validation.name + ']');
        var value = target.val();

        if (validation.required
            && !value
            && value == '') {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.required + '</div>');
        } else if (validation.maxLength
            && value
            && value.length > validation.maxLength) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.maxlength.replace('30', validation.maxLength) + '</div>');
        } else if (validation.minLength
            && value
            && value.length < validation.minLength - 1) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.minlength.replace('30', validation.minLength) + '</div>');
        } else if (validation.regex
            && value
            && !value.match(validation.regex[0])) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + validation.regex[1] + '</div>');
        } else if (validation.equals
            && value !== $('input[name=' + validation.equals + ']').val()) {
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.equals + '</div>');
        } else if (validation.agree
            && !target.is(':checked')) {
            target = $('label[for=' + validation.name + ']');
            target.addClass('validation');
            target.after('<div class="validation-text">' + validation.label + locales.validation.agree + '</div>');
        }
    });

}