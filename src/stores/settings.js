import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    calendarGuideOpen: false,
    goToDateOpen: false,
    openedMenu: null,
    flipTimeline: false,
    flipDirectionalIcons: false
  }),
  actions: {
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
    setTextDirection (direction) {
      this.flipTimeline = direction === 'rtl'
      this.flipDirectionalIcons = direction === 'rtl'
    }
  },
  persist: {
    pick: ['flipTimeline', 'flipDirectionalIcons']
  }
})

