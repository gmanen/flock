const Layer = require('./Layer.js')
const {randomGaussian, dotProduct, addVector, flatten} = require('./utils.js')

class FullyConnectedLayer extends Layer {
    constructor(params) {
        super(params.weights || [], params.biases || [])

        const inputWeights = this.weights.length
        const inputBiases = this.biases.length

        this.nbNeurons = params.nbNeurons
        this.inputShape = params.inputShape

        if (inputWeights === 0 || inputBiases === 0) {
            const inputLength = this.inputShape.reduce((total, current) => total * current, 1)

            for (let i = 0; i < this.nbNeurons; i++) {
                if (inputWeights === 0) {
                    const neuronWeights = []

                    for (let j = 0; j < inputLength; j++) {
                        neuronWeights.push(randomGaussian())
                    }

                    this.weights.push(neuronWeights)
                }

                if (inputBiases === 0) {
                    this.biases.push(randomGaussian())
                }
            }
        }
    }

    feedForward(input) {
        return addVector(dotProduct(this.weights, flatten(input)), this.biases)
    }

    getOutputShape() {
        return [this.nbNeurons]
    }

    clone() {
        return new FullyConnectedLayer({
            nbNeurons: this.nbNeurons,
            inputShape: this.inputShape,
            weights: this.weights,
            biases: this.biases
        })
    }
}

module.exports = FullyConnectedLayer
