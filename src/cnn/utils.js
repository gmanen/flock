function randomGaussian() {
    let rand = 0

    for (let i = 0; i < 6; i += 1) {
        rand += Math.random()
    }

    return rand / 6
}

function dotProduct(weights, input) {
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

function addVector(alice, bob) {
    const output = []

    for (let i = 0; i < alice.length; i++) {
        output.push(alice[i] + bob[i])
    }

    return output
}

function sigmoid(value) {
    return 1 / (1 + Math.exp(-value))
}

function flatten(array) {
    return array.reduce(
        (flattened, current) => flattened.concat(Array.isArray(current) ? flatten(current) : current),
        []
    )
}

exports.randomGaussian = randomGaussian
exports.dotProduct = dotProduct
exports.addVector = addVector
exports.sigmoid = sigmoid
exports.flatten = flatten
