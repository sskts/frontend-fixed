// tslint:disable:no-http-string
// tslint:disable:max-line-length
/**
 * dev環境実行
 */
process.env.NODE_ENV = 'dev';
process.env.NPM_TOKEN = '9f435339-8720-44dc-91f1-66eaacaa466d';
// process.env.MP_ENDPOINT = 'https://devssktsapi.azurewebsites.net';
process.env.MP_ENDPOINT = 'http://sskts-api-development.ap-northeast-1.elasticbeanstalk.com/';
process.env.REDIS_HOST = 'devsskts.redis.cache.windows.net';
process.env.REDIS_PORT = '6380';
process.env.REDIS_KEY = 'W/yjVruvypTFz3nl8teXxBYfunq6teXnyvIN5xuVLWU=';
process.env.GMO_CLIENT_MODULE = 'https://pt01.mul-pay.jp/ext/js/token.js';
process.env.GMO_ENDPOINT = 'https://pt01.mul-pay.jp';
// process.env.GMO_SHOP_ID = 'tshop00026096';
// process.env.GMO_SHOP_PASSWORD = 'xbxmkaa6';
process.env.COA_ENDPOINT = 'http://coacinema.aa0.netvolante.jp';
process.env.COA_REFRESH_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJjcmVhdGVkX2F0IjoxNDc5MjYwODQ4LCJhdXRoX2lkIjoiMzMxNSJ9.jx-w7D3YLP7UbY4mzJYC9xr368FiKWcpR2_L9mZfehQ';
process.env.SSKTS_API_SECRET = 'VBLhYDmX/7bcVC5H_YGs-=JRX+DXTNdbJAtt(7NN';
process.env.SSKTS_API_REFRESH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncmFudF90eXBlIjoidXJuOmlldGY6cGFyYW1zOm9hdXRoOmdyYW50LXR5cGU6and0LWJlYXJlciIsImlhdCI6MTQ4NzkyOTExOH0.W-VfmRRdBxrNDvE-x8aVGOGOCvWz2Xbq7_-iToXaXUY';
process.env.MVTK_ENDPOINT_SERVICE_01 = 'https://ssl.movieticket.jp';
process.env.MVTK_ENDPOINT_SERVICE_02 = 'https://testservices.movieticket.jp';
process.env.MVTK_ENDPOINT_RESERVE_SERVICE = 'https://reservetest.movieticket.jp';
process.env.DEBUG = 'SSKTS*';
// tslint:disable-next-line:no-var-requires no-require-imports
require('../index');
