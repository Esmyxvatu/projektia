const socket = io();
const url = new URLSearchParams(window.location.search);
let answer, password;

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");

    socket.emit("forgot", { username: url.get("u") });

    setInterval(() => {
        let nb = Math.floor(Math.random() * texts.length);
        document.getElementById("warning_text").innerHTML = texts[nb];
    }, 5000);
});

function Submit(e) {
    e.preventDefault();
    const answer2 = document.getElementById("answer").value;
    if (answer2 == "") {
        Alert("error", "Please fill in the field");
        return;
    } else if (answer2.toLowerCase() != answer.toLowerCase()) {
        Alert("error", "Wrong answer");
        return;
    } else {
        document.getElementById("question").innerText = "Your password is: " + password;
    }
}

function Alert(type, text) {
    document.getElementById("info").classList.remove("hidden");
    if (type == "success") {
        document.getElementById("info_type").innerHTML = "Success:";
        document.getElementById("info_text").innerHTML = text;

        document.getElementById("info").classList.add("bg-green-500");
        document.getElementById("info").classList.add("hover:bg-green-700");
        document.getElementById("info").classList.remove("bg-red-500");
        document.getElementById("info").classList.remove("hover:bg-red-700");
    } else if (type == "error") {
        document.getElementById("info_type").innerHTML = "Error:";
        document.getElementById("info_text").innerHTML = text;

        document.getElementById("info").classList.add("bg-red-500");
        document.getElementById("info").classList.add("hover:bg-red-700");
        document.getElementById("info").classList.remove("bg-green-500");
        document.getElementById("info").classList.remove("hover:bg-green-700");
    }
}

function HideForms(event) {
    event.preventDefault();
    document.getElementById("info").classList.add("hidden");                        // Banderolle d'informations (erreurs ou succes)
}

socket.on("forgot_error", (data) => {
    Alert("error", data);
});

socket.on("forgot_success", (data) => {
    document.getElementById("question").innerHTML = data.question;
    answer = data.answer;
    password = data.password;
});