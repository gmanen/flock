class Layer {
    constructor(params) {
        this.weights = []
        this.biases = []
    }

    dotProduct(weights, input) {
        const output = []

        for (let i = 0; i < weights.length; i++) {
            let weightedSum = 0

            for (let j = 0; j < input.length; j++) {
                weightedSum += weights[i][j] * input[j]
            }

            output.push(weightedSum)
        }

        return output
    }

    addVector(alice, bob) {
        const output = []

        for (let i = 0; i < alice.length; i++) {
            output.push(alice[i] + bob[i])
        }

        return output
    }
}
