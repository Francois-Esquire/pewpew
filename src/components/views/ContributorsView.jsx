import React from 'react';
import { graphql } from 'react-apollo';

import query from 'queries/authors.gql';

const ContributorsList = ({ data: { authors, loading, error, refetch } }) => {
  if (authors) {
    return (<ul className="contributors-list">{
      authors.map(author => (<li className="contributors-list-item" key={author.id}>
        <section>
          <header>
            <p>{author.id}</p>
          </header>
          <p>{author.handle}</p>
        </section>
      </li>))
    }</ul>);
  } else if (loading) return (<div>Loading</div>);
  else if (error) return (<button onClick={() => refetch()}>retry</button>);

  return null;
};

const ContributorsView = graphql(query)(ContributorsList);

const ContributorsSection = () => (<section className="contributors-view">
  <header>
    <h3>Contributors</h3>
  </header>
  <ContributorsView />
</section>);

export default ContributorsSection;
