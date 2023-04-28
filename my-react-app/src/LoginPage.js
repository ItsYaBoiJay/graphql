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
    xp : transaction_aggregate(
    where: {
      userId: {_eq: 1429}
      type: {_eq: "xp"}
      eventId: {_eq: 20}
    }
  ) {aggregate {sum {amount}}}
    xpJs : transaction_aggregate(
    where: {
      userId: {_eq: 1429}
      type: {_eq: "xp"}
      eventId: {_eq: 37}
    }
  ) {aggregate {sum {amount}}}
    xpGo : transaction_aggregate(
    where: {
      userId: {_eq: 1429}
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

  let el = document.createElement("svg")
  el.innerHTML += `<svg height="200" width="200" viewBox="0 0 200 200">
  <circle r="100" cx="100" cy="100" fill="white" />
  <circle r="50" cx="100" cy="100" fill="transparent"
  stroke="tomato"
  stroke-width="100"
  stroke-dasharray="calc(${percent} * 314 / 100) 314"
  transform="rotate(-90) translate(-200)" />
</svg>`
  document.body.appendChild(el)
return data
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