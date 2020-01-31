import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
const port = process.env.PORT || 4002

const documents = [{ id: "d1", relevant: true }, { id: "d2", relevant: false }, { id: "d3", relevant: false }
    , { id: "d4", relevant: true }, { id: "d5", relevant: false }, { id: "d6", relevant: false },
{ id: "d7", relevant: false }, { id: "d8", relevant: false }, { id: "d9", relevant: false },
{ id: "d10", relevant: false }, { id: "d11", relevant: false }, { id: "d12", relevant: true }]


const queries = [...Array(20).keys()].map(e => "q" + e)

const states = {
    'S': ['Q'], 'Q': ['D', 'Q'], 'D': ['S', 'B'],
    'B': ['S', 'U'], 'U': ['S', 'B']
}

const participants = [...Array(3).keys()].map(e => {
    return {
        username: "participant" + e,
        state: "I",
        prevState: "",
        doc: "",
        query: "",
        options: ['N', 'S']
    }

})
let sesion = null

console.log(documents)
console.log(queries)
console.log(states)
console.log(participants)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const host = process.env.MONGO_DB || 'localhost'
mongoose.connect(`mongodb://test:test@${host}:27018/test`)
    .then(() => { // if all is ok we will be here
        console.log('Start');
    })
    .catch(err => { // if error we will be here
        console.error('App starting error:', err.stack);
        process.exit(1);
    });
mongoose.set('debug', false);


import './models/bookmarks'
import './models/queries'
import './models/userdata'
import './models/visitedLinks'

const VisitedLink = mongoose.model('VisitedLink')
const Bookrmark = mongoose.model('Bookmark')
const Queries = mongoose.model('Queries')
const UserData = mongoose.model('UserData')

VisitedLink.remove({}, () => {
    //VisitedLink.create({ username: "kimbo", localTimestamp: Date.now() })
})
Bookrmark.remove({}, () => {
    //Bookrmark.create({ username: "kimbo", localTimestamp: Date.now() })
})
Queries.remove({}, () => {
    //Queries.create({ username: "kimbo", localTimestamp: Date.now() })
})
UserData.remove({}, () => {
    //UserData.create({ username: "kimbo", localTimestamp: Date.now() })
})

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const chooseQuery = () => {
    let n = queries.length - 1
    let i = getRandomInt(0, n)
    return queries[i]

}

const chooseDocument = () => {
    let n = documents.length - 1
    let i = getRandomInt(0, n)
    return documents[i]
}

const chooseNewState = (p) => {


    console.log("entro a choose")
    let newState = 'N'
    let isAction = getRandomInt(0, 100)
    if (isAction >= 90) {
        let n = p.options.length - 1
        let i = getRandomInt(0, n)
        newState = p.options[i]

    }
    console.log("newstate", newState)
    p.prevState = p.state
    p.state = newState
    if (p.state !== 'N') {
        console.log(states[newState])
        p.options = [...(states[newState])]
        if (p.state === 'S' && p.prevState !== 'I') {
            p.options = ['Q', 'D']

        }
    }
    console.log("termino choose")
}

const makeAction = (p) => {

    switch (p.state) {
        case 'N':
            break;
        case 'S':
            let visitedlink = {
                username: p.username,
                url: '/serch',
                state: 'PageEnter',
                localTimestamp: Date.now()
            }
            VisitedLink.create(visitedlink)
            if (p.prevState !== 'I') {

                let documentExit = {
                    username: p.username,
                    url: `/page/${p.docId}`,
                    state: 'PageExit',
                    localTimestamp: Date.now()
                }
                VisitedLink.create(documentExit)
            }
            break;
        case 'Q':
           
            let query = chooseQuery()
            let queryObj = {
                username: p.username,
                query: query,
                url: '/search',
                localTimestamp: Date.now()
            }
            Queries.create(queryObj)
            p.query = query
            break;
        case 'D':
            let document = chooseDocument()
            let documentObj = {

                username: p.username,
                localTimestamp: Date.now(),
                url: `/page/${document.id}`,
                state: 'PageEnter'
            }

            let searchObj = {
                username: p.username,
                localTimestamp: Date.now(),
                url: `/search?query${p.query}`,
                state: 'PageExit'
            }
            VisitedLink.create(searchObj)
            VisitedLink.create(documentObj)
            p.doc = document
            break;
        case 'B':
            let bookmark = {

                username: p.username,
                localTimestamp: Date.now(),
                action: 'Bookmark',
                url: `/page/${p.doc.id}`,
                relevant: p.doc.relevant
            }
            Bookrmark.create(bookmark)
            break;
        case 'U':
            let bookmarkObj = {
                username: p.username,
                localTimestamp: Date.now(),
                action: 'Unbookmark',
                url: `/page/${p.doc.id}`,
                relevant: p.doc.relevant
            }
            Bookrmark.create(bookmarkObj)
            break;
        default:
            break;
    }
}

const simulateNeurone = () => {

    participants.map(participant => {
        console.log(participant)
        chooseNewState(participant)
        makeAction(participant)
    })
}

app.get('/init', (req, res, next) => {

    if (sesion == null) {
        sesion = setInterval(() => simulateNeurone(), 1000)
    }
    res.status(200)
})

app.get('/stop', (req, res, next) => {

    clearInterval(sesion)
    sesion = null
    res.status(200)
})

app.listen(port, () => {

    console.log(`app is listening to port ${port}`)
})