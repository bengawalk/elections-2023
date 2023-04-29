export const isPointInPolygon = (
  point,
  polygon
) => {
  let isInside = false;
  const totalPolys = polygon.length;
  for (let i = -1, j = totalPolys - 1; ++i < totalPolys; j = i) {
    if (
      ((polygon[i].longitude <= point.longitude &&
          point.longitude < polygon[j].longitude) ||
        (polygon[j].longitude <= point.longitude &&
          point.longitude < polygon[i].longitude)) &&
      point.latitude <
      ((polygon[j].latitude - polygon[i].latitude) *
        (point.longitude - polygon[i].longitude)) /
      (polygon[j].longitude - polygon[i].longitude) +
      polygon[i].latitude
    ) {
      isInside = !isInside;
    }
  }

  return isInside;
};