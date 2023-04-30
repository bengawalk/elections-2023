import * as React from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import { getBounds } from "geolib";

import ElectionDataRaw from "./assets/data.csv?raw";
import {LANGUAGES, MAPBOX_TOKEN} from "./utils/constants";
import boundaryData from "./assets/constituencies.json";
import {isPointInPolygon} from "./utils";
import Content from "./content";
import {Trans, withTranslation} from "react-i18next";
import i18n from "i18next";

import "./utils/i18n";

mapboxgl.accessToken = MAPBOX_TOKEN;

const [headersString, ...dataStringArray] = ElectionDataRaw.split("\r\n");
const headers = headersString.split(",");
const ELECTION_DATA = [];
dataStringArray.forEach(d => {
  const dataItemArray = d.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
  const dataItem = {};
  headers.forEach((h, i) => {
    dataItem[h] = dataItemArray[i];
  });
  ELECTION_DATA.push(dataItem);
});

class MainPage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      constituency: "",
      zoom: 8.88,
      lat: 12.9246,
      lng: 77.5896,
      locationError: false,
      locationProgress: false,
      lang: "en",
    };
    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    const { lat, lng, zoom } = this.state;

    const lang = localStorage.getItem("lang") || LANGUAGES[0].code
    i18n.changeLanguage(lang);
    this.setState({ lang });

    const mapRef = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom,
      minZoom: 8,
    });

    mapRef.dragRotate.disable();
    mapRef.touchZoomRotate.disableRotation();

    mapRef.on("load", () => {
      this.renderMapData();
      this.addMapEvents();
    });

    const el = document.createElement("div");
    el.className = "user-location-indicator";
    this.userLocationMarker = new mapboxgl.Marker(el)
      .setLngLat({ lat: 0, lng: 0 })
      .addTo(mapRef);

    this.map = mapRef;

  }

  renderMapData = () => {
    const { constituency } = this.state;
    this.map.addSource("boundaries", {
      type: "geojson",
      data: boundaryData,
    });

    this.map.addLayer({
      id: "boundaries-fill",
      source: "boundaries",
      type: "fill",
      paint: {
        "fill-color": "#FF0000",
        "fill-opacity": 0.3,
      },
    });

    this.map.addLayer({
      id: "boundaries-highlighted",
      source: "boundaries",
      type: "fill",
      filter: ["==", "AC_CODE", constituency || ""],
      paint: {
        "fill-color": "#FF0000",
        "fill-opacity": 1,
      },
    });

    this.map.addLayer({
      id: "boundaries-line",
      source: "boundaries",
      type: "line",
      paint: {
        "line-width": 0.5,
      },
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { constituency, lang } = this.state;
    // const url = new URL(window.location.href);
    // url.searchParams.set('c', constituency);
    // window.history.replaceState( {} , '', url );

    if(constituency !== prevState.constituency) {
      this.map.setFilter("boundaries-highlighted", [
        "==",
        "AC_CODE",
        constituency || "",
      ]);

      const constituencyData = boundaryData.features.filter(f => f.properties.AC_CODE === constituency);
      let coordinates = [];
      constituencyData.forEach(c => {
        c.geometry.coordinates[0].forEach(([longitude, latitude]) => {
          coordinates.push({ longitude, latitude });
        })
      });

      const bounds = getBounds(coordinates);
      this.map.fitBounds([
        [bounds.minLng - 0.014, bounds.minLat - 0.014],
        [bounds.maxLng + 0.014, bounds.maxLat + 0.014]
      ])
    }

    if(lang !== prevState.lang) {
      localStorage.setItem("lang", lang);
      document.documentElement.setAttribute("lang", lang);
      i18n.changeLanguage(lang);
    }
  }

  addMapEvents = () => {
    this.map.on("move", () => {
      this.setState({
        lng: this.map.getCenter().lng.toFixed(4),
        lat: this.map.getCenter().lat.toFixed(4),
        zoom: this.map.getZoom().toFixed(2),
      });
    });

    this.map.on("click", "boundaries-fill", (e) => {
      const feature = e.features[0];

      const { AC_CODE } = feature.properties;
      this.setState({
        constituency: AC_CODE,
      });
    });

    this.map.on('mousemove', 'boundaries-fill', () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });

    this.map.on('mouseleave', 'boundaries-fill', () => {
      this.map.getCanvas().style.cursor = '';
    });

  }

  getUserLocation = () => {
    this.setState({
      locationProgress: true,
    })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.userLocationMarker.setLngLat([longitude, latitude]);

        const constituencyData = boundaryData.features.find(f => {
          return isPointInPolygon(
            position.coords,
            f.geometry.coordinates[0].map(([longitude, latitude]) => ({ longitude, latitude })));
        });
        if(constituencyData) {
          this.setState({
            constituency: constituencyData.properties.AC_CODE,
            locationProgress: false,
            locationError: false,
          });
        } else {
          this.setState({
            locationError: true,
            locationProgress: false,
          });
        }
      },
      (error) => {
        this.setState({
          locationError: true,
          locationProgress: false,
        });
      },
    );
  }

  switchLanguage = () => {
    const { lang } = this.state;
    this.setState({
      lang: lang === 'en' ? "kn" : "en",
    });
  }

  render() {
    const { t } = this.props;
    const { constituency, locationError, locationProgress, lang } = this.state;
    const selectedConstituencyDetails = ELECTION_DATA.filter(e => e.code === constituency);

    return (
      <>
        <div id="constituency-map-wrapper">
          <div id="constituency-map" className="mapboxgl-map" ref={this.mapContainer} />
          <div id="map-actions">
            <button id="map-get-location" onClick={this.getUserLocation}>
                <span className="material-icons">
                  my_location
                </span>
            </button>
            <button id="language-switch" onClick={this.switchLanguage}>
              { lang === 'en' ? "ಕನ್ನಡ" : "EN" }
            </button>
          </div>
        </div>
        <div id="content">
          {
            locationError && (
              <div id="location-error">
                <span className="material-icons">
                  location_disabled
                </span>
                <p>
                  <Trans t={t} i18nKey="loc_err" />
                </p>
              </div>
            )
          }
          {
            locationProgress && (
              <div id="search-loading">
                <div className="spin" />
                <Trans t={t} i18nKey="loc_fetch" />...
              </div>
            )
          }
          <h2>{t('mla_elec')} 2023</h2>
          <h4><Trans t={t} i18nKey="acb" /></h4>
          <select value={constituency} className="assembly-dropdown" onChange={e => { this.setState({ constituency: e.target.value })}}>
            {
              constituency ? "" : <option>
                <Trans t={t} i18nKey="sac" />
              </option>
            }
            {
              ELECTION_DATA.map(e => (
                <option value={e.code} key={e.code}>{e[`name_${lang}`]}</option>
              ))
            }
          </select>
          {
            selectedConstituencyDetails.length > 0 && (
              <Content
                constituency={constituency}
                details={selectedConstituencyDetails[0]}
                lang={lang}
              />
            )
          }
          {
            !selectedConstituencyDetails.length > 0  && !locationProgress && (
              <div className="center">
                <Trans t={t} i18nKey="or" />
                <br />
                <button id="location-button" onClick={this.getUserLocation}>
                  <span className="material-icons">
                    my_location
                  </span>
                  <Trans t={t} i18nKey="gcl" /></button>
              </div>
            )
          }
        </div>
      </>
    );
  }
}

const TranslatedPage = withTranslation()(MainPage);

const root = createRoot(document.getElementById("root"));
root.render(<TranslatedPage />);
