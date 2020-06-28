const LiveStreamServer = require('./server')

const config = require('../configs/index').server

var server = new LiveStreamServer(config)
server.run()