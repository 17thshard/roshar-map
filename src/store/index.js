import Vue from 'vue'
import Vuex from 'vuex'
import baseEvents from '@/store/events.json'
import baseLocations from '@/store/locations.json'
import baseCharacters from '@/store/characters.json'
import baseMisc from '@/store/misc.json'

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

const mappings = {}

mappings.events = events.reduce((acc, event) => ({
  ...acc,
  [event.id]: { type: 'events', ...event }
}), {})

mappings.locations = baseLocations.reduce((acc, location) => ({
  ...acc,
  [location.id]: { type: 'locations', ...location }
}), {})

mappings.characters = baseCharacters.reduce((acc, character) => ({
  ...acc,
  [character.id]: { type: 'characters', ...character }
}), {})

mappings.misc = baseMisc.reduce((acc, entry) => ({
  ...acc,
  [entry.id]: { type: 'misc', ...entry }
}), {})

const locationsByMapId = Object.values(mappings.locations).filter(location => location.mapId !== undefined).reduce((acc, location) => ({
  ...acc,
  [location.mapId]: location
}), {})

const mutations = {
  selectEvent (state, event) {
    state.activeEvent = event
  },
  unselectEvent (state) {
    state.activeEvent = null
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
    locationsByMapId,
    mappings,
    activeEvent: null,
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
