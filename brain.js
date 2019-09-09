class Brain {
    constructor(inputs, layers, outputs) {
        this.biases = []
        this.weights = []

        if (inputs !== undefined) {
            for (let layerSize of [...layers, outputs]) {
                this.biases.push(nj.zeros(layerSize))
            }

            const totalLayers = [inputs, ...layers, outputs]

            for (let i = 0; i < totalLayers.length - 1; i++) {
                this.weights.push(nj.zeros([totalLayers[i + 1], totalLayers[i]]))
            }
        }
    }

    randomize() {
        for (let biases of this.biases) {
            for (let i = 0; i < biases.tolist().length; i++) {
                biases.set(i, randomGaussian())
            }
        }

        for (let weights of this.weights) {
            let shape = weights.shape

            for (let i = 0; i < shape[0]; i++) {
                for (let j = 0; j < shape[1]; j++) {
                    weights.set(i, j, randomGaussian())
                }
            }
        }
    }

    evaluate(inputArray) {
        for (let i = 0; i < this.weights.length; i++) {
            let weightedSumBiased = nj.dot(this.weights[i], inputArray).add(this.biases[i])

            inputArray = nj.sigmoid(weightedSumBiased)
        }

        return inputArray.tolist()
    }

    clone() {
        const brain = new Brain()

        for (let vector of this.biases) {
            brain.biases = vector.clone()
        }

        for (let matrix of this.weights) {
            brain.weights.push(matrix.clone())
        }
    }

    mutate(rate) {
        for (let biases of this.biases) {
            for (let i = 0; i < biases.tolist().length; i++) {
                if (Math.random() < rate) {
                    biases.set(i, biases.get(i) + random(-0.1, 0.1))
                }
            }
        }

        for (let weights of this.weights) {
            let shape = weights.shape

            for (let i = 0; i < shape[0]; i++) {
                for (let j = 0; j < shape[1]; j++) {
                    if (Math.random() < rate) {
                        weights.set(i, j, weights.get(i, j) + random(-0.1, 0.1))
                    }
                }
            }
        }
    }
}
