const Volume = require('./Volume.js')
const Layer = require('./Layer.js')

class Convolution1DLayer extends Layer {
    constructor(params) {
        super(params.weights || [], params.biases)

        this.nbKernels = params.nbKernels
        this.kernelSize = params.kernelSize
        this.inputShape = params.inputShape
        this.stride = params.stride
        this.outputShape = params.outputShape || this.getOutputShape()

        if (this.inputShape[1] !== 1) {
            throw new Error("Conv1D Layer can only take input in one dimension (width). Input height should be 1, " + this.inputShape[1] + " given.")
        }

        for (const length of this.outputShape) {
            if (!Number.isInteger(length)) {
                throw new Error("Output shape must be integers, " + JSON.stringify(this.outputShape) + " calculated.")
            }
        }

        if (this.weights.length === 0) {
            for (let i = 0; i < this.nbKernels; i++) {
                this.weights.push(new Volume(this.kernelSize, 1, this.inputShape[2]))
            }
        }

        if (typeof this.biases === "undefined") {
            this.biases = new Volume(this.nbKernels, 1, 1, 0.0)
        }

        this.output = new Volume(...this.outputShape, 0.0)
    }

    feedForward(input) {
        this.input = input

        for (let step = 0, offset = 0; offset + this.kernelSize <= input.width; step++, offset += this.stride) {
            for (let kernelIndex = 0; kernelIndex < this.nbKernels; kernelIndex++) {
                this.output.data[kernelIndex][0][step] = this.biases.data[0][0][kernelIndex]

                for (let kernelSizeIndex = 0; kernelSizeIndex < this.kernelSize; kernelSizeIndex++) {
                    let inputWidthOffset = offset + kernelSizeIndex

                    for (let inputDepthIndex = 0; inputDepthIndex < input.depth; inputDepthIndex++) {
                        this.output.data[kernelIndex][0][step] += input.data[inputDepthIndex][0][inputWidthOffset] * this.weights[kernelIndex].data[inputDepthIndex][0][kernelSizeIndex]
                    }
                }
            }
        }

        return this.output
    }

    backPropagate() {

    }

    getOutputShape() {
        if (this.outputShape) {
            return this.outputShape
        }

        return [(this.inputShape[0] - this.kernelSize) / this.stride + 1, 1, this.nbKernels]
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
