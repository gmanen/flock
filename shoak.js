class Shoak extends Motile {
    constructor(brain, shoakColor) {
        super(4, 2, 8, 0.2, 15)

        this.maxMass = 30
        this.fov = 120
        this.brain = brain || new Brain(120, [15, 15], 2)
        this.score = 0
        this.color = shoakColor || [random(255), random(255), random(255)]
    }

    radius() {
        return 10 + this.mass
    }

    think(qtree) {
        const sight = []
        const angleVector = p5.Vector.fromAngle(this.velocity.heading())
        angleVector.rotate(radians(-this.fov / 2))

        for (let i = 0; i < this.fov; i++) {
            let ray = createVector(this.position.x + angleVector.x, this.position.y + angleVector.y)
            let points = qtree.queryLine(new Line(this.position, ray))
            let closest = Infinity
            let closestPoint = null

            for (let point of points) {
                let distSquared = Math.pow(this.position.x - point.x, 2) + Math.pow(this.position.y - point.y, 2)

                if (distSquared < closest) {
                    closest = distSquared
                    closestPoint = point
                }
            }

            sight.push(Infinity === closest ? 0 : 1 - (closest / (width * width + height * height)))
            angleVector.rotate(radians(1))
        }

        const result = this.brain.evaluate(sight)

        const steering = p5.Vector.fromAngle(map(result.values[0], 0, 1, 0, TWO_PI))
        steering.setMag(map(result.values[1], 0, 1, 0, this.maxSpeed))

        this.steer(steering)

        steering.setMag(steering.mag() * 500)
        stroke(0, 0, 255)
        strokeWeight(2)
        line(this.position.x, this.position.y, this.position.x + steering.x, this.position.y + steering.y)
    }

    eat(qtree) {
        const points = qtree.query(new Circle(this.position.x, this.position.y, this.radius() + 5))

        for (let point of points) {
            flock.population().splice(flock.population().indexOf(point.data.boid), 1)
            this.mass = constrain(this.mass + 0.5, 0, this.maxMass)
        }
    }

    age() {
        this.score++

        if (this.score > frenzy.currentBest) {
            frenzy.currentBest = this.score
        }

        if (this.score > frenzy.allTimeBest) {
            frenzy.allTimeBest = this.score
        }
    }

    hunger() {
        this.mass -= 0.05
    }

    reproduce() {
        return new Shoak(this.brain.clone(), this.color)
    }

    mutate(mutationRate) {
        this.brain.mutate(mutationRate)
    }

    fitness() {
        return this.score
    }

    show() {
        stroke(255)
        fill(this.color[0], this.color[1], this.color[2], map(this.score / frenzy.currentBest, 0, 1, 50, 255))
        circle(this.position.x, this.position.y, this.radius() * 2)
    }
}
