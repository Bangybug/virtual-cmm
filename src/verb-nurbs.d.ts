declare module 'verb-nurbs';

declare namespace geom {
  declare namespace NurbsCurve {
    declare function byPoints(points: number[], controlPoints: number);
  }
}