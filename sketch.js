// Customizable parameters
setParameter('displayPov', getParameter('displayPov', true))
setParameter('frenzySize', getParameter('frenzySize', 30))
setParameter('shoakMutationRate', getParameter('shoakMutationRate', 10))
setParameter('shoakHungerRate', getParameter('shoakHungerRate', 0.08))
setParameter('shoakNNComplexity', getParameter('shoakNNComplexity', 1))
setParameter('shoakNNSize', getParameter('shoakNNSize', 12))
setParameter('shoakPerceptionRadius', getParameter('shoakPerceptionRadius', 300))
setParameter('shoakFov', getParameter('shoakFov', 90))
setParameter('shoakResolution', getParameter('shoakResolution', 0.5))

const schoolSize = 15 // Number of fishes for each shark's aquarium
const padding = 10 // Distance from the sides at which the motiles are going to be pushed away
const topDownWidth = 600
const povWidth = 600
const sceneHeight = 400

let frenzy = null

function setup() {
    const canvas = createCanvas( getParameter('displayPov') ? topDownWidth + povWidth : topDownWidth, sceneHeight);
    canvas.parent('sketch');

    init()
}

function draw() {
    background(20);

    if (frenzy.isExtinct()) {
        frenzy.nextGeneration()
    }

    for (const shoak of frenzy.population()) {
        shoak.qtree = new Quadtree(topDownWidth / 2, sceneHeight / 2, topDownWidth / 2, sceneHeight / 2, 2)
        const qtree = shoak.qtree
        const school = shoak.school

        // If any fish has been eaten, respawn them
        school.populate()

        // @TODO Instead of resetting the qtree every frame, try to update the positions of the points and see if it has a positive impact on performance
        for (const foish of school.population()) {
            qtree.insert(new Point(foish.position.x, foish.position.y, foish.poly(), {
                "foish": foish,
                "position": new p5.Vector(foish.position.x, foish.position.y),
                "velocity": new p5.Vector(foish.velocity.x, foish.velocity.y)
            }))
        }

        for (const foish of school.population()) {
            foish.school(qtree)
            foish.bind(padding, topDownWidth - padding, padding, sceneHeight - padding)
            foish.update()
        }

        shoak.bind(padding, topDownWidth - padding, padding, sceneHeight - padding)
        shoak.eat(qtree)
        shoak.think(qtree)
        shoak.update()
    }

    // Done on the population instead of on every individual because it handles dying individuals and storing their data for later selection
    frenzy.hunger()

    strokeWeight(1)
    stroke(255)
    fill(255)
    text('Generation: ' + frenzy.generation, 5, sceneHeight - 5)
    text('Alive: ' + frenzy.population().length, 5, sceneHeight - 20)
    text('Current best: ' + (frenzy.aliveBest ? frenzy.aliveBest.score : 0).toFixed(2), 5, sceneHeight - 35)
    text('All time best: ' + frenzy.allTimeBest.toFixed(2), 5, sceneHeight - 50)
    text('Frame rate: ' + Math.round(frameRate()), 5, sceneHeight - 65)

    // Only draw the best currently alive shark
    if (frenzy.aliveBest) {
        const shoak = frenzy.aliveBest

        // Drawing the top down scene
        shoak.show()

        for (const foish of shoak.school.population()) {
            foish.show()
        }

        if (getParameter('debug')) {
            shoak.qtree.show()
        }

        const maxDist = frenzy.aliveBest.perceptionRadius
        const w = povWidth / frenzy.aliveBest.sight.length
        const maxDistSquared = maxDist * maxDist

        if (getParameter('displayPov')) {
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

                    rect(i * w + w / 2, sceneHeight / 2, w + 1, h)
                }
            }
            pop()
        }
    }
}

function init() {
    frenzy = new Population(this.getParameter('debug') ? 1 : parseInt(getParameter('frenzySize')), 0.0005, parseFloat(getParameter('shoakMutationRate')) / 100, () => new Shoak())
    frenzy.populate()
}

function getParameter(name, defaultValue) {
    const value = JSON.parse(window.sessionStorage.getItem(name))

    return null === value ? defaultValue || null : value
}

function setParameter(name, value) {
    return window.sessionStorage.setItem(name, JSON.stringify(value))
}

(function () {
    const sliders = [
        {'variableName': 'frenzySize', 'sliderName': 'shoaks-population'},
        {'variableName': 'shoakMutationRate', 'sliderName': 'shoaks-mutation-rate'},
        {'variableName': 'shoakHungerRate', 'sliderName': 'shoaks-hunger-rate'},
        {'variableName': 'shoakNNComplexity', 'sliderName': 'shoaks-nn-complexity'},
        {'variableName': 'shoakNNSize', 'sliderName': 'shoaks-nn-size'},
        {'variableName': 'shoakPerceptionRadius', 'sliderName': 'shoaks-perception-radius'},
        {'variableName': 'shoakFov', 'sliderName': 'shoaks-fov'},
        {'variableName': 'shoakResolution', 'sliderName': 'shoaks-resolution'},
    ]
    const currentDisplayPov = getParameter('displayPov')

    document.getElementById('sketch').style.width = (currentDisplayPov ? topDownWidth + povWidth : topDownWidth) + 'px'
    document.getElementById('display-pov').checked = currentDisplayPov

    document.getElementById('debug').checked = getParameter('debug')

    document.getElementById('display-pov').addEventListener('change', (event) => {
        const newWidth = event.target.checked ? topDownWidth + povWidth : topDownWidth

        setParameter('displayPov', event.target.checked)
        resizeCanvas(newWidth, sceneHeight)

        document.getElementById('sketch').style.width = newWidth + 'px'
    })

    document.getElementById('debug').addEventListener('change', (event) => {
        setParameter('debug', event.target.checked)
        document.getElementById('shoaks-population-slider').disabled = event.target.checked

        init()
    })

    for (const slider of sliders) {
        const currentValue = getParameter(slider.variableName)

        for (const element of document.getElementsByClassName(slider.sliderName + '-current')) {
            element.innerHTML = currentValue
        }

        document.getElementById(slider.sliderName + '-slider').value = currentValue

        document.getElementById(slider.sliderName + '-slider').addEventListener('change', (event) => {
            setParameter(slider.variableName, event.target.value)

            for (const element of document.getElementsByClassName(slider.sliderName + '-current')) {
                element.innerHTML = event.target.value
            }

            init()
        })
    }
})()
