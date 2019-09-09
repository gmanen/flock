const debug = false
const flockSize = 150
const flock = new Population(flockSize, 0.001, 0.1, () => new Boid())
const frenzySize = debug ? 1 : 1
const frenzy = new Population(frenzySize, 0.0005, 0.5, () => {const shoak = new Shoak(); shoak.brain.randomize(); return shoak;})
const padding = 25
const topDownWidth = 1200
const topDownHeight = 900
const povWidth = 1200
const povHeight = 100

function setup() {
    createCanvas(topDownWidth, topDownHeight + povHeight);

    flock.populate()
    frenzy.populate()
}

function draw() {
    if (debug) {
        noLoop()
    }

    background(20);

    let qtree = new Quadtree(topDownWidth / 2, topDownHeight / 2, topDownWidth / 2, topDownHeight / 2, flockSize / 40)

    flock.populate()

    if (frenzy.isExtinct()) {
        frenzy.nextGeneration()
    }

    for (let boid of flock.population()) {
        qtree.insert(new Point(boid.position.x, boid.position.y, boid.poly(), {
            "boid": boid,
            "position": new p5.Vector(boid.position.x, boid.position.y),
            "velocity": new p5.Vector(boid.velocity.x, boid.velocity.y)
        }))

        boid.flock(qtree)
        boid.bind(padding, topDownWidth - padding, padding, topDownHeight - padding)
    }

    for (let shoak of frenzy.population()) {
        shoak.bind(padding, topDownWidth - padding, padding, topDownHeight - padding)
        shoak.eat(qtree)
        shoak.think(qtree)
        shoak.age()
    }

    frenzy.reproduce()
    frenzy.hunger()

    for (let boid of flock.population()) {
        boid.show()
        boid.update()
    }

    for (let shoak of frenzy.population()) {
        shoak.show()
        shoak.update()
    }

    if (debug) {
        qtree.show()
    }

    strokeWeight(1)
    stroke(255)
    fill(255)
    text('Generation: ' + frenzy.generation, 0, topDownHeight)
    text('Alive best: ' + Math.pow((frenzy.aliveBest ? frenzy.aliveBest.fitness() : 0), 1/4), 0, topDownHeight - 15)
    text('Current best: ' + Math.pow(frenzy.currentBest, 1/4), 0, topDownHeight - 30)
    text('All time best: ' + Math.pow(frenzy.allTimeBest, 1/4), 0, topDownHeight - 45)
    text('Frame rate: ' + Math.round(frameRate()), 0, topDownHeight - 60)

    if (frenzy.aliveBest) {
        const maxDist = Math.sqrt(topDownWidth * topDownWidth + topDownHeight * topDownHeight)
        const w = povWidth / frenzy.aliveBest.sight.length
        const maxDistSquared = maxDist * maxDist

        push()
        translate(0, topDownHeight)
        for (let i = 0; i < frenzy.aliveBest.sight.length; i++) {
            let distance = frenzy.aliveBest.sight[i]

            if (distance >= 0) {
                let distanceSquared = distance * distance
                let b = map(distanceSquared, 0, maxDistSquared, 255, 0)
                let h = map(distance, 0, maxDist, povHeight, 0, true)

                noStroke()
                fill(b)
                rectMode(CENTER)

                rect(i * w + w / 2, povHeight / 2, w, h)
            }
        }
        pop()
    }
}

function mouseClicked() {
    loop()
}
