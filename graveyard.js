class Graveyard {
    constructor(sizePerSpecies) {
        this.sizePerSpecies = sizePerSpecies
        this.grave = {}
    }

    getAllCorpses() {
        let allCorpses = []

        for (const species of Object.keys(this.grave)) {
            allCorpses = allCorpses.concat(this.grave[species])
        }

        return allCorpses
    }

    addCorpse(corpse) {
        const corpseSpecies = corpse.species() || 'species'

        if (!this.grave.hasOwnProperty(corpseSpecies)) {
            this.grave[corpseSpecies] = []
        }

        if (this.grave[corpseSpecies].length < this.sizePerSpecies) {
            this.grave[corpseSpecies].push(corpse)

            return
        }

        const currentMinFitnessIndex = this.getIndexMinFitness(corpseSpecies)

        if (corpse.score > this.grave[corpseSpecies][currentMinFitnessIndex].score) {
            this.grave[corpseSpecies][currentMinFitnessIndex] = corpse
        }
    }

    getIndexMinFitness(species) {
        let minFitnessIndex = 0

        for (let i = 1; i < this.grave[species].length; i++) {
            if (this.grave[species][i].score < this.grave[species][minFitnessIndex].score) {
                minFitnessIndex = i
            }
        }

        return minFitnessIndex
    }
}
