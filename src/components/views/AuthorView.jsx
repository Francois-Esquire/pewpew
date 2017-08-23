import React from 'react';
import { graphql } from 'react-apollo';

import query from 'queries/me.gql';

import SignUp from '../forms/SignUp';

const AuthorSection = ({ data: { me } }) => {
  if (me) {
    return (<section className="author-view">
      <header>
        <h3>Dashboard</h3>
        <p>{me.handle}</p>
      </header>
    </section>);
  }

  return (<section className="author-registration">
    <h3>Sign Up</h3>
    <SignUp />
  </section>);
};

const AuthorView = graphql(query)(AuthorSection);

export default AuthorView;
