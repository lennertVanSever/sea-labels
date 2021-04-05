const fs = require('fs');

const dataPath = '../data.geojson';
const data = JSON.parse(fs.readFileSync(dataPath));
const idsOfLabelsWithStraightLine = [
  1,
  2,
  15,
  16,
  21, 
]


data.features = data.features.map((feature) => {
  if(!idsOfLabelsWithStraightLine.includes(feature.properties.id)) {
    return feature;
  }
  const [[[,firstLatitude]]] = feature.geometry.coordinates;
  feature.geometry.coordinates[0] = feature.geometry.coordinates[0].map(([longitude]) => {
    return [longitude, firstLatitude]
  })
  return feature;
})

fs.writeFileSync(dataPath, JSON.stringify(data));