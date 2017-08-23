import React from 'react';

import PewPew from './icons/pewpew';
import AuthorView from './views/AuthorView';
import ChannelView from './views/ChannelView';
import ContributorsView from './views/ContributorsView';
import ChannelSearch from './forms/ChannelSearch';
import LoginForm from './forms/LoginForm';

const Home = ({ staticContext }) => {
  if (staticContext) Object.assign(staticContext, { channel: '', view: 'home' });

  return (<section className="home">
    <header>
      <PewPew color="#fff" />
    </header>
    <ChannelSearch />
    <ChannelView />
    <ContributorsView />
    <AuthorView />
    <section>
      <header>
        <h3>Log In</h3>
      </header>
      <LoginForm />
    </section>
  </section>);
};

export default Home;
