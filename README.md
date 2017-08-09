# Pew Pew
Inspired by a talk I gave on GraphQL at [ReactNYC meetup \#7][meetup].

[Check out the presentation slides.][slides]

[Live demo on Heroku][heroku] (simply uses the standard heroku/nodejs buildpack)

![welcome home][landing]

Currently a work in progress - requires node.js (v7.6 and up), mongodb and redis.

## Quick start
```bash
### make sure you have mongo running on your local machine,
### or set the MONGODB_URI environment variable to where your mongodb lives.

# mongod

### don't forget set the REDIS_URL or running redis beforehand:

# redis-server

nmp install

### for development:

npm run dev

### to build your project:

npm run build
```

## Usage
Customizing much of the behavior, from builds to client-side endpoints for your api, are configurable in one place. The way you set it up will trickle down throughout both the client/server facets of your app.

config/index.js
```javascript
...
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || 3000;

const urls = { redis: process.env.REDIS_URL..., };
const keys = ['ssssseeeecret', 'ssshhhhhhhhh'];
const paths = { ..., dist: join(cwd, 'dist') };
const hrefs = { graphql: `${protocol}${domains.graphql}.${host}`..., };
const options = { clustering: {...} };
...
```

More Usage & Feature Previews Coming Shortly...

### Awesome Resources, Guides & Tools:
[GraphQL Language Cheat Sheet - Medium](https://wehavefaces.net/graphql-shorthand-notation-cheatsheet-17cd715861b6) by [Hafiz Ismail](https://wehavefaces.net/@sogko)

### TODO
- [ ] Ubiquify Config - 45%
- [ ] Documentation - 10%
- [ ] Testing - 0.5%
- [ ] Polish Child Process Clustering, Both For Development & Production - 25%

[meetup]: https://www.meetup.com/ReactNYC/events/240619695/
[slides]: http://slides.com/michaeltobia/graphql/
[heroku]: https://pew-pew-pew.herokuapp.com/

[landing]: https://github.com/Francois-Esquire/pewpew/raw/master/assets/screenshots/home.png "landing page"
