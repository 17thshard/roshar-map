import { clamp01 } from '@/utils'

export default class Shadesmar {
  constructor () {
    this.enabled = false
    this.entering = true
    this.progress = 0
  }

  enter () {
    this.entering = true
    this.enabled = true
  }

  leave () {
    this.entering = false
    this.enabled = true
  }

  update (camera, timestamp, delta) {
    if (!this.enabled) {
      return
    }

    if (this.progress <= 1) {
      this.progress = clamp01(this.progress + (this.entering ? 0.0006 : -0.0006) * delta)
    }

    if (!this.entering && this.progress <= 0) {
      this.enabled = false
      this.progress = 0
    }
  }
}
