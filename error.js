const ignoredErrors = [
    "This sentence does not start with an uppercase letter",
    "Use a smart opening quote here: \"“\".",
    "Use a smart closing quote here: \"”\".",
    "Cette phrase ne commence pas par une majuscule",
    "Esa frase no se inicia con mayúscula",
    "Esa frase no se inicia con mayúscula une majuscule",
    "Propoziția nu începe cu literă mare",
    "Sakinys turi prasidėti iš didžiosios raidės",
]

module.exports =  class TranslationError {
    constructor() {
        this.errors = {}
    }

    isIgnored(message) {
        return ignoredErrors.indexOf(message.trim()) >= 0
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