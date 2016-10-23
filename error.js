const ignoredErrors = [
    "This sentence does not start with an uppercase letter",
    "Use a smart opening quote here: \"“\".",
    "Use a smart closing quote here: \"”\"."
]

module.exports =  class TranslationError {
    constructor() {
        this.errors = {}
    }

    isIgnored(message) {
        ignoredErrors.forEach(error => {
            if (error === message) {
                return true
            }
        })
        return false
    }

    addError(text, message) {
        if (this.isIgnored(message)) {
            return
        }
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