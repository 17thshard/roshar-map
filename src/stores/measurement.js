import { defineStore } from 'pinia'

export const useMeasurementStore = defineStore('measurement', {
  state: () => ({
    active: false,
    points: []
  }),
  actions: {
    toggle () {
      this.active = !this.active
      if (!this.active) {
        this.clear()
      }
    },
    addPoint (point) {
      this.points.push(point)
    },
    clear () {
      this.points = []
    },
    setPoints (points) {
      this.points = points
    }
  },
  persist: {
    pick: ['active', 'points']
  }
})
