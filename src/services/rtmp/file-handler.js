const path = require('path')
const fs = require('fs')

class FileHandler {
    constructor(config) {
        this.path = path.join(config.path, '/rtmp')
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
}

module.exports = FileHandler