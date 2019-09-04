class Motile {
    constructor(baseSpeed, minSpeed, maxSpeed, maxForce, mass) {
        this.baseSpeed = baseSpeed
        this.minSpeed = minSpeed
        this.maxSpeed = maxSpeed
        this.maxForce = maxForce

        this.position = createVector(random(width), random(height))
        this.velocity = p5.Vector.random2D()
        this.velocity.setMag(this.baseSpeed)
        this.acceleration = createVector()

        this.mass = mass || 1
    }

    bind(xMin, xMax, yMin, yMax) {
        let force = null

        if (this.position.x + this.velocity.x < xMin) {
            force = createVector(this.maxSpeed, 0)
        }

        if (this.position.x + this.velocity.x > xMax) {
            force = createVector(this.maxSpeed * -1, 0)
        }

        if (this.position.y + this.velocity.y < yMin) {
            force = createVector(0, this.maxSpeed)
        }

        if (this.position.y + this.velocity.y > yMax) {
            force = createVector(0, this.maxSpeed * -1)
        }

        if (null !== force) {
            this.applyForce(force, this.maxForce * 2)
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
        this.position.x = constrain(this.position.x, 0, width)
        this.position.y = constrain(this.position.y, 0, height)
        this.velocity.add(this.acceleration)
        this.velocity.limit(this.maxSpeed)
        this.velocity.setMag(max(this.velocity.mag(), this.minSpeed))
        this.acceleration.mult(0)
    }
}
