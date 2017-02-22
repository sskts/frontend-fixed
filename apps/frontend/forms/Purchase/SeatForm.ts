import * as express from 'express';
import * as form from 'express-form';

interface Seat {
    seat_num: string;
    seat_section: string;
}

/**
 * 購入座席選択
 */
export default (req: express.Request) => {
    return form(
        form.field('seats', req.__('common.seat')).trim().required().custom((value: string) => {
            try {
                const seats: {
                    list_tmp_reserve: Seat[]
                } = JSON.parse(value);
                for (const seat of seats.list_tmp_reserve) {
                    if (!seat.seat_num || !seat.seat_section) {
                        throw new Error();
                    }
                }
            } catch (err) {
                throw new Error(`%s${req.__('common.validation.is_json')}`);
            }
        }),
        form.field('agree', req.__('common.agreement')).trim().required('', `%s${req.__('common.validation.agree')}`)
    );
};
