import express = require('express');

declare global {
    namespace Express {
        class Session {
            auth: any;
            purchase: any;
            mvtk: any;
            complete: any;
            inquiry: any;
        }
    }
}
