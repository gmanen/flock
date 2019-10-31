class Convolution1DLayer extends Layer {
    constructor(params) {
        super()

        this.nbKernels = params.nbKernels
        this.kernelSize = params.kernelSize
        this.inputShape = params.inputShape
        this.stride = params.stride
        this.outputShape = this.getOutputShape()

        for (const length of this.outputShape) {
            if (!Number.isInteger(length)) {
                throw "Output shape must be integers, " + JSON.stringify(this.outputShape) + " calculated."
            }
        }

        for (let i = 0; i < this.nbKernels; i++) {
            const kernelWeights = []

            for (let j = 0; j < this.kernelSize * this.inputShape[0]; j++) {
                kernelWeights.push(p.randomGaussian())
            }

            this.weights.push(kernelWeights)
            this.biases.push(p.randomGaussian())
        }
    }

    feedForward(input) {
        const output = []
        let offset = 0

        while (offset + this.kernelSize <= this.inputShape[1]) {
            let inputSlice = []

            for (const row of input) {
                inputSlice = inputSlice.concat(row.slice(offset, offset + this.kernelSize))
            }

            output.push(this.addVector(this.dotProduct(this.weights, inputSlice), this.biases))
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
}
