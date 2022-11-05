const diff = require('dialogflow-fulfillment');
const express = require('express');
const mysql = require('mysql')
var bodyParser = require('body-parser')
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

//current time data
const weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
var date = new Date();




// database connection
const dbcon = () => {
  var con = mysql.createConnection({
    host:'sql204.epizy.com',
    user: 'epiz_32935678',
    password: 'Tej@s712',
    database: 'chatbot'
  });
  return new Promise((resolve, reject) => {
    con.connect();
    console.log("successed databae connection");
    resolve(con);
  })
}
// 



// get shift number
const getShift = (con, sir) => {
  return new Promise((resolve, reject) => {
    var sql = `SELECT * FROM shift WHERE name=?`;
    var exesql = con.query(sql, [sir], (error, result) => {

      // if (error) throw error;
      console.log(result);
      if (result.length == 0) {
        resolve(result);
      } else {
        let ress = JSON.stringify(result[0].shift);
        let shift = `shift${ress}`;
        console.log(shift + "shifht function ");
        resolve(shift);
      }


    })
  })
};
//


// get location

const getLocation = (con, sir, shift, day,time) => {
  return new Promise((resolve, reject) => {
    console.log(time+"get location time");
    var sql = `SELECT *
    FROM ${day}
    LEFT JOIN ${shift}
    ON ${day}.slot_id = ${shift}.id
    where name=? AND start<=? AND end>=?`;
    var exesql = con.query(sql, [sir, time, time], (error, result) => {
      console.log(result)
      if(result==undefined){
        console.log("nnnkjhkghghgvjmy");
        resolve(result);
      }
      else if (result.length == 0) {
        console.log("sir location nathi");
        resolve(result);
      } else {
        let ress = JSON.stringify(result[0].class);
        console.log(ress);
        resolve(ress);
      }
    })
  })
};
//

// send location

const sentLocation = async (agent) => {
  var day = weekday[date.getDay()];
  var time = new Date().toLocaleTimeString();
  let message;
  const con = await dbcon();
  let name = agent.parameters['person'].name;
  let sir = name.toLowerCase();
  console.log(sir);
  let shift = await getShift(con, sir);
  if (shift.length == 0) {
    message = "please enter valid name";
  } else {
    console.log(shift);
    let location = await getLocation(con, name, shift, day,time);
    console.log(location);
    if(location==undefined){
      message = "data is invailid";
    }else
    if (location.length == 0) {
      message = "gharrrrrrrreeeeeeee"
    } else {
      message = location;
    }

  }
  agent.add(`${message}`);

}

//find free lecture
async function gettime(agent) {
  let message;
  var name = agent.context.get('await_sir').parameters['person'].name;
  let dayNo = agent.context.get('await_day').parameters['weekday'];

  let timee = agent.query;
  let datte  = new Date(timee);
  // let newtime  = new Date(timee);
  console.log(datte);
  var inday = weekday[dayNo];
  console.log(name);
  console.log(inday);
    const con = await dbcon();
    let sir = name.toLowerCase();
    console.log(sir);
    let shift = await getShift(con,sir);
   if (shift.length == 0) {
      message = "please enter valid name";
    } else {
      console.log(shift + "own function shift ");
      let location = await getLocation(con, name, shift,inday,timee);
      if(location==undefined){
        message = "data is invailid";
      }else
      if (location.length == 0) {
        message = "gharrrrrrrreeeeeeee"
      } else {
        message = location;
      }

    }
    agent.add(`${message}`);
}


//

// start webhook
app.get('/', (req, res) => {
  res.send('helloo');
});
app.post('/', express.json(), (req, res) => {
  const agent = new diff.WebhookClient({
    request: req,
    response: res
  });
  function demo(agent) {
    agent.add("live");
  }

  console.log(agent.query);

  var intentMap = new Map();
  intentMap.set('try', demo);
  intentMap.set('sir', sentLocation);
  intentMap.set('gettime', gettime);


  agent.handleRequest(intentMap);
});


app.listen(3333, () => console.log("server start"));