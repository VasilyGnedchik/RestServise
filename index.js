'use strict';
// Modules initiation
const hapi = require('@hapi/hapi')
const PDFDocument = require('pdfkit')
const fetch = require('node-fetch')
const htmlparser2 = require("htmlparser2")

// Global functions
const getText = html => {

    const handler = new htmlparser2.DomHandler();
    const parser = new htmlparser2.Parser(handler);

    parser.write(html);
    parser.end();
    const elems = htmlparser2.DomUtils.getElementsByTagName('body', handler.root)
    if(elems.length > 0){
        let bodyTextContent = htmlparser2.DomUtils.innerText(elems[0])
        bodyTextContent = bodyTextContent.replace(/(\r\n|\n|\r|\W|[0-9]|\s\s+)/gm, " ")
        bodyTextContent = bodyTextContent.replace(/\s\s+/g, " ")
        bodyTextContent=bodyTextContent.replace("_","")
        return bodyTextContent
    }
    else{
        return ''
    }

}

const getThreeLongestWordsArray = async (payload) =>{

    let arr = new Array()
    let urls = payload
    let bodyTextContent
    let requests = urls.map(url => fetch(url));
    let k = 0
    await Promise.all(requests)
        .then(responses => Promise.all(responses.map(r => r.text())))
        .then(responsesTexts => {
            responsesTexts.forEach(responseText => {

                bodyTextContent = getText(responseText)
                if(bodyTextContent===''){
                    let result = [payload[k],'Нет данных для анализа, в ответе не было тега body']
                    arr.push(result)
                    k = k + 1
                }
                else{
                    let words = bodyTextContent.split(' ')
                    let wordsLongerThenThreeChars = new Array()
                    words.forEach(word=>{
                        if(word.length >=4){
                            wordsLongerThenThreeChars.push(word)
                        }
                    })
                    let wordCounts = { }
                    for(var i = 0; i < wordsLongerThenThreeChars.length; i++)
                        wordCounts[wordsLongerThenThreeChars[i].toLowerCase()] = (wordCounts[wordsLongerThenThreeChars[i].toLowerCase()] || 0) + 1
                    let sortable = [];
                    for (var word in wordCounts) {
                        sortable.push([word, wordCounts[word]]);
                    }
                    sortable.sort(function(a, b) {
                        return a[1] - b[1];
                    })
                    sortable.reverse()
                    let result = [payload[k],sortable[0][0],sortable[1][0],sortable[2][0]]
                    arr.push(result)
                    k = k + 1
                }
            })
        })

return arr
}

const createPDF = async (ThreeLongestWordsArray) => {
    let doc = new PDFDocument({ margin: 30, size: 'A4' })

    doc.font('fonts/Arial.ttf').fontSize(25)

    ThreeLongestWordsArray.forEach( ThreeLongestWords => {

        if(ThreeLongestWords.length == 2){
            doc.moveDown()
                .fillColor('blue')
                .text(ThreeLongestWords[0], { link: ThreeLongestWords[0], underline: true})
                .fillColor('black')
                .text(ThreeLongestWords[1])
        }
        else{
          doc.moveDown()
            .fillColor('blue')
            .text(ThreeLongestWords[0], {link: ThreeLongestWords[0], underline: true})
            .fillColor('black')
            .text(ThreeLongestWords[1] + ' | ' + ThreeLongestWords[2] + ' | ' +ThreeLongestWords[3])
            }
        })

    doc.end()
    return doc
}

// Server initiation function
const init = async ()=>{

    const server = new hapi.server({
        port:8080,
        host:'localhost'
    })

    await server.register({
        plugin: require('hapi-response-utilities')
    })

    server.route({
        method:'POST',
        path:'/',
        handler: async (request,h)=>{
            const ThreeLongestWordsArray = await getThreeLongestWordsArray(request.payload)
            const PDF = await createPDF(ThreeLongestWordsArray)
            return h.pdf(PDF, 'MostFrequentWords.pdf')
        }
    })

    await server.start((err)=>{
        if(err){
            throw err
        }
    })

    console.log(`Server started at:${server.info.uri}`)
}

init()