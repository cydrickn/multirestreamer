const path = require('path')
const fs = require('fs')
const lodash = require('lodash')
const YAML = require('yaml')
const config = require('../../configs')
const schemas = require('../services/schemas')
const publisher = require('../services/stream/publisher')
const Package = require('../../package.json')
const StreamFileHandler = require('../services/stream/file-handler')
const RtmpFileHandler = require('../services/rtmp/file-handler')
const streamHandler = new StreamFileHandler(config.data)
const rtmpHandler = new RtmpFileHandler(config.data)

exports.streams = function (req, res) {
    const streams = streamHandler.getList().map((stream) => {
        stream.url = `rtmp://${config.host.rtmp}/${stream.name}`

        return stream
    })

    res.json(streams)
}

exports.stream = function (req, res, next) {
    const name = req.params.name
    const stream = streamHandler.getByName(name)

    if (stream === null) {
        next({ code: 'STR-2001' })
    } else {
        stream.url = `rtmp://${config.host.rtmp}/${stream.name}`
        res.json(stream)
    }
}

exports.streamStats = function (req, res, next) {
    const name = req.params.name
    const stream = streamHandler.getByName(name)
    const streamStat = publisher.streamStat(this, stream)
    const relayStats = publisher.getRelaysStats(this, stream, stream.relays, true)

    res.json({ stream: streamStat, relays: relayStats });
}

exports.updateStream = function (req, res, next) {
    const name = req.params.name
    const stream = streamHandler.getByName(name)

    if (stream === null) {
        next({ code: 'STR-2001' })
    } else {
        const updatedStream = streamHandler.update(name, req.body)
        updatedStream.url = `rtmp://${config.host.rtmp}/${stream.name}`
        res.json(stream)
    }
}

exports.relayStartPushing = function (req, res, next) {
    const name = req.params.name
    const relayName = req.params.relay
    const stream = streamHandler.getByName(name)
    const relay = streamHandler.getRelayByName(name, relayName)
    const stats = publisher.relayStartPush(this, stream, relay)
    const udpdatedRelay = streamHandler.updateRelay(name, relayName, { sessionId: stats.id })

    res.json({ name, relay: udpdatedRelay })
}

exports.rtmps = function (req, res) {
    res.json(rtmpHandler.getList())
}

exports.rtmp = function (req, res, next) {
    const name = req.params.name
    const stream = rtmpHandler.getByName(name)

    if (stream === null) {
        next({ code: 'RTMP-3001' })
    } else {
        res.json(stream)
    }
}

exports.docs = function (req, res) {
    const routes = YAML.parse(fs.readFileSync(path.join(config.routes.resource, 'index.yml'), 'utf8'))
    let spec = {
        openapi: '3.0.2',
        info: {
            version: Package.version,
            title: 'Live Stream API',
            description: 'Live Stream API'
        },
        servers: [{
            url: `http://${config.host.http}:${config.server.http.port}/api`
        }],
        paths: {}
    }

    lodash.forOwn(routes, (route, name) => {
        const methods = route.methods || ['GET']
        let schema = schemas.requestSpecs[route.spec]
        if (route.spec === null) {
            schema = {responses: {200: { description: 'OK' }}}
        }
        if (schema !== undefined) {
            let path = route.path
            const params = (schema.parameters || []).filter((param) => {
                return param.in === 'path'
            })
            params.forEach((param) => {
                path = path.replace(`:${param.name}`, `{${param.name}}`)
            })

            methods.forEach((method) => {
                lodash.set(spec, `paths.${path}.${lodash.lowerCase(method)}`, schema)
            })
        }
    })

    res.json(spec)
}