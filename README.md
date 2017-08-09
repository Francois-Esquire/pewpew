# Pew Pew
Inspired by a talk I gave on GraphQL at [ReactNYC meetup \#7][meetup].

[Check out the presentation slides.][slides]

[Live demo on Heroku][heroku]

![welcome home][landing]

Currently a work in progress - requires node.js (v7.6 and up) and access to mongodb.

## Quick start
```bash
### make sure you have mongo running on your local machine,
### or set the MONGODB_URI environment variable to where your mongodb lives.

# mongod

nmp install

### for development:

npm run dev

### to build your project:

npm run build
```

### Awesome Resources, Guides & Tools:
[GraphQL Language Cheat Sheet - Medium](https://wehavefaces.net/graphql-shorthand-notation-cheatsheet-17cd715861b6) by [Hafiz Ismail](https://wehavefaces.net/@sogko)

### TODO
- [ ] Testing
- [ ] Polish Child Process Clustering When Developing.

[meetup]: https://www.meetup.com/ReactNYC/events/240619695/
[slides]: http://slides.com/michaeltobia/graphql/
[heroku]: https://pew-pew-pew.herokuapp.com/

[landing]: https://github.com/Francois-Esquire/pewpew/raw/master/assets/screenshots/home.png "landing page"
