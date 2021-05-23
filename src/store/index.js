import Vue from 'vue'
import Vuex from 'vuex'
import baseEvents from '@/store/events.json'
import baseLocations from '@/store/locations.json'
import baseCharacters from '@/store/characters.json'
import baseMisc from '@/store/misc.json'
import tagCategories from '@/store/tags.json'
import { inverseLerp } from '@/utils'

Vue.use(Vuex)

const DETAIL_CUTOFF_YEAR = 1173
const TIMELINE_YEAR_DISTANCE = 50
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
const ANCHOR_YEARS = [-20000, -10000, -5000, -1000, 1, 1000, 1120, 1130, 1140, 1150, 1160, 1165]
const eventYears = Object.keys(groupedEvents).map(k => Number.parseInt(k)).sort((a, b) => a - b)

let runningOffset = 0
ANCHOR_YEARS.forEach((year, index) => {
  if (groupedEvents[year] !== undefined) {
    const yearData = populateYear(year, runningOffset, groupedEvents[year])
    years.push(yearData)
    runningOffset += yearData.size
  } else {
    years.push({ year, display: true, offset: runningOffset, size: 50, singleEvent: true, months: [] })
    runningOffset += 50
  }

  const nextYear = ANCHOR_YEARS[index + 1]
  const distance = nextYear !== undefined ? calculateYearDistance(nextYear, year) : 0
  let localOffset = 0

  eventYears.filter(y => nextYear !== undefined && y > year && y < nextYear).forEach((eventYear) => {
    const yearData = populateYear(
      eventYear,
      runningOffset + localOffset + Math.trunc(distance * inverseLerp(year, nextYear, eventYear)),
      groupedEvents[eventYear]
    )
    yearData.display = false

    years.push(yearData)

    localOffset += yearData.size
  })

  runningOffset += distance + localOffset
})

let lastYear = { year: ANCHOR_YEARS[ANCHOR_YEARS.length - 1] }
eventYears.filter(y => y > lastYear.year).forEach((year) => {
  runningOffset += calculateYearDistance(year, lastYear.year)
  lastYear = populateYear(year, runningOffset, groupedEvents[year])

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
        display: year >= DETAIL_CUTOFF_YEAR
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
                event.offset = baseOffset + localOffset

                localOffset += weekEvents.length > 1 ? TIMELINE_TIE_DISTANCE : 0
              })
            }

            localOffset += weekEvents !== undefined ? weekSize : emptyWeekSize
          })
      }

      localOffset += eventGroup !== undefined ? 60 : (year >= DETAIL_CUTOFF_YEAR ? 60 : 5)
    })

  return {
    year,
    display: true,
    offset: baseOffset,
    size: (events.length > 1 ? localOffset : year > ANCHOR_YEARS[ANCHOR_YEARS.length - 1] ? 50 : 30) + 10,
    singleEvent: events.length === 1,
    months
  }
}

function calculateYearDistance (year, lastYear) {
  if (year - lastYear >= 100) {
    return 8 * TIMELINE_YEAR_DISTANCE
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

mappings.events = events.reduce((acc, event) => {
  acc[event.id] = { type: 'events', ...event }

  return acc
}, {})

mappings.locations = baseLocations.reduce((acc, location) => {
  acc[location.id] = { type: 'locations', ...location }

  return acc
}, {})

mappings.characters = baseCharacters.reduce((acc, character) => {
  acc[character.id] = { type: 'characters', ...character }

  return acc
}, {})

mappings.misc = baseMisc.reduce((acc, entry) => {
  acc[entry.id] = { type: 'misc', ...entry }

  return acc
}, {})

mappings.tags = tagCategories.reduce((acc, category) => {
  category.tags.forEach((tag) => {
    acc[tag.id] = tag
  })

  return acc
}, {})

const locationsByMapId = Object.values(mappings.locations).filter(location => location.mapId !== undefined).reduce((acc, location) => {
  acc[location.mapId] = location

  return acc
}, {})

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

    state.filter.latestSeparatedTag = tag
  },
  disableTagSeparation (state, tag) {
    const index = state.filter.separateTags.indexOf(tag)

    if (index !== -1) {
      state.filter.separateTags.splice(index, 1)
    }

    state.filter.latestSeparatedTag = null

    if (state.filter.lockedTag === tag) {
      mutations.unlockTag(state)
    }
  },
  updateSeparateTags (state, tags) {
    state.filter.separateTags = tags
  },
  toggleLayer (state, { layer, value }) {
    state.layersActive[layer] = value
  },
  openCalendarGuide (state) {
    state.calendarGuideOpen = true
  },
  closeCalendarGuide (state) {
    state.calendarGuideOpen = false
  },
  openGoToDate (state) {
    state.goToDateOpen = true
  },
  closeGoToDate (state) {
    state.goToDateOpen = false
  },
  openSettings (state) {
    state.settingsOpen = true
  },
  closeSettings (state) {
    state.settingsOpen = false
  },
  openInfo (state) {
    state.infoOpen = true
  },
  closeInfo (state) {
    state.infoOpen = false
  },
  lockTag (state, tag) {
    state.filter.lockedTag = tag
  },
  unlockTag (state) {
    state.filter.lockedTag = null
  },
  setTextDirection (state, direction) {
    state.flipTimeline = direction === 'rtl'
    state.flipDirectionalIcons = direction === 'rtl'
    state.scrollbarOptions = {
      vuescroll: { wheelScrollDuration: 400 },
      scrollPanel: { verticalNativeBarPos: direction === 'ltr' ? 'right' : 'left' },
      bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#482d00', opacity: 0.5, size: '0.5rem' },
      rail: { size: '0.5rem', gutterOfSide: '0' }
    }
  }
}

const getters = {
  isIncludedInNavigation (state) {
    return (event) => {
      return !getters.isDisabled(state)(event) && (state.filter.lockedTag === null || (event.tags !== undefined && event.tags.includes(state.filter.lockedTag)))
    }
  },
  isDisabled (state) {
    return (event) => {
      return state.filter.tags.some(t => event.tags !== undefined && event.tags.includes(t))
    }
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
      separateTags: [],
      latestSeparatedTag: null,
      lockedTag: null
    },
    layersActive: {
      shadesmar: false,
      graticule: false,
      silverKingdoms: false,
      oathgates: false,
      factions: false
    },
    calendarGuideOpen: false,
    goToDateOpen: false,
    settingsOpen: false,
    infoOpen: false,
    flipTimeline: false,
    flipDirectionalIcons: false,
    scrollbarOptions: {
      vuescroll: { wheelScrollDuration: 400 },
      scrollPanel: { verticalNativeBarPos: 'right' },
      bar: { onlyShowBarOnScroll: false, keepShow: true, background: '#482d00', opacity: 0.5, size: '0.5rem' },
      rail: { size: '0.5rem', gutterOfSide: '0' }
    }
  },
  mutations,
  getters
})
