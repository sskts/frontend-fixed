import form = require('express-form');
import PurchaseSession = require('../../models/Purchase/PurchaseModel');

export default form(
    form.field('reserve_tickets', '券種').trim().required().custom((value: string)=>{
        try {
            let tickets: Array<PurchaseSession.ReserveTicket> = JSON.parse(value);
            for (let ticket of tickets) {
                if (!ticket.seat_code
                || !ticket.section
                || !ticket.ticket_code) {
                    throw new Error();
                }
            }
        } catch (err) {
            throw new Error('%sの形式がただしくありません。');
        }
    }),
    form.field('mvtk').trim()
);

