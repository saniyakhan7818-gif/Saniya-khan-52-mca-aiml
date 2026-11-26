
function getJoke() {

    fetch("https://api.api-ninjas.com/v1/jokes", {
        method: "GET",
        headers: {
            "X-Api-Key": "PFlLYkrTyTjg4CCnhJFuwMLUz2jn6RCEKaZKDZvl"
        }
    })

    .then(function(response) {

        if (!response.ok) {
            throw new Error("HTTP Error: " + response.status);
        }

        return response.json();
    })

    .then(function(data) {

        // console.log(data);

        document.getElementById("setup").innerHTML =
            data[0].joke;

        document.getElementById("punchline").innerHTML = "";

    })

    .catch(function(error) {

        document.getElementById("setup").innerHTML =
            "Unable to fetch joke!";

        console.log("Error:", error);

    });

}
