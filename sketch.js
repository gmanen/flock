const urlParams = new URLSearchParams(window.location.search);

const debug = urlParams.has('debug') && parseInt(urlParams.get('debug')) === 1
const frenzySize = debug ? 1 : 30
const flockSize = 10 // Number of fishes for each shark's aquarium
const frenzy = new Population(frenzySize, 0.0005, 0.2, () => new Shoak())
const padding = 10 // Distance from the sides at which the motiles are going to be pushed away
const topDownWidth = 600
const povWidth = 600
const sceneHeight = 400

function setup() {
    createCanvas(topDownWidth + povWidth, sceneHeight);

    frenzy.populate()
}

function draw() {
    background(20);

    if (frenzy.isExtinct()) {
        frenzy.nextGeneration()
    }

    for (const shoak of frenzy.population()) {
        shoak.qtree = new Quadtree(topDownWidth / 2, sceneHeight / 2, topDownWidth / 2, sceneHeight / 2, 2)
        const qtree = shoak.qtree
        const flock = shoak.flock

        // If any fish has been eaten, respawn them
        flock.populate()

        // @TODO Instead of resetting the qtree every frame, try to update the positions of the points and see if it has a positive impact on performance
        for (const boid of flock.population()) {
            qtree.insert(new Point(boid.position.x, boid.position.y, boid.poly(), {
                "boid": boid,
                "position": new p5.Vector(boid.position.x, boid.position.y),
                "velocity": new p5.Vector(boid.velocity.x, boid.velocity.y)
            }))
        }

        for (const boid of flock.population()) {
            boid.flock(qtree)
            boid.bind(padding, topDownWidth - padding, padding, sceneHeight - padding)
            boid.update()
        }

        shoak.bind(padding, topDownWidth - padding, padding, sceneHeight - padding)
        shoak.eat(qtree)
        shoak.think(qtree)
        shoak.age()
        shoak.update()
    }

    // Done on the population instead of on every individual because it handles dying individuals and storing their data for later selection
    frenzy.hunger()

    strokeWeight(1)
    stroke(255)
    fill(255)
    text('Generation: ' + frenzy.generation, 0, sceneHeight)
    text('Alive best: ' + Math.pow((frenzy.aliveBest ? frenzy.aliveBest.fitness() : 0), 1 / 4).toFixed(2), 0, sceneHeight - 15)
    text('Current best: ' + Math.pow(frenzy.currentBest, 1 / 4).toFixed(2), 0, sceneHeight - 30)
    text('All time best: ' + Math.pow(frenzy.allTimeBest, 1 / 4).toFixed(2), 0, sceneHeight - 45)
    text('Frame rate: ' + Math.round(frameRate()), 0, sceneHeight - 60)

    // Only draw the best currently alive shark
    if (frenzy.aliveBest) {
        const shoak = frenzy.aliveBest

        // Drawing the top down scene
        shoak.show()

        for (const boid of shoak.flock.population()) {
            boid.show()
        }

        if (debug) {
            shoak.qtree.show()
        }

        const maxDist = Math.sqrt(topDownWidth * topDownWidth + sceneHeight * sceneHeight)
        const w = povWidth / frenzy.aliveBest.sight.length
        const maxDistSquared = maxDist * maxDist

        // Drawing the POV scene
        push()
        translate(topDownWidth, 0)
        for (let i = 0; i < frenzy.aliveBest.sight.length; i++) {
            const distance = frenzy.aliveBest.sight[i]

            if (distance >= 0) {
                // @TODO The POV scene doesn't seem to draw properly, there's probably some optimization to do here
                const distanceSquared = distance * distance
                const b = map(distanceSquared, 0, maxDistSquared, 255, 0, true)
                const h = map(distance, 0, maxDist, sceneHeight, 0, true)

                noStroke()
                fill(b)
                rectMode(CENTER)

                rect(i * w + w / 2, sceneHeight / 2, w, h)
            }
        }
        pop()
    }
}
