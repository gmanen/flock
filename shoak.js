class Shoak extends Motile {
    constructor(brain, shoakColor) {
        super(4, 2, 8, 0.2, 15)

        this.fov = parseInt(getParameter('shoakFov'))
        this.resolution = parseFloat(getParameter('shoakResolution')) // Increment step size for the rays simulating the shark's vision
        this.perceptionRadius = parseInt(getParameter('shoakPerceptionRadius'))

        if (!brain) {
            const layers = []

            for (let i = 0; i < parseInt(getParameter('shoakNNComplexity')); i++) {
                layers.push(parseInt(getParameter('shoakNNSize')))
            }

            brain = new Brain(this.fov / this.resolution + 1, layers, 2, 'relu')
            brain.randomize()
        }

        this.maxMass = 30
        this.brain = brain
        this.score = 0 // Age of the shark
        this.color = shoakColor || [random(255), random(255), random(255)]
        this.sight = [] // Current sight is stored to be displayed

        this.school = new Population(schoolSize, 0.001, 0.1, () => new Foish())
    }

    radius() {
        return 5 + this.mass
    }

    think(qtree) {
        const sight = []
        this.sight = []
        const angleVector = p5.Vector.fromAngle(this.velocity.heading(), 1)
        angleVector.rotate(radians(-this.fov / 2)) // Starting angle for the rays

        for (let i = 0; i < this.fov; i += this.resolution) {
            const points = qtree.query(
                new Circle(this.position.x, this.position.y, this.perceptionRadius),
                new Line(this.position, createVector(this.position.x + angleVector.x, this.position.y + angleVector.y))
            )
            let closest = Infinity
            let closestPoint = null

            for (const point of points) {
                const d = p5.Vector.dist(this.position, point)

                if (d < closest) {
                    closest = d
                    closestPoint = point
                }
            }

            const distance = Infinity === closest || closest > this.perceptionRadius ? this.perceptionRadius : closest

            if (getParameter('debug')) {
                const drawRay = p5.Vector.fromAngle(angleVector.heading(), closest === Infinity ? this.perceptionRadius : closest)

                stroke(255, 255, 255, 20)
                strokeWeight(2)
                line(this.position.x, this.position.y, this.position.x + drawRay.x, this.position.y + drawRay.y)

                if (closestPoint) {
                    strokeWeight(1)
                    stroke(255, 0, 0)
                    fill(255, 0, 0)
                    circle(closestPoint.x, closestPoint.y, 2)
                }

                noFill()
                strokeWeight(1)
                stroke(255)
                circle(this.position.x, this.position.y, this.perceptionRadius * 2)
            }

            /*
             * Input for the shark's Neural Net, for each ray the distance to the closest fish is a value from 0 to 1
             * The closest fishes will have a value closer to 1, furthest a value closer to 0
             */
            sight.push(map(distance, 0, this.perceptionRadius, 1, 0, true))
            // -1 means no fish intersects that ray so nothing should be displayed in the POV scene
            this.sight.push(Infinity === closest ? -1 : (distance * (cos(angleVector.heading() - this.velocity.heading()))))

            angleVector.rotate(radians(this.resolution))
        }

        if (getParameter('debug')) {
            const velocity = p5.Vector.fromAngle(this.velocity.heading(), 100)
            stroke(0, 0, 255)
            strokeWeight(2)
            line(this.position.x, this.position.y, this.position.x + velocity.x, this.position.y + velocity.y)
        }

        const result = this.brain.evaluate(sight.concat([1 - this.mass / this.maxMass]))
        const mag = constrain(result[0], this.minSpeed, this.maxSpeed)
        const direction = constrain(result[1], -PI / 12, PI / 12)

        this.velocity.rotate(direction)
        this.applyForce(p5.Vector.fromAngle(this.velocity, mag))

        if (getParameter('debug')) {
            const computed = p5.Vector.fromAngle(this.velocity.heading(), 100)
            stroke(255, 0, 0)
            strokeWeight(2)
            line(this.position.x, this.position.y, this.position.x + computed.x, this.position.y + computed.y)
        }
    }

    eat(qtree) {
        const points = qtree.query(new Circle(this.position.x, this.position.y, this.radius() + 10))

        for (const point of points) {
            const massGain = Math.min(point.data.foish.mass, this.maxMass - this.mass)

            this.mass += massGain
            this.score += massGain
            this.school.population().splice(this.school.population().indexOf(point.data.foish), 1)
        }

        if (this.score > frenzy.allTimeBest) {
            frenzy.allTimeBest = this.score
        }
    }

    hunger() {
        this.mass -= parseFloat(getParameter('shoakHungerRate'))
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
        fill(this.color[0], this.color[1], this.color[2], map(null === frenzy.aliveBest || 0 === frenzy.aliveBest.score ? 1 : this.score / frenzy.aliveBest.score, 0, 1, 50, 255))
        circle(this.position.x, this.position.y, this.radius() * 2)
    }
}
