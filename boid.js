class Boid extends Motile {
    constructor() {
        super(4, 2, 8, 0.2)

        this.alignPerceptionRadius = 60
        this.cohesionPerceptionRadius = 75
        this.separationPerceptionRadius = 30

        this.alignWeight = 1
        this.cohesionWeight = 1
        this.separationWeight = 1.5

        this.fov = 8 * PI / 10
    }

    flock(qtree) {
        this.steer(this.align(qtree))
        this.steer(this.cohesion(qtree))
        this.steer(this.separation(qtree))
    }

    align(qtree) {
        const alignment = createVector()
        let alignmentTotal = 0

        const points = qtree.query(new Circle(this.position.x, this.position.y, this.alignPerceptionRadius))

        for (let point of points) {
            let other = point.data.boid
            let otherPosition = point.data.position
            let otherVelocity = point.data.velocity

            if (other === this) {
                continue
            }

            let diff = p5.Vector.sub(this.position, otherPosition)

            if (this.velocity.angleBetween(diff) > this.fov) {
                continue
            }

            alignment.add(otherVelocity)
            alignmentTotal++
        }

        if (alignmentTotal > 0) {
            alignment.div(alignmentTotal)
            alignment.setMag(this.baseSpeed)
            alignment.mult(this.alignWeight)
        }

        return alignment
    }

    cohesion(qtree) {
        const cohesion = createVector()
        let cohesionTotal = 0

        const points = qtree.query(new Circle(this.position.x, this.position.y, this.cohesionPerceptionRadius))

        for (let point of points) {
            let other = point.data.boid
            let otherPosition = point.data.position

            if (other === this) {
                continue
            }

            let diff = p5.Vector.sub(this.position, otherPosition)

            if (this.velocity.angleBetween(diff) > this.fov) {
                continue
            }

            cohesion.add(otherPosition)
            cohesionTotal++
        }

        if (cohesionTotal > 0) {
            cohesion.div(cohesionTotal)
            cohesion.sub(this.position)
            cohesion.setMag(this.baseSpeed)
            cohesion.mult(this.cohesionWeight)
        }

        return cohesion
    }

    separation(qtree) {
        const separation = createVector()
        let separationTotal = 0

        const points = qtree.query(new Circle(this.position.x, this.position.y, this.separationPerceptionRadius))

        for (let point of points) {
            let other = point.data.boid
            let otherPosition = point.data.position

            if (other === this) {
                continue
            }

            let diff = p5.Vector.sub(this.position, otherPosition)

            if (this.velocity.angleBetween(diff) > this.fov) {
                continue
            }

            let d = dist(this.position.x, this.position.y, otherPosition.x, otherPosition.y)

            let dSquared = d * d

            if (0 === dSquared) {
                dSquared = 0.00001
            }

            diff.div(dSquared)
            separation.add(diff)

            separationTotal++
        }

        if (separationTotal > 0) {
            separation.div(separationTotal)
            separation.setMag(this.baseSpeed)
            separation.mult(this.separationWeight)
        }

        return separation
    }

    poly() {
        const poly = []

        const head = createVector(this.velocity.x, this.velocity.y)
        head.setMag(5)

        poly.push(createVector(this.position.x + head.x, this.position.y + head.y))
        head.rotate(radians(135))
        head.setMag(3)
        poly.push(createVector(this.position.x + head.x, this.position.y + head.y))
        head.rotate(radians(-270))
        poly.push(createVector(this.position.x + head.x, this.position.y + head.y))

        return poly
    }

    show() {
        strokeWeight(5)
        stroke(200)
        beginShape()
        for (let point of this.poly()) {
            vertex(point.x, point.y)
        }
        endShape(CLOSE)
    }

    setPosition(x, y) {
        this.position = new p5.Vector(x, y)
    }

    setVelocity(x, y) {
        this.velocity = new p5.Vector(x, y)
    }

    setAcceleration(x, y) {
        this.acceleration = new p5.Vector(x, y)
    }
}
