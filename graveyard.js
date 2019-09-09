class Graveyard {
    constructor(sizePerSpecies) {
        this.sizePerSpecies = sizePerSpecies
        this.ground = {}
    }

    getAllCorpses() {
        let allCorpses = []

        for (let species of Object.keys(this.ground)) {
            allCorpses = allCorpses.concat(this.ground[species])
        }

        return allCorpses
    }

    addCorpse(corpse) {
        const corpseSpecies = corpse.species() || 'species'

        if (!this.ground.hasOwnProperty(corpseSpecies)) {
            this.ground[corpseSpecies] = []
        }

        if (this.ground[corpseSpecies].length < this.sizePerSpecies) {
            this.ground[corpseSpecies].push(corpse)

            return
        }

        const currentMinFitnessIndex = this.getIndexMinFitness(corpseSpecies)

        if (corpse.fitness() > this.ground[corpseSpecies][currentMinFitnessIndex].fitness()) {
            this.ground[corpseSpecies][currentMinFitnessIndex] = corpse
        }
    }

    getIndexMinFitness(species) {
        let minFitnessIndex = 0

        for (let i = 1; i < this.ground[species].length; i++) {
            if (this.ground[species][i].fitness() < this.ground[species][minFitnessIndex].fitness()) {
                minFitnessIndex = i
            }
        }

        return minFitnessIndex
    }
}
