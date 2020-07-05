import { Pass } from 'three/examples/jsm/postprocessing/Pass'
import { Group, Mesh, MeshBasicMaterial, OrthographicCamera, Vector3 } from 'three'
import { OBJLoader2 } from 'three/examples/jsm/loaders/OBJLoader2'
import { LoadedMeshUserOverride } from 'three/examples/jsm/loaders/obj2/shared/MeshReceiver'
import seedrandom from 'seedrandom'
import { lerp, smootherstep } from '@/utils.js'

const xAxis = new Vector3(1, 0, 0)
const jitter = new Vector3(0, 0, 0)

export default class ShatteringPass extends Pass {
  constructor () {
    super()

    this.entering = true
    this.t = 0.0
    this.rendering = false

    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.quad = new Pass.FullScreenQuad(new MeshBasicMaterial())
    this.material = new MeshBasicMaterial()
    this.mesh = new Group()
    const loader = new OBJLoader2()
    loader.setUseOAsMesh(true)
    loader.addMaterials({ plane: this.material }, false)
    loader.setBaseObject3d(this.mesh)
    loader.load(
      '/shattering.obj',
      () => {
      },
      null,
      null,
      ({ detail: { bufferGeometry, material } }) => {
        const result = new LoadedMeshUserOverride()
        const pos = new Vector3()

        bufferGeometry.computeBoundingSphere()

        const { center } = bufferGeometry.boundingSphere
        pos.copy(center)
        bufferGeometry.translate(-center.x, -center.y, -center.z)

        const mesh = new Mesh(bufferGeometry, material)
        mesh.originalPosition = pos
        mesh.position.copy(pos)
        mesh.updateMatrixWorld(true)
        result.addMesh(mesh)

        return result
      }
    )
  }

  enter () {
    this.entering = true
    this.rendering = true
    this.t = 0
  }

  leave () {
    this.entering = false
    this.rendering = true
    this.t = Math.min(this.t, 5)
  }

  render (renderer, writeBuffer, readBuffer) {
    this.quad.material.map = readBuffer.texture
    this.material.map = readBuffer.texture

    if (this.renderToScreen) {
      renderer.setRenderTarget(null)
    } else {
      renderer.setRenderTarget(writeBuffer)
    }

    if (this.mesh !== undefined && this.rendering) {
      this.t += this.entering ? 0.1 : -0.1

      if (!this.entering && this.t <= 0) {
        this.t = 0
        this.rendering = false
      }

      this.mesh.children.forEach((child) => {
        const targetPosition = new Vector3()
        targetPosition.copy(child.originalPosition)
        const random = seedrandom(`${targetPosition.lengthSq()},${targetPosition.angleTo(xAxis)}`)
        const offset = Math.sin(0.5 * 0.8 ** (targetPosition.lengthSq() * random()) * this.t + random() * Math.PI)
        targetPosition.multiplyScalar(1.2 + offset * 0.2)
        jitter.set(random() * 0.05, random() * 0.05, -random() * 0.01)
        targetPosition.add(jitter)

        const startPosition = new Vector3()
        startPosition.copy(child.originalPosition)
        startPosition.multiplyScalar(2 + random() * 0.2)
        targetPosition.add(jitter)

        if (this.t < 2) {
          const smoothed = smootherstep(this.t / 2) ** 2
          child.position.set(
            lerp(child.originalPosition.x, startPosition.x, smoothed),
            lerp(child.originalPosition.y, startPosition.y, smoothed),
            lerp(child.originalPosition.z, startPosition.z, smoothed)
          )
        } else if (this.t < 5) {
          const smoothed = smootherstep((this.t - 2) / 3)
          child.position.set(
            lerp(startPosition.x, targetPosition.x, smoothed),
            lerp(startPosition.y, targetPosition.y, smoothed),
            lerp(startPosition.z, targetPosition.z, smoothed)
          )
        } else {
          child.position.copy(targetPosition)
        }

        child.updateMatrixWorld(true)
      })

      renderer.setClearColor(0x000000)
      renderer.render(this.mesh, this.camera)
    } else {
      this.quad.render(renderer)
    }
  }
}
