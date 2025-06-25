const socket = io();

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");

    setInterval(() => {
        let nb = Math.floor(Math.random() * texts.length);
        document.getElementById("warning_text").innerHTML = texts[nb];
    }, 5000);
});

function Register(e) {
    e.preventDefault();
    const username  = document.getElementById("username").value;
    const password  = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;
    const question  = document.getElementById("q").value;
    const answer    = document.getElementById("a").value;

    if (username == "" || password == "" || password2 == "" || question == "" || answer == "") {
        Alert("error", "Please fill in all fields");
        return;
    } else if (password != password2) {
        Alert("error", "Passwords do not match");
        return;
    }

    socket.emit("register", { username: username, password: password, question: question, answer: answer });
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

socket.on("register_success", (data) => {
    localStorage.setItem("id", data);
    location.href = "/";
});