"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
/**
 *
 */
const options = {
    url: 'https://reservetest.movieticket.jp:2443/Seat/SeatInfoSyncSvc.svc',
    method: 'GET',
    auth: {
        user: 'SSKKGYMVTK',
        password: '61a068b228a154e1da23217e6e859fdc57b278dcdf740727346eb95db9b916ab'
    }
};
request(options, (error, response, body) => {
    console.log('error', error);
    console.log('response', response.statusCode);
    console.log('body', body);
});
