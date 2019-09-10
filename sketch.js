const debug = true
const frenzySize = debug ? 1 : 10
const frenzy = new Population(frenzySize, 0.0005, 0.5, () => new Shoak())
const flockSize = debug ? 150 : frenzySize * 40
const flock = new Population(flockSize, 0.001, 0.1, () => new Boid())
const padding = 25
const sceneWidth = 1600
const topDownHeight = 600
const povHeight = 400
const perceptionRadius = 500

function setup() {
    createCanvas(sceneWidth, topDownHeight + povHeight);

    flock.populate()
    frenzy.populate()
}

function draw() {
    background(20);

    let qtree = new Quadtree(sceneWidth / 2, topDownHeight / 2, sceneWidth / 2, topDownHeight / 2, flockSize / 40)

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
        boid.bind(padding, sceneWidth - padding, padding, topDownHeight - padding)
    }

    for (let shoak of frenzy.population()) {
        shoak.bind(padding, sceneWidth - padding, padding, topDownHeight - padding)
        shoak.eat(qtree)
        shoak.think(qtree)
        shoak.age()
    }

    //frenzy.reproduce()
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
        const maxDist = Math.sqrt(sceneWidth * sceneWidth + topDownHeight * topDownHeight)
        const w = sceneWidth / frenzy.aliveBest.sight.length
        const maxDistSquared = 900 * 900

        push()
        translate(0, topDownHeight)
        for (let i = 0; i < frenzy.aliveBest.sight.length; i++) {
            let distance = frenzy.aliveBest.sight[i]

            if (distance >= 0) {
                let distanceSquared = distance * distance
                let b = map(distanceSquared, 0, maxDistSquared, 255, 0, true)
                let h = map(distance, 0, perceptionRadius, povHeight, 0, true)

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
