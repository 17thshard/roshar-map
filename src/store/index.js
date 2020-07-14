import Vue from 'vue'
import Vuex from 'vuex'
import baseEvents from '@/store/events.json'

Vue.use(Vuex)

function calculateNextOffset (event, lastEvent) {
  if (event.date[0] - lastEvent.date[0] >= 100) {
    return 500
  }

  if (event.date[0] - lastEvent.date[0] >= 5) {
    return 200
  }

  if (event.date[0] - lastEvent.date[0] >= 1) {
    return (event.date[0] - lastEvent.date[0]) * 60
  }

  return 50
}

const events = baseEvents.sort(
  (a, b) => {
    let j = 0

    for (let i = 0; i < a.date.length; i++) {
      if (j === b.date.length - 1 && b.date[j] !== a.date[i]) {
        return a.date[i] - b.date[j]
      }

      if (a.date[i] !== b.date[j]) {
        return a.date[i] - b.date[j]
      }

      j += 1
    }

    if (j !== b.date.length) {
      return -1
    }

    if (a.tieBreaker !== undefined && b.tieBreaker !== undefined) {
      return a.tieBreaker - b.tieBreaker
    } else if (a.tieBreaker !== undefined) {
      return 1
    }

    return -1
  }).map((event, index) => ({ ...event, index }))

const locations = {
  4: {
    type: 'location',
    id: 'kharbranth',
    image: 'kharbranth.jpg'
  },
  22: {
    type: 'location',
    id: 'kholinar'
  }
}

let lastEvent = null
let runningOffset = 0
events.forEach((event) => {
  if (lastEvent !== null) {
    runningOffset += calculateNextOffset(event, lastEvent)
  }

  // eslint-disable-next-line no-param-reassign
  event.offset = runningOffset

  lastEvent = event
})

const mutations = {
  selectEvent (state, event) {
    state.activeEvent = event
    mutations.closeDetails(state)
  },
  selectLocation (state, location) {
    state.activeLocation = location
    state.activeEvent = null

    if (location !== null && state.locations[location] !== undefined) {
      mutations.showDetails(state, state.locations[location])
    }
  },
  showDetails (state, details) {
    state.details = details
  },
  closeDetails (state) {
    if (state.activeLocation !== null) {
      state.activeLocation = null
    }
    state.details = null
  },
  enableTag (state, tag) {
    const index = state.filter.tags.indexOf(tag)

    if (index !== -1) {
      state.filter.tags.splice(index, 1)
    }

    mutations.disableTagSeparation(state, tag)
  },
  disableTag (state, tag) {
    if (!state.filter.tags.includes(tag)) {
      state.filter.tags.push(tag)
    }

    mutations.disableTagSeparation(state, tag)
  },
  enableTagSeparation (state, tag) {
    mutations.enableTag(state, tag)

    if (!state.filter.separateTags.includes(tag)) {
      state.filter.separateTags.push(tag)
    }
  },
  disableTagSeparation (state, tag) {
    const index = state.filter.separateTags.indexOf(tag)

    if (index !== -1) {
      state.filter.separateTags.splice(index, 1)
    }
  },
  updateSeparateTags (state, tags) {
    state.filter.separateTags = tags
  }
}

export default new Vuex.Store({
  state: {
    events,
    locations,
    activeEvent: null,
    activeLocation: null,
    details: null,
    filter: {
      tags: [],
      separateTags: []
    }
  },
  mutations,
  getters: {
    isDisabled (state) {
      return (event) => {
        return state.filter.tags.some(t => event.tags.includes(t))
      }
    }
  }
})
