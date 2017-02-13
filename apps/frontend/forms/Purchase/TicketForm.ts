
import form = require('express-form');
import express = require('express');
import PurchaseSession = require('../../models/Purchase/PurchaseModel');

export default (req: express.Request) => {
    return form(
        form.field('reserve_tickets', req.__('common.ticket')).trim().required().custom((value: string) => {
            try {
                const tickets: PurchaseSession.ReserveTicket[] = JSON.parse(value);
                for (const ticket of tickets) {
                    if (!ticket.seat_code
                        || !ticket.section
                        || !ticket.ticket_code) {
                        throw new Error();
                    }
                }
            } catch (err) {
                throw new Error(`%s${req.__('common.validation.is_json')}`);
            }
        }),
        form.field('mvtk').trim()
    );
};
