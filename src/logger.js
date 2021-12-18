const fs = require('fs');
const path = require('path');

module.exports.Logger = class {
    constructor(logFilepath = null) {
        this.logFilepath = logFilepath;
    }

    log(message) {

        // Generate log message
        let logString = `[${new Date().toISOString()}] ${message}`;

        // If log filepath is specified, write to file
        if (this.logFilepath != null) 
        {
            // Write to file
            fs.appendFile(this.logFilepath, logString + '\n', (err) => {
                if (err) console.log(err);
            });
        }

        // Log string to console
        console.log(logString);
    }

}