import { Mesh, Vector3 } from "three"
import { SphereVolumeQuery } from "../../../cglib/sphere-volume-query"

type TMoveBrushParams = {
  mesh: Mesh
  bvh: MeshBVH
  sphereVolumeQuery: SphereVolumeQuery
  point: Vector3
  brushSettings: TBrushSettings
  startingPointIndex: number
}

export const moveBrush = ({
    mesh,
    sphereVolumeQuery,
    bvh,
    point,
    brushSettings,
    startingPointIndex,
  }: TMoveBrushParams) => {
    const inverseMatrix = mesh.matrixWorld.clone().invert()
    const localPoint = point.clone().applyMatrix4(inverseMatrix)
  
    sphereVolumeQuery.setQueryParams(localPoint, brushSettings.size * 0.8)
    bvh.shapecast(sphereVolumeQuery)
    sphereVolumeQuery.filterRestrictedPoints()
    sphereVolumeQuery.filterUnconnectedPoints(startingPointIndex)
    sphereVolumeQuery.accumulateResults()
  
    const { positionAttr, normalAttr } = sphereVolumeQuery
  
    const { indices } = sphereVolumeQuery.results
  
    const { normal, planePoint } = calculateAveragePlaneNormal({
      indices,
      positionAttr,
      normalAttr,
    })
  
    return [localPoint, normal, planePoint]
  }
  