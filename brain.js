class Brain {
    constructor(inputs, layers, outputs) {
        this.biases = []
        this.weights = []

        if (inputs !== undefined) {
            for (let layerSize of [...layers, outputs]) {
                let layer = new Vector(layerSize)
                layer.randomize()

                this.biases.push(layer)
            }

            const totalLayers = [inputs, ...layers, outputs]

            for (let i = 0; i < totalLayers.length - 1; i++) {
                let matrix = new Matrix(totalLayers[i + 1], totalLayers[i])
                matrix.randomize()

                this.weights.push(matrix)
            }
        }
    }

    evaluate(inputArray) {
        let inputVector = Vector.fromArray(inputArray)

        for (let i = 0; i < this.weights.length; i++) {
            let dotProduct = this.weights[i].dot(inputVector)
            let addedBiases = dotProduct.add(this.biases[i])

            inputVector = addedBiases.map(value => 1 / (1 + Math.exp(-value)))
        }

        return inputVector
    }

    clone() {
        const brain = new Brain()

        for (let vector of this.biases) {
            let values = []

            for (let value of vector.values) {
                values.push(value)
            }

            brain.biases.push(Vector.fromArray(values))
        }

        for (let matrix of this.weights) {
            let values = []

            for (let row of matrix.rows) {
                let rowValues = []

                for (let value of row) {
                    rowValues.push(value)
                }

                values.push(rowValues)
            }

            brain.weights.push(Matrix.fromArray(values))
        }
    }

    mutate(rate) {
        for (let biases of this.biases) {
            for (let i = 0; i < biases.length(); i++) {
                if (Math.random() < rate) {
                    biases.values[i] = biases.values[i] + random(-0.1, 0.1)
                }
            }
        }

        for (let weights of this.weights) {
            for (let i = 0; i < weights.rows.length; i++) {
                for (let j = 0; j < weights.rows[i].length; j++) {
                    if (Math.random() < rate) {
                        weights.rows[i][j] = weights.rows[i][j] + random(-0.1, 0.1)
                    }
                }
            }
        }
    }
}
