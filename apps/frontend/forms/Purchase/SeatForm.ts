import form = require('express-form');

interface seat {
    seat_num: string,
    seat_section: string,
}

export default form(
    form.field('seats', '座席').trim().required().custom((value: string) => {
        try {
            let seats: {
                list_tmp_reserve: Array<seat>
            } = JSON.parse(value);
            for (let seat of seats.list_tmp_reserve) {
                if (!seat.seat_num || !seat.seat_section) {
                    throw new Error();
                }
            }
        } catch (err) {
            throw new Error('%sの形式がただしくありません。');
        }
    }),
    form.field('agree', '利用規約').trim().required('', '%sに同意してください')
);


