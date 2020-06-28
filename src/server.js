const Https = require('https')
const Logger = require('node-media-server/node_core_logger')
const NodeRtmpServer = require('node-media-server/node_rtmp_server')
const NodeRelayServer = require('node-media-server/node_relay_server')
const context = require('node-media-server/node_core_ctx');
const LiveStreamApi = require('./api')
const Package = require("./../package.json");

class LiveStreamServer {
    constructor(config) {
        this.config = config;
    }

    run() {
        Logger.setLogType(this.config.logType);
        Logger.log(`Live Streamer v${Package.version}`);
        if (this.config.rtmp) {
            this.nrs = new NodeRtmpServer(this.config);
            this.nrs.run();
        }

        if (this.config.http) {
            this.nhs = new LiveStreamApi(this.config.http);
            this.nhs.run();
        }

        if (this.config.trans) {
            if (this.config.cluster) {
                Logger.log('NodeTransServer does not work in cluster mode');
            } else {
                this.nts = new NodeTransServer(this.config);
                this.nts.run();
            }
        }

        if (this.config.relay) {
            if (this.config.cluster) {
                Logger.log('NodeRelayServer does not work in cluster mode');
            } else {
                this.nls = new NodeRelayServer(this.config);
                this.nls.run();
            }
        }

        process.on('uncaughtException', function (err) {
            Logger.error('uncaughtException', err);
        });
    }

    on(eventName, listener) {
        context.nodeEvent.on(eventName, listener);
    }

    stop() {
        if (this.nrs) {
            this.nrs.stop();
        }
        if (this.nhs) {
            this.nhs.stop();
        }
        if (this.nls) {
            this.nls.stop();
        }
    }

    getSession(id) {
        return context.sessions.get(id);
    }
}

module.exports = LiveStreamServer