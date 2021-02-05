import React from "react";

const Input = ({
  type,
  name,
  value,
  label,
  placeholder = "",
  error,
  onChange
}) => {
  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        className="form-control"
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};

export default Input;
