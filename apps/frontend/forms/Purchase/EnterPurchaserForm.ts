import form = require('express-form');


/**
 * 購入者情報入力フォーム
 */
export default form(
    form.field('lastNameKanji', '姓').trim().required('', '%sが未入力です')
        .maxLength(15, '%sは15文字以内で入力してください'),
    form.field('firstNameKanji', '名').trim().required('', '%sが未入力です')
        .maxLength(15, '%sは15文字以内で入力してください'),
    form.field('lastNameHira', 'せい').trim().required('', '%sが未入力です')
        .maxLength(30, '%sは30文字以内で入力してください')
        .regex(/^[ぁ-ゞ]+$/, '%sは全角カタカナで入力してください'),
    form.field('firstNameHira', 'めい').trim().required('', '%sが未入力です')
        .maxLength(30, '%sは30文字以内で入力してください')
        .regex(/^[ぁ-ゞ]+$/, '%sは全角カタカナで入力してください'),
    form.field('mail', 'メールアドレス').trim().required('', '%sが未入力です')
        .isEmail('%sが不適切です'),
    form.field('mailConfirm', 'メールアドレス(確認)').trim().required('', '%sが未入力です')
        .isEmail('%sが不適切です')
        .equals('field::mail', 'メールアドレスが一致しません'),
    form.field('tel', '電話番号').trim().required('', '%sが未入力です')
        .regex(/^[0-9]+$/, '%sは数字で入力してください'),

    form.field('gmoTokenObject').trim().required()

    
);
