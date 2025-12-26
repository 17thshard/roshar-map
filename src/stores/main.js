import { defineStore } from 'pinia'
import { markRaw } from 'vue'
import baseEvents from '@/stores/events.json'
import baseLocations from '@/stores/locations.json'
import baseCharacters from '@/stores/characters.json'
import baseMisc from '@/stores/misc.json'
import tagCategories from '@/stores/tags.json'
import { compareEvents, inverseLerp } from '@/utils'

const DETAIL_CUTOFF_YEAR = 1173
const TIMELINE_YEAR_DISTANCE = 50
const TIMELINE_TIE_DISTANCE = 30

const events = baseEvents.sort(compareEvents).map((event, index) => ({
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

export const useMainStore = defineStore('main', {
  state: () => ({
    events: markRaw(events),
    years: markRaw(years),
    locationsByMapId: markRaw(locationsByMapId),
    mappings: markRaw(mappings),
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
      oathgates: false
    },
    calendarGuideOpen: false,
    goToDateOpen: false,
    openedMenu: null,
    flipTimeline: false,
    flipDirectionalIcons: false,
    measurementActive: false
  }),
  getters: {
    isIncludedInNavigation (state) {
      return (event) => {
        return !this.isDisabled(event) && (state.filter.lockedTag === null || (event.tags !== undefined && event.tags.includes(state.filter.lockedTag)))
      }
    },
    isDisabled (state) {
      return (event) => {
        return state.filter.tags.some(t => event.tags !== undefined && event.tags.includes(t))
      }
    }
  },
  actions: {
    selectEvent (event) {
      this.activeEvent = event
      window.localStorage.setItem('activeEvent', this.activeEvent.id)
    },
    unselectEvent () {
      this.activeEvent = null
      window.localStorage.setItem('activeEvent', '')
    },
    updateFilter (filter) {
      this.filter = filter
    },
    enableTag (tag) {
      const index = this.filter.tags.indexOf(tag)

      if (index !== -1) {
        this.filter.tags.splice(index, 1)
      }

      this.disableTagSeparation(tag)
      window.localStorage.setItem('filter', JSON.stringify(this.filter))
    },
    disableTag (tag) {
      if (!this.filter.tags.includes(tag)) {
        this.filter.tags.push(tag)
      }

      this.disableTagSeparation(tag)
      window.localStorage.setItem('filter', JSON.stringify(this.filter))
    },
    enableTagSeparation (tag) {
      this.enableTag(tag)

      if (!this.filter.separateTags.includes(tag)) {
        this.filter.separateTags.push(tag)
      }

      this.filter.latestSeparatedTag = tag
      window.localStorage.setItem('filter', JSON.stringify(this.filter))
    },
    disableTagSeparation (tag) {
      const index = this.filter.separateTags.indexOf(tag)

      if (index !== -1) {
        this.filter.separateTags.splice(index, 1)
      }

      this.filter.latestSeparatedTag = null

      if (this.filter.lockedTag === tag) {
        this.unlockTag()
      }

      window.localStorage.setItem('filter', JSON.stringify(this.filter))
    },
    updateSeparateTags (tags) {
      this.filter.separateTags = tags
    },
    toggleLayer ({ layer, value }) {
      this.layersActive[layer] = value
      window.localStorage.setItem('layersActive', JSON.stringify(this.layersActive))
    },
    openCalendarGuide () {
      this.calendarGuideOpen = true
    },
    closeCalendarGuide () {
      this.calendarGuideOpen = false
    },
    openGoToDate () {
      this.goToDateOpen = true
    },
    closeGoToDate () {
      this.goToDateOpen = false
    },
    openMenu (name) {
      this.openedMenu = name
    },
    closeMenu () {
      this.openedMenu = null
    },
    lockTag (tag) {
      this.filter.lockedTag = tag
    },
    unlockTag () {
      this.filter.lockedTag = null
    },
    setTextDirection (direction) {
      this.flipTimeline = direction === 'rtl'
      this.flipDirectionalIcons = direction === 'rtl'
    },
    toggleMeasurement () {
      this.measurementActive = !this.measurementActive
    }
  }
})

