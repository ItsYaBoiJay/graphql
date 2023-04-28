import React, { useState } from 'react';

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
el.appendChild(createLineChart(data.data.xp))
document.body.appendChild(el)

}

function createLineChart(dataArray) {
  let yearMin = [dataArray[0].createdAt]
  let yearMax = [dataArray[dataArray.length-1].amount]
  let xpMin = 0
  let xpMax = dataArray[dataArray.length-1].amount
  let el = document.createElement("svg")
  el.innerHTML += `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="graph" aria-labelledby="title" role="img">
  <title id="title">A line chart showing some information</title>
<g class="grid x-grid" id="xGrid">
  <line x1="90" x2="90" y1="5" y2="371"></line>
</g>
<g class="grid y-grid" id="yGrid">
  <line x1="90" x2="705" y1="370" y2="370"></line>
</g>`
let year = document.createElement("g")
let xp = document.createElement("g")
year.classList.add("labels", "x-labels")
xp.classList.add("labels","y-labels")
for (let i = 0; i < 5; i++) {
  year.innerHTML += `<text y="400" x="${100 + (100 * i)}">${yearMin + ((yearMax / 5) * i)}</text`
  xp.innerHTML += `<text x=80 y="${15 + (115 * i)}">${xpMin + ((xpMax / 5) * i)}</text>`
}
year.innerHTML += `<text x="400" y="440" class="label-title">Time wasted</text>`
xp.innerHTML += `<text x="50" y="200" class="label-title">Total xp</text>`
el.firstChild.appendChild(year)
el.firstChild.appendChild(xp)
el.innerHTML += `<g class="data" data-setname="Our first data set">
<circle cx="90" cy="192" data-value="7.2" r="4"></circle>
<circle cx="240" cy="141" data-value="8.1" r="4"></circle>
<circle cx="388" cy="179" data-value="7.7" r="4"></circle>
<circle cx="531" cy="200" data-value="6.8" r="4"></circle>
<circle cx="677" cy="104" data-value="6.7" r="4"></circle>
</g>`
return el.firstChild
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