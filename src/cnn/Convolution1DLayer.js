const Layer = require('./Layer.js')
const {randomGaussian, dotProduct, addVector} = require('./utils.js')

class Convolution1DLayer extends Layer {
    constructor(params) {
        super(params.weights || [], params.biases || [])

        const inputWeights = this.weights.length
        const inputBiases = this.biases.length

        this.nbKernels = params.nbKernels
        this.kernelSize = params.kernelSize
        this.inputShape = params.inputShape
        this.stride = params.stride
        this.outputShape = params.outputShape || this.getOutputShape()

        for (const length of this.outputShape) {
            if (!Number.isInteger(length)) {
                throw new Error("Output shape must be integers, " + JSON.stringify(this.outputShape) + " calculated.")
            }
        }

        if (inputWeights === 0 || inputBiases === 0) {
            for (let i = 0; i < this.nbKernels; i++) {
                if (inputWeights === 0) {
                    const kernelWeights = []

                    for (let j = 0; j < this.kernelSize * this.inputShape[0]; j++) {
                        kernelWeights.push(randomGaussian())
                    }

                    this.weights.push(kernelWeights)
                }

                if (inputBiases === 0) {
                    this.biases.push(randomGaussian())
                }
            }
        }
    }

    feedForward(input) {
        const output = []
        let offset = 0

        for (let i = 0; i < this.nbKernels; i++) {
            output.push([])
        }

        while (offset + this.kernelSize <= this.inputShape[1]) {
            let inputSlice = []

            for (const row of input) {
                inputSlice = inputSlice.concat(row.slice(offset, offset + this.kernelSize))
            }

            const regionOutput = addVector(dotProduct(this.weights, inputSlice), this.biases)

            for (let i = 0; i < regionOutput.length; i++) {
                output[i].push(regionOutput[i])
            }

            offset += this.stride
        }

        return output
    }

    getOutputShape() {
        if (this.outputShape) {
            return this.outputShape
        }

        return [this.nbKernels, (this.inputShape[1] - this.kernelSize) / this.stride + 1]
    }

    clone() {
        return new Convolution1DLayer({
            nbKernels: this.nbKernels,
            kernelSize: this.kernelSize,
            inputShape: this.inputShape,
            stride: this.stride,
            outputShape: this.outputShape,
            weights: this.weights,
            biases: this.biases
        })
    }
}

module.exports = Convolution1DLayer
