import React, { Component } from "react";
import Filter from "./Filter";
import Chart from "./Chart";
import axios from "axios";
import Loader from "react-loader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

let _ = require("lodash");
let parseString = require("xml2js").parseString;

let baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
let searchEndpoint = "/esearch.fcgi?db=pubmed";
let fetchEndpoint = "/efetch.fcgi?db=pubmed&retmode=xml";
let useHistoryParam = "&usehistory=y";

let filterOpt = {
  disease: "",
  ystart: "",
  yend: ""
};

export default class Diseases extends Component {
  state = {
    dataSet: [],
    loader: true,
    searchClicked: false,
    errMsg: ""
  };

  // This function create first step of fetch api by adding filter parameter
  handleSearch = ({ disease, ystart, yend }) => {
    this.setState({
      loader: false,
      searchClicked: true,
      dataSet: []
    });
    filterOpt = { disease, ystart, yend };

    let diseaseParam = encodeURI(disease); //To encode if special characters included.
    let filterQuery = `&term=${diseaseParam}+AND+${ystart}:${yend}[dp]&datetype=pdat`;
    let searchURL = baseUrl + searchEndpoint + filterQuery + useHistoryParam;
    console.log(searchURL);
    this.fetchSearchURL(searchURL);
  };

  // This function fetch Search API and use Querykey and Webenv to fetch real data
  async fetchSearchURL(searchURL) {
    try {
      let res = await axios.post(searchURL);
      let dataList = [];
      await parseString(res.data, async (err, result) => {
        if (result["eSearchResult"]["Count"]) {
          const dataCount = result["eSearchResult"]["Count"][0];

          if (dataCount > 0) {
            const queryKey = result["eSearchResult"]["QueryKey"][0];
            const webEnv = result["eSearchResult"]["WebEnv"][0];
            const repeatCounter = Math.ceil(dataCount / 500);
            let fetchURL = `${baseUrl}${fetchEndpoint}&query_key=${queryKey}&WebEnv=${webEnv}`;
            try {
              // --- According to Doc, it is advised to fetch batch of 500 for large dataset
              // --- Logic to loop by each batch to get all data

              for (let i = 0; i < repeatCounter; i++) {
                let urlBatches = `${fetchURL}&retstart=${i * 500}&retmax=500`;

                console.log(`${i + 1} of ${repeatCounter}`);
                console.log(urlBatches);

                let batchResult = await axios.post(urlBatches);
                await parseString(batchResult.data, async (err, result) => {
                  dataList = dataList.concat(
                    result["PubmedArticleSet"]["PubmedArticle"]
                  );
                });
              }

              this.prepareDataForChart(dataList);
            } catch (ex) {
              let errMsg = this.getErrorMessage(ex.response.status);
              toast.error(errMsg);
              this.setState({ dataSet: [], loader: true });
              return;
            }
          } else {
            this.setState({
              dataSet: [],
              loader: true,
              searchClicked: true
            });
          }
        } else {
          toast.error("Sorry! No data to show");
          this.setState({ dataSet: [], loader: true });
        }
      });
    } catch (ex) {
      let errMsg = this.getErrorMessage(ex.response.status);
      toast.error(errMsg);
      this.setState({ dataSet: [], loader: true });
    }
  }

  getErrorMessage = status => {
    let errMsg = "";
    if (status == 404) {
      errMsg = "Sorry. Page Not Found";
    } else if (status == 400) {
      errMsg = "Data fetching fail. Server Error!";
    } else {
      errMsg = "Sorry! Something went wrong.";
    }
    return errMsg;
  };

  prepareDataForChart = rawData => {
    let years = [];
    try {
      for (let i = 0; i < rawData.length; i++) {
        // There are some outputs from server where years are undefined. So to prevent error, added 0
        let yearObj =
          rawData[i]["MedlineCitation"][0]["Article"][0]["Journal"][0][
            "JournalIssue"
          ][0]["PubDate"][0]["Year"];
        years.push({
          year: yearObj ? yearObj[0] : 0
        });
      }
      let yearsRange = _.range(filterOpt.ystart, filterOpt.yend + 1);
      let obj = _.groupBy(years, "year");

      let chartData = [];
      // --- Responsed PUB Year involve years not included in user filter.
      // --- To get specific Year, this below loop filter for only user defined year
      for (let i = 0; i < yearsRange.length; i++) {
        chartData.push({
          year: yearsRange[i],
          count: obj[yearsRange[i]].length
        });
      }
      this.setState({ dataSet: chartData, loader: true });
    } catch (ex) {
      console.log(ex);
    }
  };

  render() {
    return (
      <div className="container">
        <ToastContainer />
        <Filter onSearch={this.handleSearch}></Filter>
        <Loader
          loaded={this.state.loader}
          type="Circles"
          top="80%"
          width={3}
          length={5}
          radius={10}
        />
        <Chart
          searchClicked={this.state.searchClicked}
          isSearching={!this.state.loader}
          data={this.state.dataSet}
          filterOpt={filterOpt}
        ></Chart>
      </div>
    );
  }
}
