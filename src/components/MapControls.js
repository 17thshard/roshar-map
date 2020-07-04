import { Euler, EventDispatcher, MOUSE, Plane, Ray, Raycaster, TOUCH, Vector2, Vector3 } from 'three'
import Hammer from 'hammerjs'
import { lerp, smootherstep } from '@/utils'

const MapControls = function (object, domElement) {
  this.object = object
  this.domElement = domElement

  // Set to false to disable this control
  this.enabled = true

  // How far you can dolly in and out ( PerspectiveCamera only )
  this.minZoomAngle = 15
  this.maxZoomAngle = 6

  // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
  // Set to false to disable zooming
  this.enableZoom = true
  this.zoomSpeed = 1.0

  // Set to false to disable panning
  this.enablePan = true

  // Mouse buttons
  this.mouseButtons = { LEFT: MOUSE.PAN, MIDDLE: MOUSE.DOLLY }

  // Touch fingers
  this.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_PAN }

  // for reset
  this.position0 = this.object.position.clone()
  this.zoom0 = this.object.zoom

  this.saveState = function () {
    scope.position0.copy(scope.object.position)
    scope.zoom0 = scope.object.zoom
  }

  this.reset = function () {
    scope.object.position.copy(scope.position0)
    scope.object.zoom = scope.zoom0

    scope.object.updateProjectionMatrix()
    scope.dispatchEvent(changeEvent)

    scope.update()

    state = STATE.NONE
  }

  const plane = new Plane(new Vector3(0, 0, 1))

  // this method is exposed, but perhaps it would be better if we can make it private...
  this.update = (function () {
    const position = new Vector3()

    return function update () {
      calculateIntersections(1e3, scope.maxZoomAngle)
      const tmpA = Math.abs(highIntersection.y - lowIntersection.y) / 512
      const tmpB = Math.max(Math.abs(highIntersection.x), Math.abs(lowIntersection.x)) / 1024 * 2
      maxZoomHeight = 1e3 / Math.max(tmpA, tmpB)
      minZoomHeight = maxZoomHeight / 3.5

      position.copy(scope.object.position)

      if (transitionProgress !== null) {
        updateTargetPosition()

        startPosition.z = lerp(maxZoomHeight, minZoomHeight, transitionStartZoom)

        transitionProgress += 0.02

        position.set(
          lerp(startPosition.x, targetPosition.x, smootherstep(transitionProgress)),
          lerp(startPosition.y, targetPosition.y, smootherstep(transitionProgress)),
          lerp(startPosition.z, targetPosition.z, smootherstep(transitionProgress))
        )

        zoom = Math.max(0, Math.min((position.z - maxZoomHeight) / (minZoomHeight - maxZoomHeight), 1))

        if (transitionProgress > 1) {
          transitionProgress = null
        }
      } else {
        zoom = lerp(zoom, targetZoom, 0.1)
        position.z = lerp(maxZoomHeight, minZoomHeight, zoom)
      }

      const angle = lerp(scope.maxZoomAngle, scope.minZoomAngle, zoom)

      if (panning && transitionProgress === null) {
        if (panUpdated) {
          scope.object.position.copy(panReference)
        }

        panEnd.copy(rayCast(panPos.x, panPos.y))

        if (!panUpdated) {
          panStart.copy(panEnd)
          panTarget.copy(position)
          panReference.copy(scope.object.position)
          panUpdated = true
        } else {
          panTarget.add(panDelta.subVectors(panStart, panEnd))
          panStart.copy(panEnd)

          position.x = lerp(position.x, panTarget.x, 0.5)
          panTarget.x = lerp(position.x, panTarget.x, 0.95)
          position.y = lerp(position.y, panTarget.y, 0.5)
          panTarget.y = lerp(position.y, panTarget.y, 0.95)
        }
      }

      clampPosition(position, angle)
      scope.object.position.copy(position)
      scope.object.setRotationFromEuler(new Euler(degToRad * angle, 0, 0, 'XYZ'))

      return false
    }
  }())

  this.dispose = function () {
    scope.domElement.removeEventListener('mousedown', onMouseDown, false)
    scope.domElement.removeEventListener('wheel', onMouseWheel, false)

    scope.domElement.removeEventListener('touchstart', onTouchStart, false)
    scope.domElement.removeEventListener('touchend', onTouchEnd, false)
    scope.domElement.removeEventListener('touchmove', onTouchMove, false)

    scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove, false)
    scope.domElement.ownerDocument.removeEventListener('mouseup', onMouseUp, false)
  }

  function updateTargetPosition () {
    targetPosition.copy(intendedTarget)
    targetPosition.z = lerp(maxZoomHeight, minZoomHeight, targetZoom)

    const targetAngle = lerp(scope.maxZoomAngle, scope.minZoomAngle, targetZoom)
    const vector = new Vector3(0, 0, -1).applyEuler(new Euler(targetAngle, 0, 0, 'XYZ'))
    targetPosition.y += vector.y * targetPosition.z

    clampPosition(targetPosition, targetAngle)
  }

  this.transitionTo = function (target, newZoom) {
    transitionStartZoom = zoom
    targetZoom = newZoom
    intendedTarget.copy(target)

    updateTargetPosition()

    startPosition.copy(scope.object.position)

    transitionProgress = 0
  }

  //
  // internals
  //

  const scope = this

  const changeEvent = { type: 'change' }
  const startEvent = { type: 'start' }
  const endEvent = { type: 'end' }

  const STATE = {
    NONE: -1,
    DOLLY: 0,
    PAN: 1,
    TOUCH_PAN: 2,
    TOUCH_DOLLY: 3
  }

  let state = STATE.NONE

  let zoom = 0.01
  let targetZoom = 0.01

  let minZoomHeight = 60
  let maxZoomHeight = 300

  let transitionProgress = null
  let transitionStartZoom = 0

  const startPosition = new Vector3()
  const targetPosition = new Vector3()
  const intendedTarget = new Vector3()

  const panPos = new Vector2()
  const panReference = new Vector3()
  const panStart = new Vector3()
  const panEnd = new Vector3()
  const panDelta = new Vector3()
  const panTarget = new Vector3()
  let panning = false
  let panUpdated = false

  const clickStart = new Vector2()
  let clickTouches = 0
  let wasMultiTouch = false

  const dollyStart = new Vector2()
  const dollyEnd = new Vector2()
  const dollyDelta = new Vector2()

  const degToRad = Math.PI / 180

  const corner = new Vector3()
  const xAxis = new Vector3(1, 0, 0)
  const ray = new Ray()

  const rayStart = new Vector3(0, 0, 1e3)

  const highIntersection = new Vector3()
  const lowIntersection = new Vector3()

  function calculateIntersections (height, angle) {
    rayStart.set(0, 0, height)

    const frustumHeight = Math.tan(degToRad * scope.object.fov * 0.5)
    corner.set(frustumHeight * scope.object.aspect, frustumHeight, -1).normalize().applyAxisAngle(xAxis, degToRad * angle)
    ray.set(rayStart, corner)
    ray.intersectPlane(plane, highIntersection)

    corner.set(-frustumHeight * scope.object.aspect, -frustumHeight, -1).normalize().applyAxisAngle(xAxis, degToRad * angle)
    ray.set(rayStart, corner)
    ray.intersectPlane(plane, lowIntersection)
  }

  function clampPosition (position, angle) {
    calculateIntersections(position.z, angle)
    const maxX = 1024 / 2 - Math.max(Math.abs(highIntersection.x), Math.abs(lowIntersection.x))
    const minX = -maxX // X is symmetrical
    const maxY = 512 / 2 - Math.max(Math.abs(highIntersection.y), Math.abs(lowIntersection.y))
    const minY = -512 / 2 + Math.min(Math.abs(highIntersection.y), Math.abs(lowIntersection.y))

    position.set(Math.max(minX, Math.min(position.x, maxX)), Math.max(minY, Math.min(position.y, maxY)), position.z)
  }

  function getZoomScale () {
    return Math.pow(0.95, scope.zoomSpeed)
  }

  const rayCaster = new Raycaster()
  const rayCastClick = new Vector2()
  const rayCastResult = new Vector3()

  function rayCast (x, y) {
    const { clientWidth, clientHeight } = scope.domElement
    rayCastClick.set(x / clientWidth * 2 - 1, 1 - y / clientHeight * 2)
    rayCaster.setFromCamera(rayCastClick, scope.object)

    rayCaster.ray.origin.copy(scope.object.position)

    return rayCaster.ray.intersectPlane(plane, rayCastResult)
  }

  function dollyOut (dollyScale) {
    targetZoom = Math.max(0, Math.min(targetZoom - (1 / 30) * dollyScale, 1))
  }

  function dollyIn (dollyScale) {
    targetZoom = Math.max(0, Math.min(targetZoom + (1 / 30) * dollyScale, 1))
  }

  //
  // event callbacks - update the object state
  //

  function handleMouseDownDolly (event) {
    dollyStart.set(event.clientX, event.clientY)
  }

  function handleMouseDownPan (event) {
    panPos.set(event.clientX, event.clientY)
    panUpdated = false
    panning = true
  }

  function handleMouseMoveDolly (event) {
    dollyEnd.set(event.clientX, event.clientY)

    dollyDelta.subVectors(dollyEnd, dollyStart)

    if (dollyDelta.y > 0) {
      dollyOut(getZoomScale())
    } else if (dollyDelta.y < 0) {
      dollyIn(getZoomScale())
    }

    dollyStart.copy(dollyEnd)

    scope.update()
  }

  function handleMouseMovePan (event) {
    panPos.set(event.clientX, event.clientY)
  }

  function handleMouseUp (event) {
    if (event.button === 0) {
      panning = false
    }

    if (event.button !== 0 || event.clientX !== clickStart.x || event.clientY !== clickStart.y) {
      return
    }

    const result = rayCast(clickStart.x, clickStart.y)
    if (result !== null) {
      scope.dispatchEvent({ type: 'click', position: result })
    }
  }

  function handleMouseWheel (event) {
    if (event.deltaY < 0) {
      dollyIn(getZoomScale())
    } else if (event.deltaY > 0) {
      dollyOut(getZoomScale())
    }

    scope.update()
  }

  function handleTouchStartPan (event) {
    if (event.touches.length !== 1) {
      return
    }

    clickStart.set(event.touches[0].clientX, event.touches[0].clientY)
    panPos.copy(clickStart)
    panUpdated = false
    panning = true
  }

  function handleTouchMovePan (event) {
    if (event.touches.length !== 1) {
      return
    }

    panPos.set(event.touches[0].clientX, event.touches[0].clientY)
  }

  function handleTouchEnd (event) {
    panning = false

    if (clickTouches > 1) {
      wasMultiTouch = true
    }

    clickTouches -= 1

    if (clickTouches > 0) {
      return
    }

    if (wasMultiTouch) {
      wasMultiTouch = false
      return
    }

    if (event.changedTouches[0].clientX === clickStart.x || event.changedTouches[0].clientY === clickStart.y) {
      const result = rayCast(clickStart.x, clickStart.y)
      if (result !== null) {
        scope.dispatchEvent({ type: 'click', position: result })
      }
    }
  }

  //
  // event handlers - FSM: listen for events and reset state
  //

  function onMouseDown (event) {
    if (scope.enabled === false) {
      return
    }

    // Prevent the browser from scrolling.
    event.preventDefault()

    // Manually set the focus since calling preventDefault above
    // prevents the browser from setting it automatically.

    scope.domElement.focus ? scope.domElement.focus() : window.focus()

    let mouseAction
    switch (event.button) {
      case 0:
        mouseAction = scope.mouseButtons.LEFT
        clickStart.set(event.clientX, event.clientY)
        break
      case 1:
        mouseAction = scope.mouseButtons.MIDDLE
        break
      case 2:
        mouseAction = scope.mouseButtons.RIGHT
        break
      default:
        mouseAction = -1
    }

    switch (mouseAction) {
      case MOUSE.DOLLY:
        if (scope.enableZoom === false) {
          return
        }

        handleMouseDownDolly(event)

        state = STATE.DOLLY
        break
      case MOUSE.PAN:
        if (scope.enablePan === false) {
          return
        }

        handleMouseDownPan(event)

        state = STATE.PAN

        break
      default:
        state = STATE.NONE
    }

    if (state !== STATE.NONE) {
      scope.domElement.ownerDocument.addEventListener('mousemove', onMouseMove, false)
      scope.domElement.ownerDocument.addEventListener('mouseup', onMouseUp, false)

      scope.dispatchEvent(startEvent)
    }
  }

  function onMouseMove (event) {
    if (scope.enabled === false) {
      return
    }

    event.preventDefault()

    switch (state) {
      case STATE.DOLLY:
        if (scope.enableZoom === false) {
          return
        }

        handleMouseMoveDolly(event)

        break
      case STATE.PAN:
        if (scope.enablePan === false) {
          return
        }

        handleMouseMovePan(event)

        break
    }
  }

  function onMouseUp (event) {
    if (scope.enabled === false) {
      return
    }

    handleMouseUp(event)

    scope.domElement.ownerDocument.removeEventListener('mousemove', onMouseMove, false)
    scope.domElement.ownerDocument.removeEventListener('mouseup', onMouseUp, false)

    scope.dispatchEvent(endEvent)

    state = STATE.NONE
  }

  function onMouseWheel (event) {
    if (scope.enabled === false || scope.enableZoom === false || (state !== STATE.NONE && state !== STATE.ROTATE)) {
      return
    }

    event.preventDefault()
    event.stopPropagation()

    scope.dispatchEvent(startEvent)

    handleMouseWheel(event)

    scope.dispatchEvent(endEvent)
  }

  function onTouchStart (event) {
    if (scope.enabled === false) {
      return
    }

    clickTouches += 1

    event.preventDefault() // prevent scrolling

    switch (event.touches.length) {
      case 1:
        switch (scope.touches.ONE) {
          case TOUCH.PAN:
            if (scope.enablePan === false) {
              return
            }

            handleTouchStartPan(event)

            state = STATE.TOUCH_PAN

            break
          default:
            state = STATE.NONE
        }

        break
      case 2:
        state = STATE.DOLLY
        break
      default:
        state = STATE.NONE
    }

    if (state !== STATE.NONE) {
      scope.dispatchEvent(startEvent)
    }
  }

  function onTouchMove (event) {
    if (scope.enabled === false) {
      return
    }

    event.preventDefault() // prevent scrolling
    event.stopPropagation()

    switch (state) {
      case STATE.TOUCH_PAN:
        if (scope.enablePan === false) {
          return
        }

        handleTouchMovePan(event)

        scope.update()

        break
      default:
        state = STATE.NONE
    }
  }

  function onTouchEnd (event) {
    if (scope.enabled === false) {
      return
    }

    handleTouchEnd(event)

    scope.dispatchEvent(endEvent)

    state = STATE.NONE
  }

  scope.domElement.addEventListener('mousedown', onMouseDown, false)
  scope.domElement.addEventListener('wheel', onMouseWheel, false)

  scope.domElement.addEventListener('touchstart', onTouchStart, false)
  scope.domElement.addEventListener('touchend', onTouchEnd, false)
  scope.domElement.addEventListener('touchmove', onTouchMove, false)

  const hammer = new Hammer.Manager(scope.domElement)

  hammer.add(new Hammer.Pinch())

  hammer.on('pinch', function (event) {
    const factor = lerp(1, event.scale, 0.5)
    targetZoom = Math.max(0, Math.min(factor * targetZoom, 1))
  })

  // make sure element can receive keys.

  if (scope.domElement.tabIndex === -1) {
    scope.domElement.tabIndex = 0
  }

  // force an update at start

  this.update()
}

MapControls.prototype = Object.create(EventDispatcher.prototype)
MapControls.prototype.constructor = MapControls

export default MapControls
