module.exports =  class TranslationError {
    constructor() {
        this.errors = {}
    }

    addError(text, message) {
        if (this.errors[text] === undefined) {
            this.errors[text] = [message]
        } else {
            this.errors[text].push(message)
        }
    }

    getError() {
        return this.errors
    }
}