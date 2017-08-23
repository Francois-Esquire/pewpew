import React from 'react';
import { Field, reduxForm } from 'redux-form';
import approve from 'approvejs';

const rules = new Map([
  ['email', {
    required: true,
    email: true,
  }]]);

const validate = (values) => {
  const errors = {};
  if (!values.username) {
    errors.username = 'Required';
  } else if (values.username.length > 15) {
    errors.username = 'Must be 15 characters or less';
  }
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.age) {
    errors.age = 'Required';
  } else if (isNaN(Number(values.age))) {
    errors.age = 'Must be a number';
  } else if (Number(values.age) < 18) {
    errors.age = 'Sorry, you must be at least 18 years old';
  }
  return errors;
};

const warn = (values) => {
  const warnings = {};
  if (values.age < 19) {
    warnings.age = 'Hmm, you seem a bit young...';
  }
  return warnings;
};

const renderField = (props) => {
  const { id, input, label, type, meta: { touched, error, warning } } = props;

  return (<div>
    <label htmlFor={id}>{label}</label>
    <input id={id} {...input} type={type} />
    {touched && ((error && <span>{error}</span>) || (warning && <span>{warning}</span>))}
  </div>);
};

const HandleBarForm = (props) => {
  const { handleSubmit, pristine, reset, submitting } = props;
  return (
    <form onSubmit={handleSubmit}>
      <Field id="handle" name="username" type="text" component={renderField} label="Username" />
      <Field id="email" name="email" type="email" component={renderField} label="Email" />
      <Field id="password" name="password" type="password" component={renderField} label="Age" />
      <button type="submit" disabled={pristine || submitting}>Submit</button>
    </form>
  );
};

const HandleBar = graphql(mutation, {
  props: ({ mutate }) => ({
    onSubmit: values => {
      console.log(values);
      return mutate(values);
    },
  }),
})(reduxForm({
  form: 'HandleBar',
})(HandleBarForm));

export default HandleBar;
