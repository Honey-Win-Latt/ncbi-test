import React, { Component } from "react";
import C3Chart from "react-c3js";
import "c3/c3.css";
import * as d3 from "d3";

export default function Chart({ data, isSearching, searchClicked, filterOpt }) {
  // console.log(filterOpt);
  return searchClicked ? (
    data.length > 0 ? (
      <div>
        <h4>
          Chart showing trends for number of Articles of ({filterOpt.disease})
          published between {filterOpt.ystart} and {filterOpt.yend}
        </h4>
        <C3Chart
          data={{
            unload: true,
            load: true,
            json: data,
            keys: { x: "year", value: ["count"] },
            type: "line",
            colors: { count: "#9244b1" }
          }}
          axis={{
            x: {
              show: true,
              type: "category",
              tick: {
                multiline: false
              },
              label: " Years ",
              height: 50
            },
            y: {
              label: " Number of Articles "
            }
          }}
          tooltip={{
            format: {
              name: () => {
                return "Total Articles:";
              }
            }
          }}
          bar={{ width: "5px" }}
        />
      </div>
    ) : isSearching ? (
      <div>
        <h4>This may take few moments. Please hold on!</h4>
      </div>
    ) : (
      <h4>We are Sorry! Data Not Found.</h4>
    )
  ) : (
    <></>
  );
}
