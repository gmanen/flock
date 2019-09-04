class Population {
    constructor(size, reproductionRate, mutationRate, generateIndividual) {
        this.size = size
        this.reproductionRate = reproductionRate
        this.mutationRate = mutationRate
        this.generateIndividual = generateIndividual

        this.individuals = []
        this.graveyard = []
        this.currentBest = 0
        this.allTimeBest = 0
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

        this.select(this.size, this.graveyard)

        this.graveyard = []
        this.generation++
        this.currentBest = 0
    }

    hunger() {
        for (let i = this.individuals.length - 1; i >=0; i--) {
            this.individuals[i].hunger()

            if (this.individuals[i].mass <= 0) {
                this.graveyard.push(this.individuals.splice(i, 1)[0])
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

        for (let individual of group) {
            sumFitness += individual.fitness()
        }

        for (let i = 0; i < number; i++) {
            let offset = 0
            let random = Math.random()
            let selected = null

            for (let j = 0; j < group.length && null === selected; j++) {
                offset += group[j].fitness() / sumFitness

                if (random <= offset) {
                    selected = group[j]
                }
            }

            let child = selected.reproduce()
            child.mutate(this.mutationRate)

            this.individuals.push(child)
        }
    }
}
