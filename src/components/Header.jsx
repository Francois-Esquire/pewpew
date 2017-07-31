import React from 'react';
import { graphql } from 'react-apollo';

import query from '../../schema/queries/me.gql';

function Nav({ data }) {
  return data.me ? (<header>
    <span>Moi</span>
  </header>) : null;
}

const Header = graphql(query)(Nav);

export default Header;
