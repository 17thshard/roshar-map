import Vue from 'vue'
import Vuex from 'vuex'
import baseEvents from '@/store/events.json'
import baseLocations from '@/store/locations.json'
import baseCharacters from '@/store/characters.json'
import baseMisc from '@/store/misc.json'

Vue.use(Vuex)

const TIMELINE_YEAR_DISTANCE = 100
const TIMELINE_TIE_DISTANCE = 30

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
  }).map((event, index) => ({
  ...event,
  month: (event.date[1] ?? 1) - 1,
  index
}))

const groupedEvents = {}

events.forEach((event) => {
  if (groupedEvents[event.date[0]] === undefined) {
    groupedEvents[event.date[0]] = []
  }

  groupedEvents[event.date[0]].push(event)
})

const years = []

let lastYear = null
let runningOffset = 0
Object.keys(groupedEvents).sort((a, b) => Number.parseInt(a) - Number.parseInt(b)).forEach((y) => {
  const year = Number.parseInt(y)
  runningOffset += lastYear !== null ? calculateYearDistance(year, lastYear.year) : 0
  lastYear = populateYear(year, runningOffset, groupedEvents[y])
  years.push(lastYear)
  runningOffset += lastYear.size
})

function populateYear (year, baseOffset, events) {
  let localOffset = 0

  const eventsPerMonth = {}
  events.forEach((event) => {
    if (eventsPerMonth[event.month] === undefined) {
      eventsPerMonth[event.month] = {}
    }

    const week = (event.date[2] ?? 1) - 1
    if (eventsPerMonth[event.month][week] === undefined) {
      eventsPerMonth[event.month][week] = []
    }

    eventsPerMonth[event.month][week].push(event)
  })

  const months = []

  new Array(10).fill(undefined)
    .map((_, i) => i)
    .forEach((month) => {
      months.push({
        month,
        offset: localOffset,
        display: year >= 1173
      })

      const eventGroup = eventsPerMonth[month]
      if (eventGroup !== undefined) {
        const weeks = Object.keys(eventGroup)
        let weekSize = 50
        let emptyWeekSize = 5

        if (weeks.length === 1) {
          const singleWeekEvents = eventGroup[weeks[0]]

          // If some event in the single week actually is precise to it, put it further apart
          if (singleWeekEvents.some(event => event.date[2] !== undefined)) {
            weekSize = 5
          } else {
            weekSize = 0
            emptyWeekSize = 0
          }
        }

        new Array(10).fill(undefined)
          .map((_, i) => i)
          .forEach((week) => {
            const weekEvents = eventGroup[week]

            if (weekEvents !== undefined) {
              eventGroup[week].forEach((event) => {
                // eslint-disable-next-line no-param-reassign
                event.offset = baseOffset + localOffset

                localOffset += weekEvents.length > 1 ? TIMELINE_TIE_DISTANCE : 0
              })
            }

            localOffset += weekEvents !== undefined ? weekSize : emptyWeekSize
          })
      }

      localOffset += eventGroup !== undefined ? 60 : 40
    })

  return { year, offset: baseOffset, size: (events.length > 1 ? localOffset : 50) + 10, singleEvent: events.length === 1, months }
}

function calculateYearDistance (year, lastYear) {
  if (year - lastYear >= 100) {
    return 5 * TIMELINE_YEAR_DISTANCE
  }

  if (year - lastYear >= 5) {
    return 2 * TIMELINE_YEAR_DISTANCE
  }

  if (year - lastYear > 1) {
    return (year - lastYear) * TIMELINE_YEAR_DISTANCE
  }

  return 0
}

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
    years,
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
