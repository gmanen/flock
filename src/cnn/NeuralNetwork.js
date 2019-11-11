const Convolution1DLayer = require('./Convolution1DLayer')
const FullyConnectedLayer = require('./FullyConnectedLayer')
const ActivationLayer = require('./ActivationLayer')

class NeuralNetwork {
    constructor() {
        this.layers = []
    }

    addLayer(type, params) {
        let layer
        const currentLayersLength = this.layers.length

        if (currentLayersLength === 0 && !params.hasOwnProperty('inputShape')) {
            throw "First layer must have explicit input shape"
        }

        if (currentLayersLength > 0) {
            params.inputShape = this.layers[currentLayersLength - 1].getOutputShape()
        }

        if ('conv1d' === type) {
            layer = new Convolution1DLayer(params)
        } else if ('fc' === type) {
            layer = new FullyConnectedLayer(params)
        } else if ('activation' === type) {
            layer = new ActivationLayer(params)
        }

        this.layers.push(layer)
    }

    getOutputShape()
    {
        return this.layers[this.layers.length - 1].getOutputShape()
    }

    predict(input) {
        for (const layer of this.layers) {
            input = layer.feedForward(input)
        }

        return input
    }

    clone() {
        const nn = new NeuralNetwork()

        for (const layer of this.layers) {
            nn.layers.push(layer.clone())
        }
    }
}

module.exports = NeuralNetwork
