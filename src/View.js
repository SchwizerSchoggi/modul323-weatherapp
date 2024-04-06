import * as R from "ramda";
import hh from "hyperscript-helpers";
import { h } from "virtual-dom";

import { locationInputMsg, removeLocationMsg, addLocationMsg, clearErrorMsg, toggleLocationMsg } from "./Update";

const { div, input, form, button, ul, li, i } = hh(h);
const btnStyle = "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded";

function locationForm(dispatch, model) {
  return div({ className: "" }, [
    form(
      {
        className: "flex gap-4 items-center mt-4",
        onsubmit: (e) => {
          e.preventDefault();
          dispatch(addLocationMsg);
        },
      },
      [
        input({
          className: "shadow appearance-none border rounded w-full py-2 px-3 text-gray-700",
          placeholder: "Enter location...",
          value: model.location,
          oninput: (e) => dispatch(locationInputMsg(e.target.value)),
        }),
        button({ className: btnStyle, type: "submit" }, "Add"),
      ]
    ),
  ]);
}

function cell(className, label, temp) {
  return div({ className }, [div({ className: "font-bold" }, label), div({}, temp)]);
}

const location = R.curry((dispatch, loc) => {
  const { name, temp, low, high, id, isActive = false } = loc;
  const bgColor = temp > 20 ? "bg-green-100 hover:bg-green-200" : "bg-blue-100 hover:bg-blue-200";
  const liComponents = [cell("grow", "Location", name), cell("w-20", "Temp", temp), cell("w-20", "Low", low), cell("w-20", "High", high)];
  if (isActive) {
    liComponents.push(
      button(
        {
          className: "hover:bg-gray-200 p-2 rounded",
          onclick: () => dispatch(removeLocationMsg(id)),
        },
        "🗑"
      )
    );
  } else {
    
  }
  return li(
    { className: `p-3 ${bgColor} flex justify-between cursor-pointer`, onclick: () => dispatch(toggleLocationMsg(id)) },
    liComponents
  );
});

function locations(dispatch, model) {
  const locations = R.map(location(dispatch), model.locations);
  return ul({ className: "mt-4" }, locations);
}

function error(dispatch, model) {
  if (!model.error) {
    return null;
  }
  return div({ className: "pa2 mv2 bg-red white relative" }, [
    model.error,
    i({
      className: "white absolute top-0 right-0 mt1 mr1 fa fa-remove pointer black-40",
      onclick: () => dispatch(clearErrorMsg),
    }),
  ]);
}

function view(dispatch, model) {
  return div({ className: "" }, [error(dispatch, model), locationForm(dispatch, model), locations(dispatch, model)]);
}

export default view;
