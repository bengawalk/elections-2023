import * as React from "react";
import { createRoot } from "react-dom/client";
import mapboxgl from "mapbox-gl";
import { getBounds } from "geolib";

import ElectionDataRaw from "./assets/data.csv?raw";
import {MAPBOX_TOKEN} from "./utils/constants";
import boundaryData from "./assets/constituencies.json";
import {isPointInPolygon} from "./utils";

mapboxgl.accessToken = MAPBOX_TOKEN;

const [headersString, ...dataStringArray] = ElectionDataRaw.split("\r\n");
const headers = headersString.split(",");
const ELECTION_DATA = [];
dataStringArray.forEach(d => {
  const dataItemArray = d.split(",");
  const dataItem = {};
  headers.forEach((h, i) => {
    dataItem[h] = dataItemArray[i];
  });
  ELECTION_DATA.push(dataItem);
});

const Content = ({ details }) => {
  return (
    <>
      <h2>About</h2>
      <h4>
        Voting population
      </h4>
      <p>{parseInt(details.pop.substring(0, 3)) / 100} lakh</p>
      <h4>Area</h4>
      <p>{details.area} sqkm</p>

      <h2>Sitting MLA, {details.elec_year} - 2023</h2>
      <h4>Name</h4>
      <div className="flex">
        <div className="member-icon"></div>
        {details.mla_en}
      </div>

      <h4>Party</h4>
      <div className="flex">
        <div className="member-icon"></div>
        {details.mla_party}
      </div>

      <h4>In the news</h4>
      TODO
      {/*<a className="news-item">*/}
      {/*  White topping delays continue across Indiranagar and Ulsoor*/}
      {/*  <span className="material-icons">*/}
      {/*      open_in_new*/}
      {/*      </span>*/}
      {/*</a>*/}
      {/*<a className="news-item">*/}
      {/*  Man gets beaten up for overtaking MLA*/}
      {/*  <span className="material-icons">*/}
      {/*      open_in_new*/}
      {/*      </span>*/}
      {/*</a>*/}
      {/*<a className="news-item">*/}
      {/*  Despite ban, politicians continue to spend taxpayer money on flex ads*/}
      {/*  <span className="material-icons">*/}
      {/*      open_in_new*/}
      {/*      </span>*/}
      {/*</a>*/}

      <h2>2023 Candidates</h2>
      <table className="candidates-table">
        <thead>
        <tr>
          <th>
            <h4>Name</h4>
          </th>
          <th>
            <h4>Party</h4>
          </th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            <div className="flex">
              <div className="member-icon"></div>
              Candidate 1
            </div>
          </td>
          <td>
            <div className="member-icon"></div>
          </td>
        </tr>
        <tr>
          <td>
            <div className="flex">
              <div className="member-icon"></div>
              Candidate 2
            </div>
          </td>
          <td>
            <div className="member-icon"></div>
          </td>
        </tr>
        </tbody>
      </table>
    </>
  );
}

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
    };
    this.mapContainer = React.createRef();
  }

  componentDidMount() {
    const { lat, lng, zoom } = this.state;

    const mapRef = new mapboxgl.Map({
      container: this.mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [lng, lat],
      zoom,
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
    const { constituency } = this.state;
    if(constituency !== prevState.constituency) {
      this.map.setFilter("boundaries-highlighted", [
        "==",
        "AC_CODE",
        constituency || "",
      ]);

      const constituencyData = boundaryData.features.find(f => f.properties.AC_CODE === constituency);

      const bounds = getBounds(constituencyData.geometry.coordinates[0].map(([longitude, latitude]) => ({ longitude, latitude })));
      this.map.fitBounds([
        [bounds.minLng - 0.014, bounds.minLat - 0.014],
        [bounds.maxLng + 0.014, bounds.maxLat + 0.014]
      ])
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

  render() {
    const { constituency, locationError, locationProgress } = this.state;
    const selectedConstituencyDetails = ELECTION_DATA.find(e => e.code === constituency);
    return (
      <>
        <div id="constituency-map-wrapper">
          <div id="constituency-map" className="mapboxgl-map" ref={this.mapContainer} />
          {
            constituency && (
              <button id="map-get-location" onClick={this.getUserLocation}>
                <span className="material-icons">
                  my_location
                </span>
              </button>
            )
          }
        </div>
        <div id="content">
          {
            locationError && (
              <p className="error">Unable to get current location. Please try again</p>
            )
          }
          {
            locationProgress && (
              <div className="center">
                Fetching location...
              </div>
            )
          }
          <h4>Assembly constituency</h4>
          <select value={constituency} className="assembly-dropdown" onChange={e => { this.setState({ constituency: e.target.value })}}>
            {
              constituency ? "" : <option>Select assembly constituency</option>
            }
            {
              ELECTION_DATA.map(e => (
                <option value={e.code} key={e.code}>{e.name_en}</option>
              ))
            }
          </select>
          {
            selectedConstituencyDetails && (
              <Content details={selectedConstituencyDetails} />
            )
          }
          {
            !selectedConstituencyDetails && !locationProgress && (
              <div className="center">
                or
                <br />
                <button id="location-button" onClick={this.getUserLocation}>Get current location</button>
              </div>
            )
          }
        </div>
      </>
    );
  }
}

const root = createRoot(document.getElementById("root"));
root.render(<MainPage />);
