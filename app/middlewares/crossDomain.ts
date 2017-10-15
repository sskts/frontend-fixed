/**
 * crossDomain
 */
import * as cors from 'cors';

const corsOptions: cors.CorsOptions = {
    origin: process.env.APP_SITE_URL
};

export const crossDomain = cors(corsOptions);
