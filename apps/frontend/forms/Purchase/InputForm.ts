import form = require('express-form');
import express = require('express');

/**
 * 購入者情報入力フォーム
 */

export default (req: express.Request) => {
    return form(
        form.field('last_name_hira', req.__('common.last_name_hira')).trim()
            .required('', `%s${req.__('common.validation.required')}`)
            .maxLength(30, `%s${req.__('common.validation.maxlength %s', '30')}`)
            .regex(/^[ぁ-ゞー]+$/, `%s${req.__('common.validation.is_hira')}`),
        form.field('first_name_hira', req.__('common.first_name_hira')).trim()
            .required('', `%s${req.__('common.validation.required')}`)
            .maxLength(30, `%s${req.__('common.validation.maxlength %s', '30')}`)
            .regex(/^[ぁ-ゞー]+$/, `%s${req.__('common.validation.is_hira')}`),
        form.field('mail_addr', req.__('common.mail_addr')).trim()
            .required('', `%s${req.__('common.validation.required')}`)
            .isEmail(`%s${req.__('common.validation.is_email')}`),
        form.field('mail_confirm', req.__('common.mail_confirm')).trim()
            .required('', `%s${req.__('common.validation.required')}`)
            .isEmail(`%s${req.__('common.validation.is_email')}`)
            .equals('field::mail_addr', `${req.__('common.mail_addr')}${req.__('common.validation.equals_email')}`),
        form.field('tel_num', req.__('common.tel_num')).trim()
            .required('', `%s${req.__('common.validation.required')}`)
            .regex(/^[0-9]+$/, `%s${req.__('common.validation.is_number')}`),
    );
}
