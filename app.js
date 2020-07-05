import express from 'express'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'

dotenv.config()

const app = express()
const port = process.env.PORT || 4002
const db_name=process.env.DB_NAME || "test"
const db_username=process.env.DB_USERNAME || "test"
const db_password=process.env.DB_PASSWORD || "test"
const participant_number=process.env.PARTICIPANT_NUMBER || 20

const documents = [{ id: "d1", relevant: true }, { id: "d2", relevant: false }, { id: "d3", relevant: false }
    , { id: "d4", relevant: true }, { id: "d5", relevant: false }, { id: "d6", relevant: false },
{ id: "d7", relevant: false }, { id: "d8", relevant: false }, { id: "d9", relevant: false },
{ id: "d10", relevant: false }, { id: "d11", relevant: false }, { id: "d12", relevant: true }]


const queries = [
    "qué es una red neuronal", "que es la computación cuántica", "qué es machinelearning"
    , "bosques finlandeces", "que es netflix", "cuál es el mejor libro",
    "cuál es el país más grande de el mundo", "google"
]

const states = {
    'S': ['W'], 'Q': ['D', 'W'], 'D': ['S', 'B'],
    'B': ['S', 'U'], 'U': ['S', 'B']
}

//Numero de participantes a simular. $5 Actualmente
const participants = [...Array(Number(participant_number)).keys()].map(e => {
    return {
        username: "participant" + e,
        state: "I",
        prevState: "",
        doc: "",
        query: "",
        writingQuery: "",
        index: 0,
        options: ['N', 'S']
    }

})
let sesion = null

// console.log(documents)
// console.log(queries)
// console.log(states)
// console.log(participants)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Credenciales base de datos mongodb://user:password@host:port/db_name
const host = process.env.MONGO_DB || 'localhost'
mongoose.connect(`mongodb://${db_username}:${db_password}@${host}:27017/${db_name}`)
    .then(() => { // if all is ok we will be here
        // console.log('Start');
    })
    .catch(err => { // if error we will be here
        // console.error('App starting error:', err.stack);
        process.exit(1);
    });
mongoose.set('debug', false);


import './models/bookmarks'
import './models/queries'
import './models/userdata'
import './models/visitedLinks'
import './models/keystrokes'

const VisitedLink = mongoose.model('VisitedLink')
const Bookrmark = mongoose.model('Bookmark')
const Queries = mongoose.model('Queries')
const UserData = mongoose.model('UserData')
const Keystrokes = mongoose.model('Keystrokes')

//Limpiar db al iniciar programa
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

    UserData.insertMany(participants)
    //UserData.create({ username: "kimbo", localTimestamp: Date.now() })
})
Keystrokes.remove({}, () => {


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


    // console.log("entro a choose")
    let newState = 'N'
    let isAction = getRandomInt(0, 100)
    if (p.state === 'W') {

        if (p.query === p.writingQuery) {

            newState = 'Q'
        } else {

            newState = 'W'
        }
    }
    else if (isAction >= 90) {
        let n = p.options.length - 1
        let i = getRandomInt(0, n)
        newState = p.options[i]

    }
    // console.log("newstate", newState)
    p.prevState = p.state === 'N' ? p.prevState : p.state
    p.state = newState
    if (p.state !== 'N' && p.state !== 'W') {
        // console.log(states[newState])
        p.options = [...(states[newState])]
        if (p.state === 'S' && p.prevState !== 'I') {
            p.options = ['W', 'D']

        }
    }
    // console.log("termino choose")
}

const makeAction = (p) => {

    switch (p.state) {
        case 'N':
            break;
        case 'S':
            if(p.prevState==='I'){
                let initLink={
                    username: p.username,
                    url: "/tutorial?stage=search",
                    state: 'PageExit',
                    localTimestamp: Date.now()

                }
                VisitedLink.create(initLink)
            }
            let visitedlink = {
                username: p.username,
                url: '/search',
                state: 'PageEnter',
                localTimestamp: Date.now()
            }
            VisitedLink.create(visitedlink)
            if (p.prevState !== 'I') {

                let documentExit = {
                    username: p.username,
                    url: `/page/${p.doc.id}`,
                    state: 'PageExit',
                    localTimestamp: Date.now()
                }
                VisitedLink.create(documentExit)
            }
            break;
        case 'W':
            if (p.prevState !== 'W') {
                p.query = chooseQuery()
                p.index = 0
                p.writingQuery = ""
            }
            let index = p.index

            let key = p.query.charAt(index)
            // console.log(key)
            let keyCode = key.toUpperCase().charCodeAt(0)
            if(getRandomInt(0, 100)<=10){

                keyCode=8
                p.writingQuery=p.writingQuery.substring(0,p.writingQuery.length-1)
                index=index!==0?index-1:0
                p.index=index
            } else{    
                index++
                p.index = index
                p.writingQuery = p.writingQuery + key
            }
           // console.log(keyCode)
            let keyStroke = {

                keyCode: keyCode,
                username: p.username,
                url: "/search",
                localTimestamp: Date.now()
            }
            Keystrokes.create(keyStroke)

            break;

        case 'Q':
            let keyStrokeF = {
                keyCode: 13,
                username: p.username,
                url: "/search",
                localTimestamp: Date.now()
            }
            Keystrokes.create(keyStrokeF)
            let query = p.query
            let queryObj = {
                username: p.username,
                query: query,
                url: '/search',
                localTimestamp: Date.now()
            }
            Queries.create(queryObj)
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
                relevant: p.doc.relevant,
                userMade: true
            }
            Bookrmark.create(bookmark)
            break;
        case 'U':
            let bookmarkObj = {
                username: p.username,
                localTimestamp: Date.now(),
                action: 'Unbookmark',
                url: `/page/${p.doc.id}`,
                relevant: p.doc.relevant,
                userMade: true
            }
            Bookrmark.create(bookmarkObj)
            break;
        default:
            break;
    }
}

const simulateNeurone = () => {
    participants.map(participant => {
        // console.log(participant)
        chooseNewState(participant)
        makeAction(participant)
    })
}

//Iniciar simulación
app.get('/init', (req, res, next) => {

    if (sesion == null) {
        sesion = setInterval(() => simulateNeurone(), 500)
    }
    res.status(200).json("ok")
})

//Parar simulación
app.get('/stop', (req, res, next) => {

    clearInterval(sesion)
    sesion = null
    res.status(200).json("ok")
})

//npm run dev
app.listen(port, () => {

    // console.log(`app is listening to port ${port}`)
})
