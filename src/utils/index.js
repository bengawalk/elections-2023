import ElectionDataRaw from "../assets/data.csv?raw";

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

import IconBjp from "../assets/images/icon_bjp.webp";
import IconCongress from "../assets/images/icon_congress.webp";
import IconJds from "../assets/images/icon_jds.webp";
import IconAap from "../assets/images/icon_aap.webp";

export const PARTY_ICONS = {
  bjp: IconBjp,
  inc: IconCongress,
  jds: IconJds,
  aap: IconAap,
};

export const csvToJson = (contentString) => {
  const [headersString, ...dataStringArray] = contentString.split("\r\n");
  const headers = headersString.split(",");
  const data = [];
  dataStringArray.forEach(d => {
    const dataItemArray = d.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    const dataItem = {};
    headers.forEach((h, i) => {
      dataItem[h] = dataItemArray[i];
    });
    data.push(dataItem);
  });
  return data;
}