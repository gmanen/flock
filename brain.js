const activationFunctions = {
    'sigmoid': value => 1/(1+Math.exp(-value)),
    'relu': value => value < 0 ? 0 : value,
}

class Brain {
    constructor(inputs, layers, outputs, activationFunction) {
        this.inputs = inputs
        this.layers = layers
        this.outputs = outputs
        this.biases = []
        this.weights = []
        this.activationFunction = activationFunction || 'sigmoid'

        if (inputs !== undefined) {
            for (const layerSize of [...layers, outputs]) {
                this.biases.push(nj.zeros(layerSize))
            }

            const totalLayers = [inputs, ...layers, outputs]

            for (let i = 0; i < totalLayers.length - 1; i++) {
                this.weights.push(nj.zeros([totalLayers[i + 1], totalLayers[i]]))
            }
        }
    }

    randomize() {
        for (const biases of this.biases) {
            for (let i = 0; i < biases.tolist().length; i++) {
                biases.set(i, p.randomGaussian())
            }
        }

        for (const weights of this.weights) {
            const shape = weights.shape

            for (let i = 0; i < shape[0]; i++) {
                for (let j = 0; j < shape[1]; j++) {
                    weights.set(i, j, p.randomGaussian(0, 1 / p.sqrt(shape[1])))
                }
            }
        }
    }

    evaluate(inputArray) {
        for (let i = 0; i < this.weights.length; i++) {
            inputArray = nj.add(nj.dot(this.weights[i], inputArray), this.biases[i]).tolist()

            if (i < this.weights.length - 1) {
                inputArray = inputArray.map(activationFunctions[this.activationFunction])
            }
        }

        return 'sigmoid' !== this.activationFunction ? inputArray : inputArray.map(activationFunctions[this.activationFunction])
    }

    clone() {
        const brain = new Brain()
        brain.activationFunction = this.activationFunction

        for (const vector of this.biases) {
            brain.biases.push(vector.clone())
        }

        for (const matrix of this.weights) {
            brain.weights.push(matrix.clone())
        }
    }

    crossover(parentBrain) {
        const childBrain = new Brain(this.inputs, this.layers, this.outputs)
        childBrain.activationFunction = this.activationFunction

        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].shape[0]; j++) {
                const roll = p.random() < 0.5
                childBrain.biases[i].set(j, roll ? this.biases[i].get(j) : parentBrain.biases[i].get(j))
                childBrain.weights[i].set(j, roll ? this.weights[i].get(j) : parentBrain.weights[i].get(j))
            }
        }

        return childBrain
    }

    mutate(rate) {
        const mutations = []

        if (debug) {
            console.log('Start mutation with rate '+rate)
        }

        for (let i = 0; i < this.biases.length; i++) {
            for (let j = 0; j < this.biases[i].shape[0]; j++) {
                if (p.random() < rate) {
                    mutations.push({'layer': i, mutations: []})
                    for (let w = 0; w < this.weights[i].tolist()[j].length; w++) {
                        const currentValue = this.weights[i].get(j, w)
                        const mutation = p.randomGaussian(0, 1 / p.sqrt(this.weights[i].shape[1]))

                        this.weights[i].set(j, w, currentValue + mutation)

                        if (debug) {
                            mutations[mutations.length - 1].mutations.push({
                                'weightIndices': [j, w],
                                'currentValue': currentValue,
                                'mutation': mutation,
                                'newValue': this.weights[i].get(j, w)
                            })
                        }
                    }
                }
            }
        }

        if (debug) {
            console.log(mutations)
            console.log('End mutation')
        }
    }
}
