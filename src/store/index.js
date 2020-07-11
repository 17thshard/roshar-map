import Vue from 'vue'
import Vuex from 'vuex'

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

const events = [
  {
    date: [-10000],
    name: 'Shattering of Adonalsium',
    tags: ['general'],
    shadesmar: false,
    specialEffect: 'shattering',
    coordinates: {
      x: 512,
      y: 256,
      zoom: 0
    }
  },
  {
    date: [-8000],
    name: 'Human Exodus from Ashyn',
    tags: ['general'],
    shadesmar: false,
    coordinates: {
      x: 290.2,
      y: 260.8
    }
  },
  {
    date: [-3300],
    name: 'The Last Desolation',
    tags: ['general'],
    shadesmar: false,
    coordinates: {
      x: 512,
      y: 256,
      zoom: 0
    }
  },
  {
    date: [-800],
    name: 'The False Desolation',
    tags: ['general'],
    shadesmar: false,
    coordinates: {
      x: 512,
      y: 256,
      zoom: 0
    }
  },
  {
    date: [650],
    name: 'End of the Hierocracy',
    tags: ['general'],
    shadesmar: false,
    coordinates: {
      x: 512,
      y: 256,
      zoom: 0
    }
  },
  {
    date: [975],
    name: 'Scouring of Amia',
    tags: ['general'],
    shadesmar: false,
    coordinates: {
      x: 195.8,
      y: 294.2
    }
  },
  {
    year: 1120,
    date: [1120],
    name: 'Dalinar is born',
    tags: ['dalinar'],
    shadesmar: false,
    coordinates: {
      x: 738.8,
      y: 250.5
    }
  },
  {
    date: [1153],
    name: 'Kaladin is born',
    image: {
      file: 'kaladin.jpg',
      offset: {
        x: '90%',
        y: '0'
      },
      size: '150%'
    },
    tags: ['kaladin'],
    shadesmar: false,
    coordinates: {
      x: 734.7,
      y: 196.8
    }
  },
  {
    date: [1156],
    name: 'Shallan is born',
    tags: ['shallan'],
    shadesmar: false,
    coordinates: {
      x: 627.5,
      y: 256.1
    }
  },
  {
    date: [1163],
    name: 'Return to the Rift. Evi dies.',
    tags: ['dalinar'],
    shadesmar: false,
    coordinates: {
      x: 727,
      y: 305
    }
  },
  {
    date: [1169, 1],
    name: 'Taravangian visits the Nightwatcher',
    tags: ['general'],
    shadesmar: false,
    coordinates: {
      x: 484.5,
      y: 332.4
    }
  },
  {
    date: [1169, 4],
    name: 'Tien dies',
    tags: ['kaladin'],
    shadesmar: false,
    coordinates: {
      x: 704.6,
      y: 208.8
    }
  },
  {
    date: [1169, 10],
    name: 'Lin Davar accused of murder',
    tags: ['general'],
    shadesmar: false,
    coordinates: {
      x: 627.5,
      y: 256.1
    }
  },
  {
    date: [1174],
    name: 'The gang is in Shadesmar',
    tags: ['kaladin', 'shallan'],
    shadesmar: true,
    coordinates: {
      x: 738.8,
      y: 250.5
    }
  },
  {
    date: [1174, 1],
    name: 'Dalinar opens Honor\'s Perpendicularity',
    tags: ['dalinar'],
    perpendicularity: false,
    tieBreaker: 0,
    coordinates: {
      x: 597.5,
      y: 419.3
    }
  },
  {
    date: [1174, 1],
    name: 'Dalinar opens Honor\'s Perpendicularity',
    tags: ['dalinar'],
    perpendicularity: true,
    tieBreaker: 1,
    coordinates: {
      x: 597.5,
      y: 419.3
    }
  },
  {
    date: [1174, 1],
    name: 'Dalinar opens Honor\'s Perpendicularity',
    tags: ['dalinar'],
    perpendicularity: false,
    shadesmar: true,
    tieBreaker: 2,
    coordinates: {
      x: 597.5,
      y: 419.3
    }
  },
  {
    date: [1174, 1],
    name: 'Dalinar opens Honor\'s Perpendicularity',
    tags: ['dalinar'],
    perpendicularity: true,
    shadesmar: true,
    tieBreaker: 3,
    coordinates: {
      x: 597.5,
      y: 419.3
    }
  }
].sort(
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
  }).map((event, index) => ({ ...event, id: index, type: 'event' }))

const locations = {
  4: {
    type: 'location',
    title: 'Kharbranth',
    image: 'kharbranth.jpg'
  },
  22: {
    type: 'location',
    title: 'Kholinar'
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
