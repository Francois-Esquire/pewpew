import React from 'react';

const renderField = (props) => {
  const { input, id, label, type, meta: { touched, error, warning } } = props;

  return (<div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...input} type={type} />
    {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  </div>);
};

export default renderField;
