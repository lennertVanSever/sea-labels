require('dotenv').config();
const fetch = require('node-fetch');
const languages = require('./languages.json');
const fs = require('fs');
const { features } = require('process');

const getTranslations = async (body, languageSelection) => {
  console.log(body, languageSelection);
  const responseRaw = await fetch(
    `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&${languageSelection}&from=en`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_TRANSLATE_KEY,
        'Ocp-Apim-Subscription-Region': 'westeurope',
        'Content-Type': 'application/json',
      },
    }
  );
  return responseRaw.json();
};

// console.log(languages);

const languagesQuery = (() => {
  return Object.keys(languages)
    .map(key => {
      return `to=${key}`;
    })
    .join('&');
})();

const convertTranslationToKeyValueObject = input => {
  if (!input[0].text) return {};
  const returnObject = {};
  input.forEach(({ text, to }) => {
    returnObject[to] = text;
  });
  return returnObject;
};

const translateLabels = async (data) => {
  const labelsToTranslate = data.features.map(({ properties : { label }}) => {
    return {
      Text: label
    }
  });
  const rawTranslations = await getTranslations(
    labelsToTranslate,
    languagesQuery
  );
  console.log(rawTranslations);
  data.features = data.features.map((feature, index) => {
    return {
      ...feature,
      properties: {
        ...feature.properties,
        translations: {
          ...convertTranslationToKeyValueObject(
            rawTranslations[index].translations
          ),
          en: feature.properties.label,
        }
      }
    }
  });
  return data;
}

const dataPath = '../data.geojson';
const data = JSON.parse(fs.readFileSync(dataPath));

(async() => {
  const newData = await translateLabels(data);
  fs.writeFileSync(dataPath, JSON.stringify(newData));
})()



// const rawTranslations = await getTranslations(
//   [{ Text: name }],
//   languagesQuery
// );
// world.features[index].properties.translations = {
//   ...convertTranslationToKeyValueObject(
//     rawTranslations[0].translations
//   ),
//   en: name,
// };
// console.info(`translated ${name}`);