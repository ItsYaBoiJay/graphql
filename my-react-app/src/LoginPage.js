
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
    console.log(data)

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