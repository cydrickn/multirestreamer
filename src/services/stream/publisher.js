const lodash = require('lodash')

function streamStat (context, stream) {
    let streamStats = {
        isLive: false,
        viewers: 0,
        duration: 0,
        bitrate: 0,
        startTime: null
    };

    let publishStreamPath = `/${stream.name}/${stream.key}`;

    let publisherSession = context.sessions.get(context.publishers.get(publishStreamPath));

    streamStats.isLive = !!publisherSession;
    streamStats.viewers = lodash.filter(Array.from(context.sessions.values()), (session) => {
        return session.playStreamPath === publishStreamPath;
    }).length;
    streamStats.duration = streamStats.isLive ? Math.ceil((Date.now() - publisherSession.startTimestamp) / 1000) : 0;
    streamStats.bitrate = streamStats.duration > 0 ? Math.ceil(lodash.get(publisherSession, ['socket', 'bytesRead'], 0) * 8 / streamStats.duration / 1024) : 0;
    streamStats.startTime = streamStats.isLive ? publisherSession.connectTime : null;

    return streamStats
}

function getRelaysStats (context, stream, relays, responseArray) {
    let stats = {}
    context.sessions.forEach((session) => {
        if (session.constructor.name !== 'NodeRelaySession') {
            return false;
        }
        let {app, name} = session.conf;
        if (app === stream.name && name === stream.key) {
            stats[session.conf.ouPath] = {
                isLive: true,
                url: session.conf.ouPath,
                mode: session.conf.mode,
                id: session.id,
            }
        }
    })

    let relayStats = {}
    if (responseArray) {
        relayStats = []
    }
    relays.forEach((relay) => {
        const stat = { name: relay.name, ...(stats[relay.url] || { isLive: false }) }
        if (responseArray) {
            relayStats.push(stat)
        } else {
            relayStats[relay.name] = stat
        }
    })

    return relayStats
}

function getRelayStats(context, stream, relay) {
    const stats = getRelaysStats(context, stream, [relay], false)

    return stats[relay.name]
}
function relayStartPush(context ,stream, relay) {
    context.nodeEvent.emit('relayPush', relay.url, stream.name, stream.key)

    return getRelayStats(context, stream, relay)
}

exports.streamStat = streamStat
exports.getRelaysStats = getRelaysStats
exports.getRelayStats = getRelayStats
exports.relayStartPush = relayStartPush