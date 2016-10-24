#!/usr/bin/env node

const PO = require('pofile')
const {argv} = require('optimist')
const Promise = require('bluebird')
const request = require('request').defaults({
    Accept: 'application/json'
})

const TranslationError = require('./error')

const red = text => '\033[31m' + text + '\033[0m'

const isTranslated = item => (
    (item.msgstr[0].trim() == "" || item.msgstr[0] == item.msgid)
)

const check = language => error => text => {
    request.post('https://languagetool.org/api/v2/check', {
        form: {
            text,
            language,
            enabledOnly: 'false'
        }
    }, (err, res, body) => {
        const matches = JSON.parse(body).matches
        if (matches.length > 0) {
            matches.forEach((err, i) => {
                error.addError(text, err.message)
            })
        }
    })
}

const throttle = request => {
    const delay = 60000 / request
    return (arr, callback, done) => {
        const loop = i => {
            process.stdout.clearLine();
            process.stdout.cursorTo(0);
            process.stdout.write(`checking ${i+1}/${arr.length} translations`)
            if (i < arr.length) {
                if (argv['skip-untranslated'] === true && isTranslated(arr[i])) {
                    return loop(i+1)
                }
                const item = arr[i].msgstr[0]
                callback(item)
                setTimeout(() => {
                    loop(i+1)
                }, delay)
            } else {
                process.stdout.write("\n")
                done()
            }
        }
        loop(0)
    }
}

const findBug = (files, language = 'en') => {
    const errors = {}
    Promise.mapSeries(files, file => new Promise((resolve, reject) => (
        PO.load(file, (err, po) => {
            if (err) {
                reject(err)
            }
            const error = new TranslationError();
            const rslv = () => {
                errors[file] = error.getError()
                resolve()
            }
            throttle(20)(po.items, check(language)(error), rslv)
        })
    ))).then(v => {
        for (file in errors) {
            console.log(`Found ${Object.keys(errors[file]).length} bugs in ${file} : `)
            for (sentence in errors[file]) {
                console.log(sentence)
                errors[file][sentence].forEach(error => console.log(red(` - ${error}`)))
            }
            console.log("\n")
        }
    }).catch(e => console.error(e))
}

findBug(argv._, argv.lang)
