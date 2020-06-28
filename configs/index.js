const path = require('path')
const dotEnv = require('dotenv')
const rootFolder = path.resolve(__dirname, '../')
dotEnv.config()

module.exports = {
    rootFolder,
    data: {
        type: 'file',
        path: path.join(rootFolder, '/storage/data')
    },
    routes: {
        resource: path.join(rootFolder, '/configs/routes/'),
        specs: path.join(rootFolder, '/configs/schemas/requests'),
    },
    errors: {
        'API-0404': { httpCode: 404, message: 'Resource not found.' },
        'SCH-1001': { httpCode: 422, message: 'Invalid request.' },
        'SCH-1002': { httpCode: 500, message: 'Something went wrong.' },
        'STR-2001': { httpCode: 404, message: 'Stream not found.' },
        'RTMP-3001': { httpCode: 404, message: 'RTMP not found.' },
    },
    host: {
        rtmp: process.env.RTMP_HOST || 'localhost',
        http: process.env.HTTP_HOST || 'localhost'
    },
    server: {
        rtmp: {
            port: process.env.RTMP_PORT || 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 30,
            ping_timeout: 60
        },
        http: {
            port: process.env.HTTP_PORT || 80,
            allow_origin: '*'
        },
        relay: {
            ffmpeg: '/usr/bin/ffmpeg'
        }
    }
}