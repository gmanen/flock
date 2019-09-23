const getSteering = (desiredVelocity, currentVelocity) => p5.Vector.sub(desiredVelocity, currentVelocity)
const getAccelerationFromForce = (mass, force, limit) => {
    const resultingAcceleration = p5.Vector.div(force, mass)
    resultingAcceleration.limit(limit)

    return resultingAcceleration
}

const canBounce = self => ({
    bounce: (xMin, xMax, yMin, yMax) => {
        const forces = []
        
        if (self.position.x + self.velocity.x - self.radius < xMin) {
            forces.push(createVector(self.maxSpeed, 0))
        }

        if (self.position.x + self.velocity.x + self.radius > xMax) {
            forces.push(createVector(self.maxSpeed * -1, 0))
        }

        if (self.position.y + self.velocity.y - self.radius < yMin) {
            forces.push(createVector(0, self.maxSpeed))
        }

        if (self.position.y + self.velocity.y + self.radius > yMax) {
            forces.push(createVector(0, self.maxSpeed * -1))
        }

        for (const force of forces) {
            self.acceleration.add(getAccelerationFromForce(self.mass, force, 2 * self.maxForce))
        }
    }
})

const canSteer = self => ({
    steer: desired => self.acceleration.add(getAccelerationFromForce(self.mass, getSteering(desired, self.velocity), self.maxForce))
})

const canApplyForce = self => ({
    applyForce: (force, limit) => {
        limit = limit || self.maxForce
        self.acceleration.add(getAccelerationFromForce(self.mass, force, limit))
    }
})

const canUpdate = self => ({
    update: () => {
        self.position.add(self.velocity)
        self.position.x = constrain(self.position.x, 0, topDownWidth)
        self.position.y = constrain(self.position.y, 0, sceneHeight)
        self.velocity.add(self.acceleration)
        self.velocity.limit(self.maxSpeed)
        self.velocity.setMag(max(self.velocity.mag(), self.minSpeed))
        self.acceleration.mult(0)
        self.shape = self.generateShape(self)
    }
})

const motileBehaviors = self => Object.assign({}, canBounce(self), canSteer(self), canApplyForce(self), canUpdate(self))

const Motile = (baseSpeed, minSpeed, maxSpeed, maxForce, mass) => {
    mass = mass || 1

    const velocity = p5.Vector.random2D()
    velocity.setMag(baseSpeed)

    const self = {
        baseSpeed,
        minSpeed,
        maxSpeed,
        maxForce,
        mass,
        position: createVector(random(topDownWidth), random(sceneHeight)),
        velocity: velocity,
        acceleration: createVector(),
        radius: 1,
    }

    return Object.assign(self, motileBehaviors(self))
}
