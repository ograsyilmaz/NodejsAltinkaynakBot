const Telegraf = require('telegraf');
const soapRequest = require('easy-soap-request');
const fs = require('fs');
var convert = require('xml-js');
var xml2js = require('xml2js');







const url = "http://data.altinkaynak.com/DataService.asmx";


const sampleHeaders = {
    'Content-Type': 'text/xml;charset=UTF-8',
    'soapAction': 'http://data.altinkaynak.com/GetGold',
};

var rest;
const xml = fs.readFileSync('./xml/dolar.xml', 'utf-8');
async function makeRequest() {
    const {
        response
    } = await soapRequest({
        url: url,
        headers: sampleHeaders,
        xml: xml,
        timeout: 1000
    });
    const {
        headers,
        body,
        statusCode
    } = response;





    var options = {

        elementNameFn: function (val) {

            if (val.includes("soap:")) {
                val = val.substr(5);
            }

            console.log(val);
            return val
        }
    }
    var result = await convert.xml2js(body, options);



    var xmlresult = JSON.stringify(result.elements[0].elements[0].elements[0].elements[0].elements[0].text);
    var finaldeger = "";
    if (xmlresult.includes("xml version")) {
        xmlresult = xmlresult.substr(43);
    }
    var xmldeger = (xmlresult.length) - 1;
    if (xmlresult[xmldeger].charCodeAt(0) === 34) {
        xmlresult = xmlresult.substring(0, xmldeger);

    }

    if (xmlresult.includes("xmlns:xsd=") === true) {
        console.log("girdi");
        finaldeger += xmlresult.substr(0, 7);
        finaldeger += xmlresult.substr(110);
    }


    var finaldeger1;
    await xml2js.parseString(finaldeger, function (err, result) {
        finaldeger1 = result;
    })

    // for (let index = 0; index < finaldeger1.Kurlar.Kur.length - 1; index++) {
    //     console.log("---------------------------------------------------------------------------");
    //     console.log(finaldeger1.Kurlar.Kur[index].Aciklama[0]);
    //     console.log(finaldeger1.Kurlar.Kur[index].Alis[0]);
    //     console.log(finaldeger1.Kurlar.Kur[index].GuncellenmeZamani[0]);
    //     console.log(finaldeger1.Kurlar.Kur[index].Kod[0]);
    //     console.log(finaldeger1.Kurlar.Kur[index].Satis[0]);
    //     console.log("---------------------------------------------------------------------------");

    // }

    var gramaltin = {
        adi: finaldeger1.Kurlar.Kur[19].Aciklama[0],
        satis: finaldeger1.Kurlar.Kur[19].Satis[0],
        alis: finaldeger1.Kurlar.Kur[19].Alis[0],
        tarih: finaldeger1.Kurlar.Kur[19].GuncellenmeZamani[0]
    };

    return gramaltin;
};



console.log("çalıştım");
var botcode ="" ;
const bot = new Telegraf(botcode)
bot.start((ctx) => ctx.reply('Welcome ben yılmaz'))
bot.help((ctx) => ctx.reply('Send me a sticker'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('merhabayilmaz'))
bot.hears('/altin', (ctx) => {
    var gramaltin = makeRequest().then((x) => {
        console.log(`${x.adi}    ${x.satis}      ${x.alis}`);
        ctx.reply(` ${x.adi} = Satiş: ${x.satis} -- Aliş :${x.alis} Zaman :${x.tarih}`)
    })

})
bot.launch()