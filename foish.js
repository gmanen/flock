const generatePoly = self => {
    const poly = []
    const head = p5.Vector.fromAngle(self.velocity.heading(), self.radius)

    poly.push({x: self.position.x + head.x, y: self.position.y + head.y})
    head.rotate(self.angle)
    head.setMag(self.radius / 2)
    poly.push({x: self.position.x + head.x, y: self.position.y + head.y})
    head.rotate(-2 * self.angle)
    poly.push({x: self.position.x + head.x, y: self.position.y + head.y})

    return poly
}

const Foish = (id, brain, foishColor) => {
    const baseSpeed = 4
    const baseMass = random(0.5, 1.5)
    const velocity = p5.Vector.random2D()
    velocity.setMag(baseSpeed)

    const fov = parseInt(getParameter('foishFov'))
    const resolution = parseFloat(getParameter('foishResolution'))

    if (!brain) {
        const layers = []

        for (let i = 0; i < parseInt(getParameter('foishNNComplexity')); i++) {
            layers.push(parseInt(getParameter('foishNNSize')))
        }

        brain = new Brain(fov * resolution, layers, 2, 'relu')
        brain.randomize()
    }

    const self = {
        id: 'foish-'+id,
        baseSpeed,
        minSpeed: 2,
        maxSpeed: 8,
        maxForce: 0.2,
        mass: baseMass,
        position: createVector(random(topDownWidth), random(sceneHeight)),
        velocity: velocity,
        acceleration: createVector(),
        radius: 10 * baseMass,
        alignPerceptionRadius: 60,
        cohesionPerceptionRadius: 75,
        separationPerceptionRadius: 30,
        sightRadius: parseInt(getParameter('foishSightRadius')),
        alignWeight: 1,
        cohesionWeight: 1,
        separationWeight: 1.5,
        flockingFov: 8 * PI / 10,
        fov,
        resolution,
        angle: 3 * PI / 4,
        sight: [],
        brain,
        score: 0,
        color: foishColor || 240 + Math.floor(random(-30, 31)),
        generateShape: generatePoly
    }

    self.shape = generatePoly(self)

    const foishBehaviors = self => ({
        school: qtree => {
            self.steer(self.align(qtree))
            self.steer(self.cohesion(qtree))
            self.steer(self.separation(qtree))
        },

        align: qtree => {
            const alignment = createVector()
            let alignmentTotal = 0

            for (const point of qtree.query(new Circle(self.position.x, self.position.y, self.alignPerceptionRadius), {types: ['foish']})) {
                if (point.id === self.id) {
                    continue
                }

                if (self.velocity.angleBetween(p5.Vector.sub(self.position, point.data.position)) > self.flockingFov) {
                    continue
                }

                alignment.add(point.data.velocity)
                alignmentTotal++
            }

            if (alignmentTotal > 0) {
                alignment.div(alignmentTotal)
                alignment.setMag(self.baseSpeed)
                alignment.mult(self.alignWeight)
            }

            return alignment
        },

        cohesion: qtree => {
            const cohesion = createVector()
            let cohesionTotal = 0

            for (let point of qtree.query(new Circle(self.position.x, self.position.y, self.cohesionPerceptionRadius), {types: ['foish']})) {
                if (point.id === self.id) {
                    continue
                }

                const otherPosition = point.data.position

                if (self.velocity.angleBetween(p5.Vector.sub(self.position, otherPosition)) > self.flockingFov) {
                    continue
                }

                cohesion.add(otherPosition)
                cohesionTotal++
            }

            if (cohesionTotal > 0) {
                cohesion.div(cohesionTotal)
                cohesion.sub(self.position)
                cohesion.setMag(self.baseSpeed)
                cohesion.mult(self.cohesionWeight)
            }

            return cohesion
        },

        separation: qtree => {
            const separation = createVector()
            let separationTotal = 0

            for (let point of qtree.query(new Circle(self.position.x, self.position.y, self.separationPerceptionRadius), {types: ['foish']})) {
                if (point.id === self.id) {
                    continue
                }

                const otherPosition = point.data.position
                const diff = p5.Vector.sub(self.position, otherPosition)

                if (self.velocity.angleBetween(diff) > self.flockingFov) {
                    continue
                }

                const d = dist(self.position.x, self.position.y, otherPosition.x, otherPosition.y)
                const dSquared = d * d

                if (0 !== dSquared) {
                    diff.div(dSquared)
                    separation.add(diff)

                    separationTotal++
                }
            }

            if (separationTotal > 0) {
                separation.div(separationTotal)
                separation.setMag(self.baseSpeed)
                separation.mult(self.separationWeight)
            }

            return separation
        },

        think: qtree => {
            const sight = self.see(qtree, ['shoak'], self.sight)

            if (debug) {
                const velocity = p5.Vector.fromAngle(self.velocity.heading(), 100)
                stroke(0, 0, 255)
                strokeWeight(2)
                line(self.position.x, self.position.y, self.position.x + velocity.x, self.position.y + velocity.y)
            }

            const result = self.brain.evaluate(sight)
            const mag = constrain(result[0], self.minSpeed, self.maxSpeed)
            const direction = constrain(result[1], -PI / 12, PI / 12)
            const computed = p5.Vector.fromAngle(self.velocity.heading(), mag)
            computed.rotate(direction)

            self.applyForce(computed)

            if (debug) {
                computed.setMag(50)
                stroke(255, 0, 0)
                strokeWeight(2)
                line(self.position.x, self.position.y, self.position.x + computed.x, self.position.y + computed.y)
            }
        },

        age: () => {
            self.score++
        },

        hunger: () => {

        },

        reproduce: (id) =>  {
            return Foish(id, self.brain.clone(), self.color)
        },

        mutate: (mutationRate) => {
            self.brain.mutate(mutationRate)
        },

        fitness: () => {
            return Math.pow(self.score, 4)
        },

        species: () => 'foish',

        show: () => {
            const foishColor = color('hsba(' + self.color + ', 100%, 80%, 1)')

            strokeWeight(1)
            stroke(foishColor)
            fill(foishColor)
            beginShape(TRIANGLES)

            for (const point of self.shape) {
                vertex(point.x, point.y)
            }

            endShape(CLOSE)
        }
    })

    return Object.assign(self, motileBehaviors(self), foishBehaviors(self), canSee(self))
}
