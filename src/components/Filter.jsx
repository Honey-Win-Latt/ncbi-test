import React, { Component } from "react";
import Input from "./Input";
import Joi from "joi-browser";

let d = new Date();

export default class Filter extends Component {
  state = {
    data: {
      disease: "",
      ystart: d.getFullYear(),
      yend: d.getFullYear()
    },
    errors: {}
  };

  scheme = {
    disease: Joi.string()
      .required()
      .label("Disease/Disease Area"),
    ystart: Joi.number()
      .required()
      .label("Start Year"),
    yend: Joi.number()
      .required()
      .label("End Year")
  };

  validate = () => {
    let options = { abortEarly: false };
    let errors = {};

    let { error } = Joi.validate(this.state.data, this.scheme, options);
    if (!error) return null;

    for (let item of error.details) {
      errors[item.path[0]] = item.message;
    }
    return errors;
  };

  handleChange = e => {
    let data = { ...this.state.data };
    data[e.target.name] = e.target.value;

    let errors = { ...this.state.errors };
    let error = this.validateProperty(e.target);
    errors[e.target.name] = error;
    this.setState({ data, errors: errors || {} });
  };

  validateProperty = input => {
    let options = { abortEarly: false };
    let obj = { [input.name]: input.value };
    let scheme = { [input.name]: this.scheme[input.name] };

    let { error } = Joi.validate(obj, scheme, options);
    return error ? error.details[0].message : null;
  };

  handleSearch = () => {
    this.props.onSearch(this.state.data);
  };

  render() {
    let { data, errors } = this.state;
    return (
      <div>
        <h3>Trends in Scientific Publications</h3>
        <div className="filter-container">
          <h5>Search Options</h5>
          <form>
            <div className="form-group">
              <Input
                label="Disease/Disease Area:"
                type="text"
                name="disease"
                value={data.disease}
                error={errors.disease}
                placeholder={"Eg. Thyroid Disease"}
                onChange={this.handleChange}
                className="form-control"
              />

              <Input
                label="Year From:"
                type="text"
                name="ystart"
                value={data.ystart}
                error={errors.ystart}
                onChange={this.handleChange}
                className="form-control"
              />

              <Input
                label="Year To:"
                type="text"
                name="yend"
                value={data.yend}
                error={errors.yend}
                onChange={this.handleChange}
                className="form-control"
              />

              <button
                type="button"
                className="btn btn-primary form-control btn-search"
                onClick={this.handleSearch}
                disabled={this.validate()}
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
