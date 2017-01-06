"use strict";
const i18n = require("i18n");
i18n.configure({
    locales: ['ja', 'en'],
    defaultLocale: 'ja',
    directory: `${__dirname}/../locales`,
    objectNotation: true
});
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = i18n;
