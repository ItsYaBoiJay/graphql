import React, { useState } from 'react';
const js = "js"
const go = "go"
const all = "all"
async function getToken(credentials) {

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + window.btoa(credentials.username + ':' + credentials.password)
        },
    }

    const respons = await fetch('https://01.gritlab.ax/api/auth/signin', requestOptions)
    console.log(respons)
    const data = await respons.json()
    console.log(data)
    sessionStorage.setItem('token', data)

    if (respons.status === 200) {
        return 1
    } else {
        return 0
    }
}
let uId
async function getUsername() {
    console.log("getUsername called")
    // query to get username, graphql
    const query = `
    query {
        user {
            login
            id
            firstName
            lastName
            auditRatio
        }
    }
    `

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + sessionStorage.getItem('token')
        },
        body: JSON.stringify({ query })
    }

    const respons = await fetch('https://01.gritlab.ax/api/graphql-engine/v1/graphql', requestOptions)
    console.log(respons)
    const data = await respons.json()
    console.log("data",data.data)

    uId = data.data.user[0].id
    // getTheRest()

    return data
}

async function getTheRest() {
  console.log("getUsername called")
  // query to get username, graphql
  console.log("id",uId)
   const query = `
   query gatherTotalXp($uId: Int!) {
    user: user_by_pk(id: $uId) {
      login
      firstName
      lastName
      auditRatio
      totalUp
      totalDown
    }
    audits: transaction(order_by: {createdAt: asc}, where: {type: {_regex: "up|down"}}) {
      type
      amount
      path
      createdAt
    }
  	xp: transaction(order_by: {createdAt: asc}, where: {
      type: {_eq: "xp"}
    	eventId: {_eq: 20}
    }) {
    		createdAt
        amount
    		path
      }
  	xpJS: transaction(order_by: {createdAt: asc}, where: {
      type: {_eq: "xp"}
    	eventId: {_eq: 37}
    }) {
    		createdAt
        amount
    		path
      }
  	xpGo: transaction(order_by: {createdAt: asc}, where: {
      type: {_eq: "xp"}
    	eventId: {_eq: 10}
    }) {
    		createdAt
        amount
    		path
      }
    xpTotal : transaction_aggregate(
    where: {
      userId: {_eq: $uId}
      type: {_eq: "xp"}
      eventId: {_eq: 20}
    }
  ) {aggregate {sum {amount}}}
    xpJsTotal : transaction_aggregate(
    where: {
      userId: {_eq: $uId}
      type: {_eq: "xp"}
      eventId: {_eq: 37}
    }
  ) {aggregate {sum {amount}}}
    xpGoTotal : transaction_aggregate(
    where: {
      userId: {_eq: $uId}
      type: {_eq: "xp"}
      eventId: {_eq: 10}
    }
  ) {aggregate {sum {amount}}}
  }`
  const variables = {uId: uId}
  const requestOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + sessionStorage.getItem('token')
      },
      body: JSON.stringify({ query, variables })
  }

  const respons = await fetch('https://01.gritlab.ax/api/graphql-engine/v1/graphql', requestOptions)
  console.log(respons)
  const data = await respons.json()
  console.log(data)

  let percent = data.data.user.totalUp / (data.data.user.totalUp + data.data.user.totalDown) * 100

  let el = document.createElement("div")
  el.innerHTML += `<svg height="200" width="200" viewBox="0 0 200 200">
  <circle r="100" cx="100" cy="100" fill="white" />
  <circle r="50" cx="100" cy="100" fill="transparent"
  stroke="tomato"
  stroke-width="100"
  stroke-dasharray="calc(${percent} * 314 / 100) 314"
  transform="rotate(-90) translate(-200)" />
</svg>`
  

//   el.innerHTML += `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="graph" aria-labelledby="title" role="img">
//   <title id="title">A line chart showing some information</title>
// <g class="grid x-grid" id="xGrid">
//   <line x1="90" x2="90" y1="5" y2="371"></line>
// </g>
// <g class="grid y-grid" id="yGrid">
//   <line x1="90" x2="705" y1="370" y2="370"></line>
// </g>
//   <g class="labels x-labels">
//   <text x="100" y="400">2008</text>
//   <text x="246" y="400">2009</text>
//   <text x="392" y="400">2010</text>
//   <text x="538" y="400">2011</text>
//   <text x="684" y="400">2012</text>
//   <text x="400" y="440" class="label-title">Time wasted</text>
// </g>
// <g class="labels y-labels">
//   <text x="80" y="15">15</text>
//   <text x="80" y="131">10</text>
//   <text x="80" y="248">5</text>
//   <text x="80" y="373">0</text>
//   <text x="50" y="200" class="label-title">Total xp</text>
// </g>
// <g class="data" data-setname="Our first data set">
//   <circle cx="90" cy="192" data-value="7.2" r="4"></circle>
//   <circle cx="240" cy="141" data-value="8.1" r="4"></circle>
//   <circle cx="388" cy="179" data-value="7.7" r="4"></circle>
//   <circle cx="531" cy="200" data-value="6.8" r="4"></circle>
//   <circle cx="677" cy="104" data-value="6.7" r="4"></circle>
// </g>
// </svg>`
console.log("dajs",data.data.xp)
el.append(createLineChart(data.data.xp, data.data.xpTotal.aggregate.sum.amount, "all"), createLineChart(data.data.xpJS, data.data.xpJsTotal.aggregate.sum.amount, "js"), createLineChart(data.data.xpGo, data.data.xpGoTotal.aggregate.sum.amount, "go"))
//let all = document.createElement("button")
//let go = document.createElement("button")
//let js = document.createElement("button")


//all.innerHTML += "Projects"
//all.setAttribute("onclick", `showGraph("all")`)
//go.innerHTML += "Go piscine"
//go.setAttribute("onclick", `showGraph("go")`)
//js.innerHTML += "Js piscine"
//js.setAttribute("onclick", `showGraph("js")`)
//el.append(all,go,js)
document.body.appendChild(el)
showGraph("all")
// return (<button onClick={showGraph("all")}>
//   Click me
// </button>)
// document.getElementsByClassName("all")[0].onclick = showGraph("all")
// document.getElementsByClassName("go")[0].onclick = showGraph("go")
// document.getElementsByClassName("js")[0].onclick = showGraph("js")

}
function showGraph(graph = "all") {
  console.log("graph chosen", graph)
  document.getElementsByClassName("all")[0].style.display = "none"
  document.getElementsByClassName("go")[0].style.display = "none"
  document.getElementsByClassName("js")[0].style.display = "none"
  document.getElementsByClassName(graph)[0].style.display = "block"
  console.log("something happened")
}

function createLineChart(dataArray, xpTotal, name) {
  console.log("should be a number", xpTotal)
  let yearMin = new Date(dataArray[0].createdAt)
  let yearMax = new Date(dataArray[dataArray.length-1].createdAt)
  let intervalLength = (yearMax.getTime() - yearMin.getTime()) / 4
  let xpMin = 0
  console.log("xptotal", xpTotal)
  let xpMax = xpTotal /* dataArray[dataArray.length-1].amount */
  let el = document.createElement("svg")
  el.innerHTML += `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="graph ${name}" aria-labelledby="title" role="img">
<g class="grid x-grid" id="xGrid">
  <line x1="90" x2="90" y1="5" y2="371"></line>
</g>
<g class="grid y-grid" id="yGrid">
  <line x1="90" x2="705" y1="370" y2="370"></line>
</g>`
// console.log("this better work", yearMax.getTime() - yearMin.getTime())
let year = document.createElement("g")
let xp = document.createElement("g")
year.classList.add("labels", "x-labels")
xp.classList.add("labels","y-labels")
for (let i = 0; i < 5; i++) {
    let temp = new Date(yearMin.getTime() + (intervalLength * i))
    console.log("date", temp.getDay + "/" + temp.getMonth + 1)
    year.innerHTML += `<text y="400" x="${130 + (150 * i)}">${temp.getDate() + "/" + (temp.getMonth() + 1) + "-" + temp.getFullYear()}</text`
    xp.innerHTML += `<text x=80 y="${375 - (90 * i)/* 15 + (90 * i) */}">${xpMin + ((xpMax / 4) * i)}</text>`
 }

year.innerHTML += `<text x="400" y="440" class="label-title">Time wasted</text>`
// //xp.innerHTML += `<text x="50" y="200" class="label-title">Total xp</text>`
el.firstChild.innerHTML += `<g class="labels x-labels">` + year.innerHTML + `</g>`
el.firstChild.innerHTML += `<g class="labels x-labels">` + xp.innerHTML + `</g>`
// //el.firstChild.appendChild(xp)
let points = mapOutData(xpMin, xpMax, yearMin.getTime(), yearMax.getTime(), dataArray)
// console.log(points)

// el.firstChild.innerHTML += `<g class="labels x-labels">
//   <text x="100" y="400">2008</text>
//   <text x="246" y="400">2009</text>
//   <text x="392" y="400">2010</text>
//   <text x="538" y="400">2011</text>
//   <text x="684" y="400">2012</text>
//   <text x="400" y="440" class="label-title">Time wasted</text>
// </g>`

el.firstChild.innerHTML += `<g class="first-set points data">` + points.innerHTML + `</g>`
// el.firstChild.innerHTML += `<g class="data" data-setname="Our first data set">
// <circle cx="90" cy="192" data-value="7.2" r="4"></circle>
// <circle cx="240" cy="141" data-value="8.1" r="4"></circle>
// <circle cx="388" cy="179" data-value="7.7" r="4"></circle>
// <circle cx="531" cy="200" data-value="6.8" r="4"></circle>
// <circle cx="677" cy="104" data-value="6.7" r="4"></circle>
// </g>`
return el.firstChild
}

function mapOutData(minY, maxY, minX, maxX, arr) {
  let el = document.createElement("g")
  let lineYmin = 5
  let lineYMax = 371
  let lineXmin = 90
  //let lineXMax = 705
  let lineXlen = 615
  let lineYlen = 366
  let totalXp = 0
  let dtest = new Date(arr[arr.length -1].createdAt).getTime()
  console.log("testo","A", dtest, minX, maxX, maxX - minX, "B", (dtest - minX) / (maxX - minX))
  for (let i = 0; i < arr.length; i++) {
    let xp = arr[i].amount
    totalXp += xp
    let yCord = lineYMax - (((lineYlen / 100) * ((totalXp / maxY) * 100)) + lineYmin)

    let date = new Date(arr[i].createdAt).getTime() - minX
    let xCord = ((lineXlen) / 100) * ((date / (maxX - minX)) * 100) + lineXmin
    let el2 = document.createElement("g")
    el2.classList.add("bleh")
    el2.dataset.hover = arr[i].path
    el2.innerHTML += `
    <title>Xp gain:${xp}
Date:${arr[i].createdAt}
Project:${arr[i].path}</title>
    <circle cx="${xCord}" cy="${yCord}" r="4"></circle>`
    el.appendChild(el2)
    //temp += ` <circle cx="${xCord}" cy="${yCord}" r="4"> <div class="bleh" data-xp="${xp}" data-hover="${arr[i].path}" data-time="${arr[i].createdAt}"></div></circle> `
  }
  console.log("total", totalXp)
  //el.innerHTML += temp

  el.classList.add("first-set", "points", "data")
  return el
}


function logout() {
    sessionStorage.removeItem('token');
    window.location.reload();
}

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    // perform login logic here
    const credentials = { username, password };
    let response = await getToken(credentials);
    console.log(response)
    if (response === 1) {
        let username = await getUsername();
        console.log(username)
        setUserData(username)
        getTheRest()
      //  let auditlicious = await getTheRest()
      //   console.log("backstreet boys for life", auditlicious)
      //   console.log("TELL ME WHY", auditlicious.data.user.totalUp)
      //   console.log("AINT NOTHING BUT A HEART ACHE", auditlicious.data.user.totalDown)
      //   let procent = Math.round(auditlicious.data.user.totalUp / auditlicious.data.user.totalDown * 10 ) /10
      //   console.log(procent)
    } else { 
        setError("You don't know your own password??????!?!!?!?!??!??!??")
        console.log("Login failed")
        setTimeout(() => {
            setError('');
          }, 3000); // hide the error message after 5 seconds
        }
  }

  return (
    <>
      {userData ? (
        <div>
          <p>Welcome!</p>
          <p>Name: {userData.data.user[0].firstName} {userData.data.user[0].lastName}</p>
          <p>Username: {userData.data.user[0].login}</p>
          <p>Id: {userData.data.user[0].id}</p>
          <p>Audit Ratio: {Math.round(userData.data.user[0].auditRatio * 10) / 10}</p>
          <button onClick={logout}>Logout</button>
          <button onClick={getTheRest}>more shit</button>
          <button onClick={() => showGraph("all")}>Projects</button>
          <button onClick={() => showGraph("go")}>Go Piscine</button>
          <button onClick={() => showGraph("js")}>Js Piscine</button>
        </div>
      ) : (
        <div>
          <h2>Login Page</h2>
          <br />
          <div className="login">
            <form id="login">
              <label>
                <b>User Name</b>
              </label>
              <input
                type="text"
                name="Uname"
                id="Uname"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <br />
              <br />
              <label>
                <b>Password</b>
              </label>
              <input
                type="password"
                name="Pass"
                id="Pass"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <br />
              <br />
              <input type="button" name="log" id="log" value="Log In Here" onClick={handleLogin} />
              <br />
              <br />
              <input
                type="checkbox"
                id="check"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
              <br />
              <br />
            </form>
          </div>
        </div>
      )}
      {error ? (<p>{error}</p>): null}
    </>
  );
}


export default LoginPage;