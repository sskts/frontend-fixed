import form = require('express-form');


/**
 * 購入者情報入力フォーム
 */
export default form(
    //TODO　項目確認
    // form.field('last_name_kanji', '姓').trim().required('', '%sが未入力です')
    //     .maxLength(15, '%sは15文字以内で入力してください'),
    // form.field('first_name_kanji', '名').trim().required('', '%sが未入力です')
    //     .maxLength(15, '%sは15文字以内で入力してください'),
    form.field('last_name_hira', 'せい').trim().required('', '%sが未入力です')
        .maxLength(30, '%sは30文字以内で入力してください')
        .regex(/^[ぁ-ゞ]+$/, '%sは全角ひらがなで入力してください'),
    form.field('first_name_hira', 'めい').trim().required('', '%sが未入力です')
        .maxLength(30, '%sは30文字以内で入力してください')
        .regex(/^[ぁ-ゞ]+$/, '%sは全角ひらがなで入力してください'),
    form.field('mail_addr', 'メールアドレス').trim().required('', '%sが未入力です')
        .isEmail('%sが不適切です'),
    form.field('mail_confirm', 'メールアドレス(確認)').trim().required('', '%sが未入力です')
        .isEmail('%sが不適切です')
        .equals('field::mail_addr', 'メールアドレスが一致しません'),
    form.field('tel_num', '電話番号').trim().required('', '%sが未入力です')
        .regex(/^[0-9]+$/, '%sは数字で入力してください'),

    // form.field('gmo_token_object').trim().required()

    
);
