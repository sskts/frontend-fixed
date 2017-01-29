"use strict";
const BaseController_1 = require("../BaseController");
class ErrorController extends BaseController_1.default {
    notFound() {
        let status = 404;
        if (this.req.xhr) {
            this.res.status(status).send({ error: 'Not Found.' });
        }
        else {
            this.res.status(status);
            return this.res.render('error/notFound');
        }
    }
    index(err) {
        this.logger.error(err.stack);
        if (this.req.session)
            delete this.req.session['purchase'];
        let status = 500;
        if (this.req.xhr) {
            this.res.status(status).send({ error: 'Something failed.' });
        }
        else {
            this.res.status(status);
            this.res.locals['message'] = err.message;
            this.res.locals['error'] = err;
            return this.res.render('error/error');
        }
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ErrorController;
