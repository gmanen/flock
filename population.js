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
    }

    populate() {
        for (let i = this.individuals.length; i < this.size; i++) {
            this.individuals.push(this.generateIndividual())
        }
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

        this.select(this.size, this.graveyard.getAllCorpses())

        this.generation++
    }

    hunger() {
        this.aliveBest = null

        for (let i = this.individuals.length - 1; i >=0; i--) {
            this.individuals[i].hunger()

            if (this.individuals[i].mass <= 0) {
                this.graveyard.addCorpse(this.individuals.splice(i, 1)[0])
            } else if (null === this.aliveBest || this.individuals[i].score > this.aliveBest.score) {
                this.aliveBest = this.individuals[i]
            }
        }
    }

    reproduce() {
        if (this.individuals.length < this.size) {
            for (let i = 0; i < this.size - this.individuals.length; i++) {
                if (Math.random() <= this.reproductionRate) {
                    this.select(1, this.individuals)
                }
            }
        }
    }

    select(number, group) {
        let sumFitness = 0
        let minFitness = Infinity
        let maxFitness = 0

        for (let individual of group) {
            const fitness  = individual.fitness()

            sumFitness += fitness

            if (fitness < minFitness) minFitness = fitness
            if (fitness > maxFitness) maxFitness = fitness
        }

        if (getParameter('debug')) {
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

            if (getParameter('debug')) {
                console.log('Selected fitness '+selected.score.toFixed(2))
            }

            const child = selected.reproduce()
            child.mutate(this.mutationRate)

            this.individuals.push(child)
        }
    }
}
