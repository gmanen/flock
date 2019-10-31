class FullyConnectedLayer extends Layer {
    constructor(params) {
        super()

        this.nbNeurons = params.nbNeurons
        this.inputShape = params.inputShape

        const inputLength = this.inputShape.reduce((total, current) => total * current, 1)

        for (let i = 0; i < this.nbNeurons; i++) {
            const neuronWeights = []

            for (let j = 0; j < inputLength; j++) {
                neuronWeights.push(p.randomGaussian())
            }

            this.weights.push(neuronWeights)
            this.biases.push(p.randomGaussian())
        }
    }

    feedForward(input) {
        let flattened = []

        for (const row of input) {
            flattened = flattened.concat(row)
        }

        return this.addVector(this.dotProduct(this.weights, flattened), this.biases)
    }

    getOutputShape() {
        return [this.nbNeurons]
    }
}
