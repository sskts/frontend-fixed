"use strict";
var Module;
(function (Module) {
    function notFound(req, res, _next) {
        let status = 404;
        if (req.xhr) {
            res.status(status).send({ error: 'Not Found.' });
        }
        else {
            res.status(status);
            return res.render('error/notFound');
        }
    }
    Module.notFound = notFound;
    function index(err, req, res, _next) {
        console.log(err.stack);
        if (req.session)
            delete req.session['purchase'];
        let status = 500;
        if (req.xhr) {
            res.status(status).send({ error: 'Something failed.' });
        }
        else {
            res.status(status);
            res.locals['message'] = err.message;
            res.locals['error'] = err;
            return res.render('error/error');
        }
    }
    Module.index = index;
})(Module = exports.Module || (exports.Module = {}));
