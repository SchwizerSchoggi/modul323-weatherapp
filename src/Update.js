import * as R from "ramda";

export const MSGS = {
  LOCATION_INPUT: "LOCATION_INPUT",
  ADD_LOCATION: "ADD_LOCATION",
  REMOVE_LOCATION: "REMOVE_LOCATION",
  HTTP_SUCCESS: "HTTP_SUCCESS",
  HTTP_ERROR: "HTTP_ERROR",
  CLEAR_ERROR: "CLEAR_ERROR",
  TOOGLE_LOCATION: "TOOGLE_LOCATION",
};

const APPID = "955d231e563abfd9051aa973b445a3dc";

function weatherUrl(city) {
  return `http://api.openweathermap.org/data/2.5/weather?q=${encodeURI(city)}&units=metric&APPID=${APPID}`;
}

export function locationInputMsg(location) {
  return {
    type: MSGS.LOCATION_INPUT,
    location,
  };
}

export const addLocationMsg = {
  type: MSGS.ADD_LOCATION,
};

export function removeLocationMsg(id) {
  return {
    type: MSGS.REMOVE_LOCATION,
    id,
  };
}

const httpSuccessMsg = R.curry((id, response) => ({
  type: MSGS.HTTP_SUCCESS,
  id,
  response,
}));

function httpErrorMsg(error) {
  return {
    type: MSGS.HTTP_ERROR,
    error,
  };
}

export function toggleLocationMsg(id) {
  return {
    type: MSGS.TOOGLE_LOCATION,
    id,
  };
}

export const clearErrorMsg = {
  type: MSGS.CLEAR_ERROR,
};

function update(msg, model) {
  switch (msg.type) {
    case MSGS.LOCATION_INPUT: {
      const { location } = msg;
      return { ...model, location };
    }
    case MSGS.ADD_LOCATION: {
      const { nextId, location, locations } = model;
      const newLocation = {
        id: nextId,
        name: location,
        temp: "?",
        low: "?",
        high: "?",
      };
      const updatedLocations = R.prepend(newLocation, locations);
      return [
        {
          ...model,
          location: "",
          locations: updatedLocations,
          nextId: nextId + 1,
        },
        {
          request: { url: weatherUrl(location) },
          successMsg: httpSuccessMsg(nextId),
          errorMsg: httpErrorMsg,
        },
      ];
    }
    case MSGS.REMOVE_LOCATION: {
      const { id } = msg;
      const { locations } = model;
      const updatedLocations = R.reject(R.propEq("id", id), locations);
      return { ...model, locations: updatedLocations };
    }
    case MSGS.HTTP_SUCCESS: {
      const { id, response } = msg;
      const { locations } = model;
      const { temp, temp_min, temp_max } = R.pathOr({}, ["data", "main"], response);
      const updatedLocations = R.map((location) => {
        if (location.id === id) {
          return {
            ...location,
            temp: Math.round(temp),
            low: Math.round(temp_min),
            high: Math.round(temp_max),
          };
        }
        return location;
      }, locations);
      return {
        ...model,
        locations: updatedLocations,
      };
    }
    case MSGS.HTTP_ERROR: {
      const { error } = msg;
      return { ...model, error: error.message };
    }
    case MSGS.CLEAR_ERROR: {
      return { ...model, error: null };
    }
    case MSGS.TOOGLE_LOCATION: {
      const { id } = msg;
      const { locations } = model;
      const updatedLocations = R.map((location) => {
        if (location.id === id) {
          return {
            ...location,
            isActive: !location.isActive,
          };
        }
        return location;
      }, locations);
      return { ...model, locations: updatedLocations };
    }
  }
  return model;
}

export default update;
