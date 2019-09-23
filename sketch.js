// Customizable parameters
setParameter('displayPov', getParameter('displayPov', true))
setParameter('frenzySize', getParameter('frenzySize', 30))
setParameter('schoolSize', getParameter('schoolSize', 15))
setParameter('shoakMutationRate', getParameter('shoakMutationRate', 10))
setParameter('foishMutationRate', getParameter('foishMutationRate', 10))
setParameter('foishReproductionRate', getParameter('foishReproductionRate', 0.1))
setParameter('shoakHungerRate', getParameter('shoakHungerRate', 0.08))
setParameter('shoakNNComplexity', getParameter('shoakNNComplexity', 1))
setParameter('foishNNComplexity', getParameter('foishNNComplexity', 1))
setParameter('shoakNNSize', getParameter('shoakNNSize', 12))
setParameter('foishNNSize', getParameter('foishNNSize', 12))
setParameter('shoakSightRadius', getParameter('shoakSightRadius', 300))
setParameter('foishSightRadius', getParameter('foishSightRadius', 200))
setParameter('shoakFov', getParameter('shoakFov', 90))
setParameter('foishFov', getParameter('foishFov', 90))
setParameter('shoakResolution', getParameter('shoakResolution', 1))
setParameter('foishResolution', getParameter('foishResolution', 1))
let debug = getParameter('debug')

const padding = 10 // Distance from the sides at which the motiles are going to be pushed away
const topDownWidth = 600
const povWidth = 600
const sceneHeight = 400

let frenzy = null
let school = null
let qtree  = null

function setup() {
    const canvas = createCanvas(getParameter('displayPov') ? topDownWidth + povWidth : topDownWidth, sceneHeight);
    canvas.parent('sketch');

    init()
}

function draw() {
    background(175)

    if (frenzy.isExtinct()) {
        for (const shoak of frenzy.nextGeneration()) {
            qtree.insert(new Point(shoak.id, 'shoak', shoak.position.x, shoak.position.y, shoak.shape, {
                color: shoak.color,
                mass: shoak.mass,
                position: shoak.position.copy(),
                velocity: shoak.velocity.copy(),
                subject: shoak
            }))
        }
    }

    if (school.isExtinct()) {
        for (const foish of school.nextGeneration()) {
            qtree.insert(new Point(foish.id, 'foish', foish.position.x, foish.position.y, foish.shape, {
                color: foish.color,
                mass: foish.mass,
                position: foish.position.copy(),
                velocity: foish.velocity.copy(),
                subject: foish
            }))
        }
    }

    for (const foish of school.reproduce()) {
        qtree.insert(new Point(foish.id, 'foish', foish.position.x, foish.position.y, foish.shape, {
            color: foish.color,
            mass: foish.mass,
            position: foish.position.copy(),
            velocity: foish.velocity.copy(),
            subject: foish
        }))
    }

    for (const shoak of frenzy.population()) {
        for (const foish of shoak.eat(qtree)) {
            school.remove(foish)
            qtree.remove(foish.id)
        }

        shoak.bounce(padding, topDownWidth - padding, padding, sceneHeight - padding)
        shoak.think(qtree)
    }

    for (const foish of school.population()) {
        foish.school(qtree)
        foish.bounce(padding, topDownWidth - padding, padding, sceneHeight - padding)
        foish.think(qtree)
    }

    // Done on the population instead of on every individual because it handles dying individuals and storing their data for later selection
    for (const shoak of frenzy.hunger()) {
        qtree.remove(shoak.id)
    }

    frenzy.age()
    school.hunger()
    school.age()

    for (const shoak of frenzy.population()) {
        shoak.update()
        qtree.move(shoak.id, shoak.position.x, shoak.position.y, shoak.shape, {
            mass: shoak.mass,
            position: shoak.position.copy(),
            velocity: shoak.velocity.copy()
        })
    }

    for (const foish of school.population()) {
        foish.update()
        qtree.move(foish.id, foish.position.x, foish.position.y, foish.shape, {
            mass: foish.mass,
            position: foish.position.copy(),
            velocity: foish.velocity.copy()
        })
    }

    strokeWeight(1)
    stroke(255)
    fill(255)
    text('Generation: ' + frenzy.generation, 5, sceneHeight - 5)
    text('Alive: ' + frenzy.population().length, 5, sceneHeight - 20)
    text('Current best: ' + (frenzy.aliveBest ? frenzy.aliveBest.score : 0).toFixed(2), 5, sceneHeight - 35)
    text('All time best: ' + frenzy.allTimeBest.toFixed(2), 5, sceneHeight - 50)
    text('Frame rate: ' + Math.round(frameRate()), 5, sceneHeight - 65)

    // Drawing the top down scene
    for (const shoak of frenzy.population()) {
        shoak.show()
    }

    for (const foish of school.population()) {
        foish.show()
    }

    if (debug) {
        qtree.show()
    }

    if (frenzy.aliveBest) {
        const maxDist = frenzy.aliveBest.sightRadius
        const w = povWidth / frenzy.aliveBest.sight.length
        const maxDistSquared = maxDist * maxDist

        if (getParameter('displayPov')) {
            // Drawing the POV scene
            push()
            translate(topDownWidth, 0)

            for (let i = 0; i < frenzy.aliveBest.sight.length; i++) {
                const {distance, color: pointColor} = frenzy.aliveBest.sight[i]

                if (distance >= 0) {
                    const distanceSquared = distance * distance
                    const light = Math.floor(map(distanceSquared, 0, maxDistSquared, 80, 20, true))
                    const h = map(distance, 0, maxDist, sceneHeight, 0, true)

                    noStroke()
                    fill(color('hsb(' + pointColor + ', 100%, ' + light + '%)'))
                    rectMode(CENTER)

                    rect(i * w + w / 2, sceneHeight / 2, w + 1, h)
                }
            }
            pop()
        }
    }
}

function init() {
    const frenzySize = debug ? 1 : parseInt(getParameter('frenzySize'))
    const schoolSize = frenzySize * parseInt(getParameter('schoolSize'))

    qtree = new Quadtree(topDownWidth / 2, sceneHeight / 2, topDownWidth / 2, sceneHeight / 2, (frenzySize + schoolSize) / 10)

    frenzy = new Population(
        frenzySize,
        0.0005,
        parseFloat(getParameter('shoakMutationRate')) / 100,
        (id) => Shoak(id)
    )
    
    for (const shoak of frenzy.populate()) {
        qtree.insert(new Point(shoak.id, 'shoak', shoak.position.x, shoak.position.y, shoak.shape, {
            color: shoak.color,
            mass: shoak.mass,
            position: shoak.position.copy(),
            velocity: shoak.velocity.copy(),
            subject: shoak
        }))
    }

    school = new Population(
        schoolSize,
        parseFloat(getParameter('foishReproductionRate')) / 100,
        parseFloat(getParameter('foishMutationRate')) / 100,
        (id) => Foish(id)
    )

    for (const foish of school.populate()) {
        qtree.insert(new Point(foish.id, 'foish', foish.position.x, foish.position.y, foish.shape, {
            color: foish.color,
            mass: foish.mass,
            position: foish.position.copy(),
            velocity: foish.velocity.copy(),
            subject: foish
        }))
    }
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
        {'variableName': 'shoakSightRadius', 'sliderName': 'shoaks-perception-radius'},
        {'variableName': 'shoakFov', 'sliderName': 'shoaks-fov'},
        {'variableName': 'shoakResolution', 'sliderName': 'shoaks-resolution'},
    ]
    const currentDisplayPov = getParameter('displayPov')

    document.getElementById('sketch').style.width = (currentDisplayPov ? topDownWidth + povWidth : topDownWidth) + 'px'
    document.getElementById('display-pov').checked = currentDisplayPov

    document.getElementById('debug').checked = debug

    document.getElementById('display-pov').addEventListener('change', (event) => {
        const newWidth = event.target.checked ? topDownWidth + povWidth : topDownWidth

        setParameter('displayPov', event.target.checked)
        resizeCanvas(newWidth, sceneHeight)

        document.getElementById('sketch').style.width = newWidth + 'px'
    })

    document.getElementById('debug').addEventListener('change', (event) => {
        setParameter('debug', event.target.checked)
        document.getElementById('shoaks-population-slider').disabled = event.target.checked
        debug = event.target.checked

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
