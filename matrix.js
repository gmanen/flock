function createArray(size) {
    let layer = []

    for (let i = 0; i < size; i++) {
        layer.push(0)
    }

    return layer
}

class Vector {
    constructor(size) {
        this.values = createArray(size)
    }

    static fromArray(array) {
        const vector = new Vector(array.length)

        vector.values = array

        return vector
    }

    length() {
        return this.values.length
    }

    randomize() {
        for (let i = 0; i < this.values.length; i++) {
            this.values[i] = randomGaussian()
        }
    }

    add(vector) {
        if (this.length() !== vector.length()) {
            throw 'Vector addition with vectors of different lengths'
        }

        const result = []

        for (let i = 0; i < this.length(); i++) {
            result.push(this.values[i] + vector.values[i])
        }

        return Vector.fromArray(result)
    }

    map(callable) {
        return Vector.fromArray(this.values.map(callable))
    }
}

class Matrix {
    constructor(rows, columns) {
        this.rows = []

        for (let i = 0; i < rows; i++) {
            this.rows.push(createArray(columns))
        }
    }

    static fromArray(array) {
        const matrix = new Matrix(array.length, array[0].length)

        matrix.rows = array

        return matrix
    }

    randomize() {
        for (let i = 0; i < this.rows.length; i++) {
            for (let j = 0; j < this.rows[i].length; j++) {
                this.rows[i][j] = randomGaussian()
            }
        }
    }

    dot(vector) {
        const result = []

        for (let i = 0; i < this.rows.length; i++) {
            let sum = 0

            for (let j = 0; j < this.rows[i].length; j++) {
                sum += this.rows[i][j] * vector.values[j]
            }

            result.push(sum)
        }

        return Vector.fromArray(result)
    }
}
