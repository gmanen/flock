class Motile {
    constructor(baseSpeed, minSpeed, maxSpeed, maxForce, mass) {
        this.baseSpeed = baseSpeed
        this.minSpeed = minSpeed
        this.maxSpeed = maxSpeed
        this.maxForce = maxForce

        this.position = createVector(random(topDownWidth), random(sceneHeight))
        this.velocity = p5.Vector.random2D()
        this.velocity.setMag(this.baseSpeed)
        this.acceleration = createVector()

        this.mass = mass || 1
    }

    radius() {
        return 1
    }

    bind(xMin, xMax, yMin, yMax) {
        if (this.position.x + this.velocity.x - this.radius() < xMin) {
            this.applyForce(createVector(this.maxSpeed, 0), 2 * this.maxForce)
        }

        if (this.position.x + this.velocity.x + this.radius() > xMax) {
            this.applyForce(createVector(this.maxSpeed * -1, 0), 2 * this.maxForce)
        }

        if (this.position.y + this.velocity.y - this.radius() < yMin) {
            this.applyForce(createVector(0, this.maxSpeed), 2 * this.maxForce)
        }

        if (this.position.y + this.velocity.y + this.radius() > yMax) {
            this.applyForce(createVector(0, this.maxSpeed * -1), 2 * this.maxForce)
        }
    }

    steer(force, limit) {
        force.sub(this.velocity)
        this.applyForce(force, limit)
    }

    applyForce(force, limit) {
        force.div(this.mass)
        force.limit(limit || this.maxForce)
        this.acceleration.add(force)
    }

    update() {
        this.position.add(this.velocity)
        this.position.x = constrain(this.position.x, 0, topDownWidth)
        this.position.y = constrain(this.position.y, 0, sceneHeight)
        this.velocity.add(this.acceleration)
        this.velocity.limit(this.maxSpeed)
        this.velocity.setMag(max(this.velocity.mag(), this.minSpeed))
        this.acceleration.mult(0)
    }
}
