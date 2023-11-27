import type { service } from '@cinerino/sdk';
import type * as express from 'express';

declare global {
    namespace Express {
        export interface Request {
            cinerino: {
                service: typeof service;
            };
        }
    }
}
declare module 'express-session' {
    interface SessionData {
        auth: any;
        inquiry: any;
        locale: any;
    }
}
