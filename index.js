#!/usr/bin/env node

const PO = require('pofile')
const {argv} = require('optimist')
const Promise = require('bluebird')
const request = require('request').defaults({
    Accept: 'application/json'
})

const TranslationError = require('./error')

const red = text => '\033[31m' + text + '\033[0m'

const check = language => error => text => {
    console.log(`checking : ${text}`)
    request.post('https://languagetool.org/api/v2/check', {
        form: {
            text,
            language,
            enabledOnly: 'false'
        }
    }, (err, res, body) => {
        const matches = JSON.parse(body).matches
        if (matches.length > 0) {
            console.error(`error: ${text}`)
            matches.forEach((err, i) => {
                console.error(red(`${i+1}. ${err.message}`))
                error.addError(text, err.message)
            })
        }
    })
}

const throttle = (arr, callback, request, done) => {
    const loop = i => {
        if (i < arr.length) {
            const item = arr[i].msgstr[0]
            if (item == "") {
                return loop(i+1)
            }
            callback(item)
            setTimeout(() => {
                loop(i+1)
            }, 60000 / request)
        } else {
            done()
        }
    }
    loop(0)
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
            throttle(po.items, check(language)(error), 20, rslv)
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
