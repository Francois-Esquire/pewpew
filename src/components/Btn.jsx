import React from 'react';
import { graphql } from 'react-apollo';

import mutation from '../mutations/logout.gql';

const ActionButton = ({ children, action }) =>
  (<button
    type="button"
    onClick={action}>{
      children
    }</button>);

export default graphql(mutation, {
  props({ ownProps: {
    children,
    onSuccess,
    onFailure,
    variables,
    options = {},
  }, mutate }) {
    return {
      children,
      action() {
        return mutate({ variables, ...options })
          .then(onSuccess)
          .catch(onFailure);
      },
    };
  },
})(ActionButton);
