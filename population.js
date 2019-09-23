class Population {
    constructor(size, reproductionRate, mutationRate, generateIndividual) {
        this.size = size
        this.reproductionRate = reproductionRate
        this.mutationRate = mutationRate
        this.generateIndividual = generateIndividual

        this.individuals = []
        this.graveyard = new Graveyard(5)
        this.allTimeBest = 0
        this.aliveBest = null
        this.generation = 1
        this.nextId = 1
    }

    populate() {
        const created = []

        for (let i = this.individuals.length; i < this.size; i++) {
            const newIndividual = this.generateIndividual(this.nextId)
            this.nextId++

            this.individuals.push(newIndividual)
            created.push(newIndividual)
        }

        return created
    }

    population() {
        return this.individuals
    }

    isExtinct() {
        return 0 === this.individuals.length
    }

    nextGeneration() {
        if (!this.isExtinct()) {
            return
        }

        const selected = this.select(this.size, this.graveyard.getAllCorpses())

        this.generation++
        return this.reproduceAsexually(selected)
    }

    age() {
        this.aliveBest = null

        for (const individual of this.individuals) {
            individual.age()

            if (null === this.aliveBest || individual.score > this.aliveBest.score) {
                this.aliveBest =individual
            }
        }
    }

    hunger() {
        const removed = []

        for (let i = this.individuals.length - 1; i >=0; i--) {
            this.individuals[i].hunger()

            if (this.individuals[i].mass <= 0) {
                removed.push(this.individuals[i])
                this.remove(this.individuals[i])
            }
        }

        return removed
    }

    remove(individual) {
        const index = this.individuals.indexOf(individual)

        if (index >= 0) {
            this.graveyard.addCorpse(this.individuals.splice(index, 1)[0])
        }
    }

    reproduce() {
        let created = []

        if (this.individuals.length < this.size) {
            for (let i = 0; i < this.size - this.individuals.length; i++) {
                if (Math.random() <= this.reproductionRate) {
                    const selected = this.select(1, this.individuals)

                    created = created.concat(this.reproduceAsexually(selected))
                }
            }
        }

        return created
    }

    reproduceAsexually(individuals) {
        const created = []

        for (const individual of individuals) {
            const child = individual.reproduce(this.nextId)
            child.mutate(this.mutationRate)
            this.nextId++

            this.individuals.push(child)
            created.push(child)
        }

        return created
    }

    select(number, group) {
        const selectedList = []
        let sumFitness = 0
        let minFitness = Infinity
        let maxFitness = 0

        for (let individual of group) {
            const fitness  = individual.fitness()

            sumFitness += fitness

            if (fitness < minFitness) minFitness = fitness
            if (fitness > maxFitness) maxFitness = fitness
        }

        if (debug) {
            console.log('Selecting '+number+' individuals out of '+ group.length + ' (max fitness = '+Math.pow(maxFitness, 1/4).toFixed(2)+', min fitness = '+Math.pow(minFitness, 1/4).toFixed(2)+')')
        }

        for (let i = 0; i < number; i++) {
            const random = Math.random()
            let offset = 0
            let selected = null

            for (let j = 0; j < group.length && null === selected; j++) {
                offset += group[j].fitness() / sumFitness

                if (random <= offset) {
                    selected = group[j]
                }
            }

            // If all individuals of the population have a fitness equal to 0 none will be selected
            if (!selected) {
                selected = group[0]
            }

            if (debug) {
                console.log('Selected fitness '+selected.score.toFixed(2))
            }

            selectedList.push(selected)
        }

        return selectedList
    }
}
