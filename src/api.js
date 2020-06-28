const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const Logger = require('node-media-server/node_core_logger');
const context = require('node-media-server/node_core_ctx');
const apiRoutes = require('./services/routes')

class LiveStreamHttp {
    constructor(config) {
        this.config = config
        this.port = config.port
        this.server = express()
        this.server.use(cors())
        this.server.use(bodyParser.json())
        this.server.use('/api', apiRoutes(context))
    }

    run() {
        this.server.listen(this.port, () => {
            Logger.log(`Live Streamer Http Server started on port: ${this.port}`)
        })
    }
}

module.exports = LiveStreamHttp;




