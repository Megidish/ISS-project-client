import { useEffect, useState } from "react";
import { Coordinate } from "ol/coordinate";
import { Point } from "ol/geom";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import { RMap, ROSM, RLayerVector, RFeature, ROverlay, RStyle } from "rlayers";
import locationIcon from "..//assets/location.svg";
 

const center: Coordinate = [0, 0];
const ISS_UPDATE_INTERVAL = 10000;
const backendURL = "http://localhost:3000";


const MapWithISS = () => {
  const [issLocation, setIssLocation] = useState<Coordinate>(center);

  useEffect(() => {
    const fetchISSLocation = async () => {
      try {
        const response = await fetch(`${backendURL}/utm`);
        const data = await response.json();
        const { easting, northing } = data;
        console.log("ISS Location:", easting, northing);

        const [longitude, latitude] = [easting, northing];
        const webMercatorCoordinates = fromLonLat([longitude, latitude]);

        setIssLocation(webMercatorCoordinates);
      } catch (error) {
        console.error("Error fetching ISS location:", error);
      }
    };

    fetchISSLocation(); // Fetch initial ISS location
    const interval = setInterval(fetchISSLocation, ISS_UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <RMap
      width={"100%"}
      height={"60vh"}
      initial={{ center: fromLonLat(center), zoom: 3 }}
    >
      <ROSM />
      <RLayerVector zIndex={10}>
        <RStyle.RStyle>
          <RStyle.RIcon src={locationIcon} anchor={[0.5, 0.8]} />
        </RStyle.RStyle>
        <RFeature
          geometry={new Point(issLocation)}
          onClick={(e) =>
            e.map.getView().animate({ center: e.coordinate, zoom: 6, duration: 1000 })
          }
        >
          <ROverlay>
            ISS Location
          </ROverlay>
        </RFeature>
      </RLayerVector>
    </RMap>
  );
};

export default MapWithISS;
