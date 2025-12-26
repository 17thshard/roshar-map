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

/**
 * Populates a year object with events.
 * @param {number} year - The year number.
 * @param {number} baseOffset - The base offset for the year.
 * @param {object[]} events - The events for the year.
 * @returns {object} - The populated year object.
 */
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

/**
 * Calculates the distance between two years in the timeline.
 * @param {number} year - The current year.
 * @param {number} lastYear - The previous year.
 * @returns {number} - The calculated distance.
 */
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

/**
 * Main Pinia store for the application.
 */
export const useMainStore = defineStore('main', {
  /**
   * State of the store.
   * @returns {object} - The initial state.
   */
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
    /**
     * Checks if an event is included in navigation based on filters.
     * @param {object} state - The store state.
     * @returns {(event: object) => boolean} - Function to check if event is included.
     */
    isIncludedInNavigation (state) {
      return (event) => {
        return !this.isDisabled(event) && (state.filter.lockedTag === null || (event.tags !== undefined && event.tags.includes(state.filter.lockedTag)))
      }
    },
    /**
     * Checks if an event is disabled by filters.
     * @param {object} state - The store state.
     * @returns {(event: object) => boolean} - Function to check if event is disabled.
     */
    isDisabled (state) {
      return (event) => {
        return state.filter.tags.some(t => event.tags !== undefined && event.tags.includes(t))
      }
    }
  },
  actions: {
    /**
     * Selects an event.
     * @param {object} event - The event to select.
     */
    selectEvent (event) {
      this.activeEvent = event
      window.localStorage.setItem('activeEvent', this.activeEvent.id)
    },
    /**
     * Unselects the current event.
     */
    unselectEvent () {
      this.activeEvent = null
      window.localStorage.setItem('activeEvent', '')
    },
    /**
     * Updates the filter state.
     * @param {object} filter - The new filter state.
     */
    updateFilter (filter) {
      this.filter = filter
    },
    /**
     * Enables a tag filter (removes it from disabled tags).
     * @param {string} tag - The tag to enable.
     */
    enableTag (tag) {
      const index = this.filter.tags.indexOf(tag)

      if (index !== -1) {
        this.filter.tags.splice(index, 1)
      }

      this.disableTagSeparation(tag)
      window.localStorage.setItem('filter', JSON.stringify(this.filter))
    },
    /**
     * Disables a tag filter (adds it to disabled tags).
     * @param {string} tag - The tag to disable.
     */
    disableTag (tag) {
      if (!this.filter.tags.includes(tag)) {
        this.filter.tags.push(tag)
      }

      this.disableTagSeparation(tag)
      window.localStorage.setItem('filter', JSON.stringify(this.filter))
    },
    /**
     * Enables tag separation.
     * @param {string} tag - The tag to separate.
     */
    enableTagSeparation (tag) {
      this.enableTag(tag)

      if (!this.filter.separateTags.includes(tag)) {
        this.filter.separateTags.push(tag)
      }

      this.filter.latestSeparatedTag = tag
      window.localStorage.setItem('filter', JSON.stringify(this.filter))
    },
    /**
     * Disables tag separation.
     * @param {string} tag - The tag to stop separating.
     */
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
    /**
     * Updates the separated tags list.
     * @param {string[]} tags - The list of tags.
     */
    updateSeparateTags (tags) {
      this.filter.separateTags = tags
    },
    /**
     * Toggles a map layer.
     * @param {object} payload - The payload.
     * @param {string} payload.layer - The layer name.
     * @param {boolean} payload.value - The new value.
     */
    toggleLayer ({ layer, value }) {
      this.layersActive[layer] = value
      window.localStorage.setItem('layersActive', JSON.stringify(this.layersActive))
    },
    /**
     * Opens the calendar guide.
     */
    openCalendarGuide () {
      this.calendarGuideOpen = true
    },
    /**
     * Closes the calendar guide.
     */
    closeCalendarGuide () {
      this.calendarGuideOpen = false
    },
    /**
     * Opens the go to date dialog.
     */
    openGoToDate () {
      this.goToDateOpen = true
    },
    /**
     * Closes the go to date dialog.
     */
    closeGoToDate () {
      this.goToDateOpen = false
    },
    /**
     * Opens a specific menu.
     * @param {string} name - The name of the menu.
     */
    openMenu (name) {
      this.openedMenu = name
    },
    /**
     * Closes the currently open menu.
     */
    closeMenu () {
      this.openedMenu = null
    },
    /**
     * Locks a tag.
     * @param {string} tag - The tag to lock.
     */
    lockTag (tag) {
      this.filter.lockedTag = tag
    },
    /**
     * Unlocks the currently locked tag.
     */
    unlockTag () {
      this.filter.lockedTag = null
    },
    /**
     * Sets the text direction and flips the timeline if needed.
     * @param {string} direction - The text direction ('ltr' or 'rtl').
     */
    setTextDirection (direction) {
      this.flipTimeline = direction === 'rtl'
      this.flipDirectionalIcons = direction === 'rtl'
    },
    /**
     * Toggles the measurement tool.
     */
    toggleMeasurement () {
      this.measurementActive = !this.measurementActive
    }
  }
})

