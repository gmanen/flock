const generateCircle = self => {
    return new Circle(self.position.x, self.position.y, self.radius)
}

const Shoak = (id, brain, shoakColor) => {
    const baseSpeed = 4
    const baseMass = 15
    const fov = parseInt(getParameter('shoakFov'))
    const resolution = parseFloat(getParameter('shoakResolution'))

    if (!brain) {
        const layers = []

        for (let i = 0; i < parseInt(getParameter('shoakNNComplexity')); i++) {
            layers.push(parseInt(getParameter('shoakNNSize')))
        }

        brain = new Brain(fov * resolution + 1, layers, 2, 'relu')
        brain.randomize()
    }

    const velocity = p5.Vector.random2D()
    velocity.setMag(baseSpeed)

    const self = {
        id: 'shoak-'+id,
        baseSpeed,
        minSpeed: 2,
        maxSpeed: 8,
        maxForce: 0.2,
        mass: baseMass,
        position: createVector(random(topDownWidth), random(sceneHeight)),
        velocity: velocity,
        acceleration: createVector(),
        radius: 5 + baseMass,
        fov,
        resolution, // Increment step size for the rays simulating the shark's vision
        sightRadius: parseInt(getParameter('shoakSightRadius')),
        maxMass: 30,
        brain,
        score: 0, // Useful mass eaten by the shark
        color: shoakColor || (360 + Math.floor(random(-30, 31))) % 360,
        sight: [], // Current sight is stored to be displayed
        generateShape: generateCircle
    }

    self.shape = generateCircle(self)

    const shoakBehaviors = self => ({
        think: qtree => {
            const sight = self.see(qtree, ['foish'], self.sight)

            if (debug) {
                const velocity = p5.Vector.fromAngle(self.velocity.heading(), 100)
                stroke(0, 0, 255)
                strokeWeight(2)
                line(self.position.x, self.position.y, self.position.x + velocity.x, self.position.y + velocity.y)
            }

            const result = self.brain.evaluate(sight.concat([1 - self.mass / self.maxMass]))
            const mag = constrain(result[0], self.minSpeed, self.maxSpeed)
            const direction = constrain(result[1], -PI / 12, PI / 12)

            self.velocity.rotate(direction)
            self.applyForce(p5.Vector.fromAngle(self.velocity, mag))

            if (debug) {
                const computed = p5.Vector.fromAngle(self.velocity.heading(), 100)
                stroke(255, 0, 0)
                strokeWeight(2)
                line(self.position.x, self.position.y, self.position.x + computed.x, self.position.y + computed.y)
            }
        },

        eat: qtree => {
            const eaten = []
            const points = qtree.query(new Circle(self.position.x, self.position.y, self.radius + 10), {types: ['foish']})

            for (const point of points) {
                const massGain = Math.min(point.data.mass, self.maxMass - self.mass)

                self.mass += massGain
                self.radius = 5 + self.mass
                self.score += massGain
                eaten.push(point.data.subject)
            }

            if (self.score > frenzy.allTimeBest) {
                frenzy.allTimeBest = self.score
            }

            return eaten
        },

        age: () => {

        },

        hunger: () => {
            self.mass -= parseFloat(getParameter('shoakHungerRate'))
        },

        reproduce: (id) =>  {
            return Shoak(id, self.brain.clone(), self.color)
        },

        mutate: (mutationRate) => {
            self.brain.mutate(mutationRate)
        },

        fitness: () => {
            return Math.pow(self.score, 4)
        },

        species: () => {
            return self.color.toString()
        },

        show: () => {
            const opacity = map(null === frenzy.aliveBest || 0 === frenzy.aliveBest.score ? 1 : self.score / frenzy.aliveBest.score, 0, 1, 50, 255, true)
            const shoakColor = color('hsba('+self.color+', 100%, 80%, '+opacity+')')

            stroke(shoakColor)
            fill(shoakColor)
            circle(Math.floor(self.position.x), Math.floor(self.position.y), self.radius * 2)
        }
    })

    return Object.assign(self, motileBehaviors(self), shoakBehaviors(self), canSee(self))
}
