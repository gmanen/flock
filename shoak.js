class Shoak extends Motile {
    constructor(brain, shoakColor) {
        super(4, 2, 8, 0.2, 15)

        this.maxMass = 30
        this.fov = 90
        this.resolution = 0.5
        this.brain = brain || new Brain(this.fov / this.resolution, [15, 15], 2)
        this.score = 0
        this.color = shoakColor || [random(255), random(255), random(255)]
        this.sight = []
    }

    radius() {
        return 10 + this.mass
    }

    think(qtree) {
        const sight = []
        this.sight = []
        const angleVector = p5.Vector.fromAngle(this.velocity.heading(), 1)
        const maxDist = Math.sqrt(sceneWidth * sceneWidth + topDownHeight * topDownHeight)
        angleVector.rotate(radians(-this.fov / 2))

        for (let i = 0; i < this.fov; i += this.resolution) {
            let ray = createVector(this.position.x + angleVector.x, this.position.y + angleVector.y)
            let points = qtree.queryLine(new Line(this.position, ray))
            let closest = Infinity
            let closestPoint = null

            for (let point of points) {
                let d = p5.Vector.dist(this.position, point)

                if (d < closest) {
                    closest = d
                    closestPoint = point
                }
            }

            if (debug) {
                const drawRay = p5.Vector.fromAngle(angleVector.heading(), closest === Infinity ? sceneWidth : closest)
                stroke(255, 255, 255, 20)
                strokeWeight(2)
                line(this.position.x, this.position.y, this.position.x + drawRay.x, this.position.y + drawRay.y)

                if (closestPoint) {
                    strokeWeight(1)
                    stroke(255, 0, 0)
                    fill(255, 0, 0)
                    circle(closestPoint.x, closestPoint.y, 2)
                }
            }

            let distance = Infinity === closest ? maxDist : closest

            sight.push(map(distance, 0, perceptionRadius, 1, 0, true))

            this.sight.push(Infinity === closest ? -1 : (distance * (cos(angleVector.heading() - this.velocity.heading()))))
            angleVector.rotate(radians(this.resolution))
        }

        if (debug) {
            const velocity = p5.Vector.fromAngle(this.velocity.heading(), 100)
            stroke(0, 0, 255)
            strokeWeight(2)
            line(this.position.x, this.position.y, this.position.x + velocity.x, this.position.y + velocity.y)
        }

        const result = this.brain.evaluate(sight)
        const mag = map(result[0], 0, 1, this.minSpeed, this.maxSpeed)

        this.velocity.rotate(map(result[1], 0, 1, -1 * PI / 4, PI / 4))
        const force = p5.Vector.fromAngle(this.velocity, mag)

        this.applyForce(force)

        if (debug) {
            const computed = p5.Vector.fromAngle(this.velocity.heading(), 100)
            stroke(255, 0, 0)
            strokeWeight(2)
            line(this.position.x, this.position.y, this.position.x + computed.x, this.position.y + computed.y)
        }
    }

    eat(qtree) {
        const points = qtree.query(new Circle(this.position.x, this.position.y, this.radius() + 15))

        for (let point of points) {
            flock.population().splice(flock.population().indexOf(point.data.boid), 1)
            this.mass = constrain(this.mass + 0.5, 0, this.maxMass)
        }
    }

    age() {
        this.score++

        if (this.fitness() > frenzy.currentBest) {
            frenzy.currentBest = this.fitness()
        }

        if (this.fitness() > frenzy.allTimeBest) {
            frenzy.allTimeBest = this.fitness()
        }
    }

    hunger() {
        this.mass -= 0.1
    }

    reproduce() {
        return new Shoak(this.brain.clone(), this.color)
    }

    mutate(mutationRate) {
        this.brain.mutate(mutationRate)
    }

    fitness() {
        return Math.pow(this.score, 4)
    }

    species() {
        return this.color.map(value => '' + Math.round(value)).join
    }

    show() {
        stroke(255)
        fill(this.color[0], this.color[1], this.color[2], map(this.fitness() / frenzy.currentBest, 0, 1, 50, 255))
        circle(this.position.x, this.position.y, this.radius() * 2)
    }
}
