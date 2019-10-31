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
        }

        this.layers.push(layer)
    }

    predict(input) {
        for (const layer of this.layers) {
            input = layer.feedForward(input)
        }

        return input
    }
}
