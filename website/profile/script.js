const socket = io();

document.addEventListener("DOMContentLoaded", function () {
    setInterval(() => {
        let nb = Math.floor(Math.random() * texts.length);
        document.getElementById("warning_text").innerHTML = texts[nb];
    }, 5000);

    isLoggedIn();

    socket.emit("get_user", { id: localStorage.getItem("id") });
});

function Back(e) {
    e.preventDefault();
    location.href = "/";
}

function Logout(e) {
    e.preventDefault();
    localStorage.removeItem("id");
    location.href = "/";
}

function DeleteAccount(e) {
    e.preventDefault();
    socket.emit("delete_account", { id: localStorage.getItem("id") });
    localStorage.removeItem("id");
    location.href = "/";
}

socket.on("get_user_success", (data) => {
    let { username, password, question, answer, admin } = data;
    document.getElementById("username").value = username;
    document.getElementById("password").value = password;
    document.getElementById("question").value = question;
    document.getElementById("answer").value = answer;

    if (admin) {
        document.getElementById("back_btn").classList.remove("w-3/12");
        document.getElementById("back_btn").classList.add("w-2/12");

        document.getElementById("logout_btn").classList.remove("w-3/12");
        document.getElementById("logout_btn").classList.add("w-2/12");

        document.getElementById("delete_btn").classList.remove("w-3/12");
        document.getElementById("delete_btn").classList.add("w-2/12");

        let btn = `     <button class="bg-gray-700 text-white rounded p-2 hover:bg-blue-600 transition-colors duration-300 flex items-center space-x-2 hover:text-red-white w-2/12 justify-center" onclick="location.href='/admin'">
                            <i data-lucide="shield" class="mr-4"></i>
                            Admin Panel
                        </button>`;

        document.getElementById("btns").innerHTML += btn;

        lucide.createIcons();
    }
});

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

function Submit(e) {
    e.preventDefault();

    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let question = document.getElementById("question").value;
    let answer = document.getElementById("answer").value;

    if (username == "" || password == "" || question == "" || answer == "") {
        Alert("error", "Please fill in all fields");
        return;
    }

    socket.emit("update_user", { id: localStorage.getItem("id"), username: username, password: password, question: question, answer: answer });
}

socket.on("update_user_success", () => {
    Alert("success", "Your profile has been updated");
})