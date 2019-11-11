const Layer = require('./Layer.js')
const {sigmoid} = require ('./utils')

class ActivationLayer extends Layer {
    constructor(params) {
        super()

        this.activationFunctions = {
            relu: function reluMapper(value) {
                if (Array.isArray(value)) {
                    return value.map(reluMapper)
                } else {
                    return value < 0 ? 0 : value
                }
            },
            sigmoid: function sigmoidMapper(value) {
                if (Array.isArray(value)) {
                    return value.map(sigmoidMapper)
                } else {
                    return sigmoid(value)
                }
            },
            tanh: function tanhMapper(value) {
                if (Array.isArray(value)) {
                    return value.map(tanhMapper)
                } else {
                    return Math.tanh(value)
                }
            }
        }

        if (!this.activationFunctions.hasOwnProperty(params.activationFunction)) {
            throw new Error('Activation function "'+params.activationFunction+'" not found. Available functions: '+Object.keys(this.activationFunctions).join(', '))
        }

        this.inputShape = params.inputShape
        this.activationFunction = params.activationFunction
    }

    feedForward(input) {
        return input.map(this.activationFunctions[this.activationFunction])
    }

    getOutputShape() {
        return this.inputShape
    }

    clone() {
        return new ActivationLayer({
            inputShape: this.inputShape,
            activationFunction: this.activationFunction
        })
    }
}

module.exports = ActivationLayer
