import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CoordinatesDialog from './coordinates-dialog';
import util from '../../util/util';
import { getCoordinatesMetadata } from './ol-coordinates-marker-util';

export default function LocationMarker ({
  reverseGeocodeResults, removeMarker, coordinatesObject, isMobile, dialogVisible = true,
}) {
  const coordinates = [coordinatesObject.latitude, coordinatesObject.longitude];
  const [latitude, longitude] = coordinates;
  const tooltipId = util.encodeId(`coordinates-map-marker_${latitude},${longitude}`);
  const geocodeProperties = { latitude, longitude, reverseGeocodeResults };
  const coordinatesMetadata = getCoordinatesMetadata(geocodeProperties);
  const [showDialog, setShowDialog] = useState(dialogVisible);

  return (
    <div className="location-dialog-pin-wrapper ">
      {showDialog && (
        <CoordinatesDialog
          coordinatesMetadata={coordinatesMetadata}
          removeMarker={removeMarker}
          removeCoordinatesDialog={() => setShowDialog(false)}
          isMobile={isMobile}
          tooltipId={tooltipId}
        />
      )}
      <img
        id="marker-pin"
        src="images/map-pin.png"
        height="32"
        width="20"
        onClick={() => setShowDialog(true)}
      />
    </div>
  );
}

LocationMarker.propTypes = {
  reverseGeocodeResults: PropTypes.object,
  isMobile: PropTypes.bool,
  coordinatesObject: PropTypes.object,
  removeMarker: PropTypes.func,
  dialogVisible: PropTypes.bool,
};
