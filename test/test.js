const assert = require('assert')
const Convolution1DLayer = require('../src/cnn/Convolution1DLayer')
const FullyConnectedLayer = require('../src/cnn/FullyConnectedLayer')
const ActivationLayer = require('../src/cnn/ActivationLayer')
const {sigmoid} = require('../src/cnn/utils')

describe('NeuralNetwork', function () {
    describe('Convolution 1D', function () {
        it('should compute produce correct shapes', function () {
            const conv1d = new Convolution1DLayer({nbKernels: 2, kernelSize: 3, stride: 1, inputShape: [2, 4]})

            assert.equal(conv1d.weights.length, 2)
            assert.equal(conv1d.weights[0].length, 6)
            assert.equal(conv1d.biases.length, 2)
            assert.deepEqual(conv1d.getOutputShape(), [2, 2])
        })

        it('should throw an error on wrong kernel size / stride compared to input shape', function () {
            assert.throws(function () {
                new Convolution1DLayer({nbKernels: 2, kernelSize: 3, stride: 2, inputShape: [2, 4]})
            }, Error, 'Output shape must be integers, [2,1.5] calculated.')
        })

        it('should feed forward', function () {
            const conv1d = new Convolution1DLayer({nbKernels: 2, kernelSize: 3, stride: 1, inputShape: [2, 4]})

            conv1d.weights = [[1, 3, 2, 1, -3, 0], [0, 1, -2, 4, -1, -3]]
            conv1d.biases = [-0.5, 4]

            assert.deepEqual(conv1d.feedForward([[2, 3, 4, 5], [1, 2, 3, 4]]), [[13.5, 17.5], [-8, -9]])
        })
    })

    describe('Fully connected', function () {
        it('should compute produce correct shapes', function () {
            const fc = new FullyConnectedLayer({nbNeurons: 3, inputShape: [2, 4]})

            assert.equal(fc.weights.length, 3)
            assert.equal(fc.weights[0].length, 8)
            assert.equal(fc.biases.length, 3)
            assert.deepEqual(fc.getOutputShape(), [3])
        })

        it('should feed forward', function () {
            const fc = new FullyConnectedLayer({nbNeurons: 3, inputShape: [2, 4]})

            fc.weights = [
                [0.5, 1, 1.5, -0.5, -1, 0.75, -0.2, 0.25],
                [0.1, -0.3, 0.4, 1, -0.5, 0.7, -0.25, 1.25],
                [-0.35, 0.3, -1, 0.25, 1, 0.2, 0.3, -0.75]
            ]
            fc.biases = [1, 2, -1]

            assert.deepEqual(fc.feedForward([[-2, 1, -3, 4], [0.5, -1, -0.75, 2]]), [-6.1, 6.0375, 2.575])

        })

        it('can process vectors', function () {
            const fc = new FullyConnectedLayer({nbNeurons: 3, inputShape: [4]})

            fc.weights = [
                [0.5, 1, 1.5, -0.5],
                [0.1, -0.3, 0.4, 1],
                [-0.35, 0.3, -1, 0.25]
            ]
            fc.biases = [1, 2, -1]

            assert.deepEqual(fc.feedForward([-2, 1, -3, 4]), [-2*0.5+1+-3*1.5+4*-0.5+1, -2*0.1+-0.3+-3*0.4+4+2, -2*-0.35+0.3+-3*-1+4*0.25-1])

        })
    })

    describe('Activation', function () {
        it('should output correct shape', function () {
            const relu = new ActivationLayer({inputShape: [2, 4], activationFunction: 'relu'})

            assert.deepEqual(relu.getOutputShape(), [2, 4])
        })

        it('should error on unknown activation functions', function () {
            assert.throws(function () {
                new ActivationLayer({inputShape: [2, 4], activationFunction: 'fooBar'})
            }, Error, 'Activation function "fooBar" not found. Available functions: relu, sigmoid, tanh')
        })

        it('should output relued values', function () {
            const relu = new ActivationLayer({inputShape: [2, 4], activationFunction: 'relu'})

            assert.deepEqual(relu.feedForward([[-2, 1, -3, 4], [0.5, -1, -0.75, 2]]), [[0, 1, 0, 4], [0.5, 0, 0, 2]])
        })

        it('should output sigmoid values', function () {
            const sigmoidLayer = new ActivationLayer({inputShape: [2, 4], activationFunction: 'sigmoid'})

            assert.deepEqual(sigmoidLayer.feedForward(
                [[-2, 1, -3, 4], [0.5, -1, -0.75, 2]]),
                [[sigmoid(-2), sigmoid(1), sigmoid(-3), sigmoid(4)], [sigmoid(0.5), sigmoid(-1), sigmoid(-0.75), sigmoid(2)]]
            )
        })

        it('should output tanh values', function () {
            const tanh = new ActivationLayer({inputShape: [2, 4], activationFunction: 'tanh'})

            assert.deepEqual(tanh.feedForward(
                [[-2, 1, -3, 4], [0.5, -1, -0.75, 2]]),
                [[Math.tanh(-2), Math.tanh(1), Math.tanh(-3), Math.tanh(4)], [Math.tanh(0.5), Math.tanh(-1), Math.tanh(-0.75), Math.tanh(2)]]
            )
        })
    })
})
