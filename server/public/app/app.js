let jwt_token = "";

function loginUser(event) {
  event.preventDefault();
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;

  const headers = new Headers({
    "Content-Type": "application/json",
    Authorization: "Basic " + btoa(`${username}:${password}`),
  });

  const options = {
    method: "GET",
    headers: headers,
  };

  fetch(`https://get-my-xp.herokuapp.com/proxy`, options)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error: " + response.statusText);
      }
    })
    .then((data) => {
      jwt_token = data.token;
      alert("successfully logged in!");
      logoutForm.style.display = "block";
      results.style.display = "block";
      inputBox.style.display = "none";
      const encodedCredentials = jwt_token.split(".")[1];
      const decodedCredentials = JSON.parse(atob(encodedCredentials));
      const userId =
        decodedCredentials["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
      getUserData(userId);
    })
    .catch((error) => {
      alert("Please check that the credentials are valid");
      console.log(error);
    });
}

let MakeAPIRequest = async (query) => {
  try {
    const response = await fetch(
      "https://01.kood.tech/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt_token}`,
        },
        body: JSON.stringify({
          query: query,
        }),
      }
    );
    const data = response.json();
    return data;
  } catch (error) {
    return error;
  }
};
