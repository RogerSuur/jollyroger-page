import { XpQuery,userQuery, userProgressesQuery, AuditsQuery, levelQuery } from "./queries.js";
let jwt_token = '';
var results_username = document.getElementById("results_username");
var results_total_xp = document.getElementById("results_total_xp");
var results_user_level = document.getElementById("results_user_level");
const tasksGraph = document.getElementById('tasks');
const auditGraphs = document.getElementById('audit-ratio');
const results = document.getElementById('results')

const loginForm = document.getElementById("login-form");
const logoutForm = document.getElementById("logout");
const inputBox = document.getElementById("box");
document.getElementById("login-form").addEventListener("submit", loginUser);
document.getElementById("logout").addEventListener("click", logoutUser);


function loginUser(event) {
  event.preventDefault();
	var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;

const headers = new Headers({
  "Content-Type": "application/json",
  "Authorization": "Basic " + btoa(`${username}:${password}`)
});

const options = {
  method: "GET",
  headers: headers,
};

fetch(`https://get-my-xp.herokuapp.com/proxy`,options)
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Error: " + response.statusText);
    }
  })
  .then(data => {
    jwt_token = data.token;
    alert("successfully logged in!")
    logoutForm.style.display = "block"
    results.style.display = 'block'
    inputBox.style.display = 'none'
    const encodedCredentials = jwt_token.split('.')[1];
    const decodedCredentials = JSON.parse(atob(encodedCredentials));
    const userId = decodedCredentials['https://hasura.io/jwt/claims']['x-hasura-user-id'];
    getUserData(userId)
  })
  .catch(error => {
   alert("Please check that the credentials are valid")
    console.log(error);
  });

}

let MakeAPIRequest = async (query) => {
    try {
        const response = await fetch("https://01.kood.tech/api/graphql-engine/v1/graphql", {
            method: "POST",
            headers: { "Content-Type": "application/json" ,
            'Authorization': `Bearer ${jwt_token}`},
            body: JSON.stringify({
                query: query
            })
        });
        const data = response.json();
        return data
    } catch (error) {
        return error
    }
}

async function getUserData(userId) {
  results_username.textContent = await getUserName(userId)
  var rawTransactionData =  await getUserXp(userId)
  var userTransactions = cleanRawTransactionData(rawTransactionData)
  var userProgress = await getUserProgress(userId)
  const validTransactions = compareProgressAndTransaction(userTransactions, userProgress)
  const userXp = calculateXp(validTransactions)
  results_total_xp.textContent = Math.round((userXp/1000) * 100) / 100
  const auditsDown = await getAudits(userId, "down")
  const auditsUp = await getAudits(userId, "up")
  const level = await getLevel(userId)
  results_user_level.textContent = level

  displayAuditsGraph(auditsUp,auditsDown)
  displayTasksGraph(validTransactions)
}

async function getUserName (user) {
  const query = userQuery(user)
  let username
  //let request = await MakeAPIRequest(userQuery(user))
  try {
      const data = await MakeAPIRequest(query);
      const userData = data["data"]["user"][0];
      username = userData.login
    } catch (error) {
      console.error(error);
    }
  return username
}


async function getUserXp (user) {
  //const query = XpQuery(user)
  let offset = 0
    let transactions = []
    
    while (true) {
      let query = XpQuery(user, offset);
      let data = await MakeAPIRequest(query);
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      
      let userTransactions = data.data.user[0].transactions
      
      if (userTransactions.length === 0) {
               break;
      }
      
      transactions.push(...userTransactions);
      offset += userTransactions.length;
    }
    return transactions;
}


async function getAudits(user, type) {
  let offset = 0
  let received = []
  
  while (true) {
    let query = AuditsQuery(type, user, offset);
    let data = await MakeAPIRequest(query);
    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    
    let userreceived = data.data.user[0].transactions
    
    if (userreceived.length === 0) {
             break;
    }
    
    received.push(...userreceived);
    offset += userreceived.length;
  }

  var xpSum = calculateAudits(received)
  return xpSum
}

//Returns user level
async function getLevel(username) {
  let query = levelQuery(username);
  let data = await MakeAPIRequest(query);
  if (data.errors) {
    throw new Error(data.errors[0].message);
  }

  let userTransactions = data.data.user[0].transactions;
  
  if (userTransactions.length === 0) {
    return null;
  }

  let level = userTransactions[0];
  return level.amount
}


function calculateAudits(received) {
  let xpSum = 0
    received.forEach(el => {
       xpSum += el.amount;
    });
    return Math.round(xpSum)
}

function calculateXp(transactions) {
  let totalXp = 0;
  for (let path in transactions) {
      totalXp += transactions[path]
  }
  return totalXp
}

function cleanRawTransactionData(userTransactions) {
    const excludedPaths = ["/johvi/div-01/piscine-js-2-old/", "/johvi/piscine-go/", "/johvi/div-01/rust/"];
   
    let pathToXp = {};
  
    for (let transaction of userTransactions) {
      if (excludedPaths.some(path => transaction.path.startsWith(path))) {
        continue;
      }
      let path = transaction.path;
      //let xp = transaction.amount;
  
      let xp = Math.round((transaction.amount/1000) * 10) / 10;

      if (xp >= 9.2 && xp < 9.3) {
        xp = 9.2;
      } else if (xp >= 24.5 && xp < 24.6) {
        xp = 24.5;
      } else if (xp >= 76.3 && xp < 76.4) {
        xp = 76.3;
      } else if (xp >= 34.2 && xp < 34.4) {
        xp = 34.3;
      } else {
        xp = Math.round(xp);
      }
  
      if (path === "/johvi/div-01" && xp === 390) {
          pathToXp[path+"/rust"] = xp;
          continue
      }
  
      if (transaction.path.startsWith("/johvi/div-01")) {
        if (!(path in pathToXp) || xp > pathToXp[path])  {
            if (xp > 4.9) {
             pathToXp[path] = xp;
            }
            }
      }
    }
    return  pathToXp
}

async function getUserProgress(user) {
    let offset = 0
    let projects = []
    
    while (true) {
      let query = userProgressesQuery(user, offset);
      let data = await MakeAPIRequest(query);
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      
      let userprojects = data.data.user[0].progresses
      
      if (userprojects.length === 0) {
               break;
      }
      
      projects.push(...userprojects);
      offset += userprojects.length;
    }
    return projects;
}

function compareProgressAndTransaction(transactions, progresses) {

  const filteredPaths = {}
  Object.keys(transactions).filter((path) => {
    progresses.forEach(el => {
      if(Object.values(el).includes(path) || path === "/johvi/div-01"){
        const taskName = path.split('/').pop()
        filteredPaths[taskName] = transactions[path]
      }
    });
  });

  return filteredPaths
}

function logoutUser() {
  alert('You have been logged out');
  jwt_token = '';
  console.log('jwt_token', jwt_token);
  
  logoutForm.style.display = "none"
  results.style.display = "none"
  inputBox.style.display = 'flex'
  
}

function displayAuditsGraph(completed, received) {

  const element = document.getElementById('audit-ratio')
  element.innerHTML = ''
  let data = {
      header: ["Name", "XP"],
      rows: [
          ["Received", Math.round(received)],
          ["Done", Math.round(completed)],
      ]};

  // create the chart
  let chart = anychart.bar();

  // add data
  chart.data(data);

  // set the chart title
  chart.title("Audit ratio");
  // draw
  chart.container("audit-ratio");
  chart.draw();
  
  document.querySelector('.anychart-credits').remove();
}


function displayTasksGraph(divXP) {

  anychart.onDocumentReady(function () {
  const element = document.getElementById('tasks')
  element.innerHTML = ''


  let data = {
      header: ["Name", "XP"],
      rows: Object.entries(divXP),
  };

  // create the chart
  let chart = anychart.bar();

  // add data
  chart.data(data);

  // Get the number of keys in the data object
  var numRows = Object.keys(data.rows).length;

  // Set a CSS variable to the number of keys
  document.documentElement.style.setProperty('--num-keys', numRows);

  // set the chart title
  chart.title("Completed projects");

  // draw
  chart.container("tasks");
  chart.draw();
  document.querySelector('.anychart-credits').remove();
  });
}
