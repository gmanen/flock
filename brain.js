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
                    weights.set(i, j, randomGaussian(0, 1 / Math.sqrt(shape[1])))
                }
            }
        }
    }

    evaluate(inputArray) {
        for (let i = 0; i < this.weights.length; i++) {
            inputArray = nj.sigmoid(nj.add(nj.dot(this.weights[i], inputArray), this.biases[i]))
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
        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].tolist().length; j++) {
                if (Math.random() < rate) {
                    for (let w = 0; w < this.weights[i].tolist()[j].length; w++) {
                        this.weights[i].set(j, w, this.weights[i].get(j, w) + randomGaussian(0, 1 / Math.sqrt(this.weights[i].shape[1])))
                    }
                }
            }
        }
    }
}
