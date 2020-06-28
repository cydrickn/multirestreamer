const path = require('path')
const fs = require('fs')

class FileHandler {
    constructor(config) {
        this.path = path.join(config.path, '/stream')
        if (!fs.existsSync(this.path)) {
            fs.mkdirSync(this.path)
        }
    }

    getList() {
        const files = fs.readdirSync(this.path)
        let streams = []
        files.forEach((file) => {
            const content = fs.readFileSync(path.join(this.path, file))
            streams.push(JSON.parse(content.toString()))
        })

        return streams
    }

    getByName(name) {
        const filePath = path.join(this.path, name + '.json')
        if (!fs.existsSync(filePath)) {
            return null
        }

        return JSON.parse(fs.readFileSync(filePath).toString())
    }

    update(name, payload) {
        let stream = this.getByName(name)
        delete payload.name

        stream = { ...stream, ...payload }
        stream.relays = (stream.relays || []).map((relay) => {
            if (relay.sessionId === undefined) {
                relay.sessionId = null
            }

            return relay
        })
        this.save(stream)

        return stream
    }

    getRelayByName(streamName, relayName) {
        const stream = this.getByName(streamName)
        let relay = null
        for (let i in stream.relays) {
            if (stream.relays[i].name === relayName) {
                relay = stream.relays[i]
                break
            }
        }

        return relay
    }

    updateRelay(streamName, relayName, payload) {
        let stream = this.getByName(streamName)
        let relay = null
        for (let i in stream.relays) {
            if (relayName === stream.relays[i].name) {
                relay = { ...stream.relays[i], ...payload  }
                stream.relays[i] = relay
            }
        }

        this.save(stream)

        return relay
    }

    save(stream) {
        const name = stream.name

        const filePath = path.join(this.path, name + '.json')
        fs.writeFileSync(filePath, JSON.stringify(stream))
    }
}

module.exports = FileHandler