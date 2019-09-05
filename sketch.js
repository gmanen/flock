const flockSize = 150
const flock = new Population(flockSize, 0.001, 0.2, () => new Boid())
const frenzySize = 10
const frenzy = new Population(frenzySize, 0.001, 0.2, () => new Shoak())
const padding = 25

function setup() {
    createCanvas(1200, 900);

    flock.populate()
    frenzy.populate()
}

function draw() {
    background(20);

    let qtree = new Quadtree(width / 2, height / 2, width / 2, height / 2, flockSize / 20)

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
        boid.bind(padding, width - padding, padding, height - padding)
        boid.update()
        boid.show()
    }

    for (let shoak of frenzy.population()) {
        shoak.bind(padding, width - padding, padding, height - padding)
        shoak.eat(qtree)
        shoak.think(qtree)
        shoak.age()
        shoak.update()
        shoak.show()
    }

    frenzy.reproduce()
    frenzy.hunger()

    strokeWeight(1)
    stroke(255)
    fill(255)
    text('Generation: ' + frenzy.generation, 0, height)
    text('Current best: ' + frenzy.currentBest, 0, height - 15)
    text('All time best: ' + frenzy.allTimeBest, 0, height - 30)
    text('Frame rate: ' + Math.round(frameRate()), 0, height - 45)
}
