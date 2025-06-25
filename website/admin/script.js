const socket = io();
let logs = {
    // launch : content
};

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    isLoggedIn();

    setInterval(() => {
        let nb = Math.floor(Math.random() * texts.length);
        document.getElementById("warning_text").innerHTML = texts[nb];
    }, 5000);

    socket.emit("admin_get_log");
    socket.emit("admin_get_info");

    socket.emit("admin_verify", { id: localStorage.getItem("id") });

    document.getElementById("home_div").click();
});

socket.on("admin_verify_success", () => {
    socket.emit("admin_get_users");
});
socket.on("admin_verify_error", () => {
    location.href = "/login";
});
socket.on("admin_get_users_success", (data) => {
    Object.keys(data).forEach((key) => {
        let user = data[key];

        let html = `
            <li class="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white transition-colors duration-300 rounded p-2 flex items-center space-x-2 hover:text-purple-400" onclick="Show('${key}')" id="${key}_li">
                <i data-lucide="user"></i>
                <p>${user.username}</p>
            </li>
        `;

        let div = `
            <div id="${key}" class="hidden p-2 fixed top-12 left-64 right-0 bottom-0 mt-4 gap-2 flex flex-col">
                <p class="text-gray-300 rounded mb-2 font-bold text-lg flex font-bold items-center space-x-2">User id : ${key}</p>

                <input class="bg-gray-800 w-full border-b-2 border-gray-600 hover:border-green-600 focus:border-green-600 outline-none p-2 text-white transition-colors duration-300" type="text" placeholder="Username for ${user.username}" id="${key}_username" value="${user.username}">
                <input class="bg-gray-800 border-b-2 border-gray-600 hover:border-green-600 focus:border-green-600 outline-none p-2 text-white transition-colors duration-300" type="text" placeholder="Password for ${user.username}" id="${key}_password" value="${user.password}">
                <input class="bg-gray-800 border-b-2 border-gray-600 hover:border-green-600 focus:border-green-600 outline-none p-2 text-white transition-colors duration-300" type="text" placeholder="Question for ${user.username}" id="${key}_question" value="${user.question}">
                <input class="bg-gray-800 border-b-2 border-gray-600 hover:border-green-600 focus:border-green-600 outline-none p-2 text-white transition-colors duration-300" type="text" placeholder="Answer for ${user.username}" id="${key}_answer" value="${user.answer}">

                <div class="flex items-center justify-center" id="${key}_admin_div">
                    <input type="checkbox" class="w-4 h-4" id="${key}_admin" ${user.admin ? "checked" : ""}>
                    <label for="${key}_admin" class="ml-2 text-white text-xl">Admin</label>
                </div>

                <button class="bg-gray-700 text-white rounded p-2 hover:bg-green-600 transition-colors duration-300 flex items-center space-x-2 justify-center" onclick="Submit(event, '${key}')">
                    <i data-lucide="pen" class="mr-4"></i>
                    Modify account
                </button>
                <button class="bg-gray-700 text-white rounded p-2 hover:bg-red-600 transition-colors duration-300 flex items-center space-x-2 justify-center" onclick="Delete(event, '${key}')">
                    <i data-lucide="trash-2" class="mr-4"></i>
                    Delete account
                </button>
            </div>
        `;

        if (key == localStorage.getItem("id")) {
            console.log("WTFFFFFFFFFFFFFFFFF");
            document.getElementById("home_title").innerHTML = "Welcome to the admin panel, " + user.username + "!";
        }

        document.getElementById("fdpmarcheenculédetesgrandsmorts").innerHTML += div;
        document.getElementById("users").innerHTML += html;

        lucide.createIcons();
    })
});
socket.on("admin_update_user_success", () => {
    Alert("success", "User updated");
});
socket.on("admin_delete_user_success", () => {
    Alert("success", "User deleted");
});
socket.on("admin_get_log_success", (info) => {
    let { launch, data } = info;

    let log = document.getElementById("log_text");
    let select = document.getElementById("log_filter");

    data = data.split("\n\n")[0];

    // add coloration
    let lines = data.split("\n");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("[e]")) {
            lines[i] = lines[i].replace("[e]", '<span class="text-red-500">$&</span>');
        } else if (lines[i].includes("[w]")) {
            lines[i] = lines[i].replace("[w]", '<span class="text-yellow-500">$&</span>');
        } else if (lines[i].includes("[i]")) {
            lines[i] = lines[i].replace("[i]", '<span class="text-green-500">$&</span>');
        } else if (lines[i].includes("[d]")) {
            lines[i] = lines[i].replace("[d]", '<span class="text-purple-500">$&</span>');
        }

        let regex = /(https?:\/\/[^\s]+)/g;
        lines[i] = lines[i].replace(regex, '<a href="$1" class="hover:underline text-indigo-700">$1</a>');
        regex = /\b\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}\.\d{3}\b/;
        lines[i] = lines[i].replace(regex, '<span class="text-gray-500">$&</span>');
        regex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b(?!:\d+)/;
        lines[i] = lines[i].replace(regex, '<span class="font-bold text-green-300">$&</span>');
    }
    data = lines.join("<br>");

    logs[launch] = data;
    log.innerHTML = logs[launch];

    select.innerHTML += `
        <option value="${launch}">Launch ${launch+1}</option>
    `;
    select.value = launch;
    checkPosition();
});
socket.on("admin_get_info_success", (data) => {
    let { different_ip, online_users, total_users, total_projects, total_launch, size_account, size_logs, size_projects } = data;

    document.getElementById("home_text").innerHTML  = `Different ip addresses connected : ${different_ip}`;
    document.getElementById("home_text2").innerHTML = `Online users : ${online_users}`;
    document.getElementById("home_text3").innerHTML = `Total users : ${total_users}`;
    document.getElementById("home_text4").innerHTML = `Total projects : ${total_projects}`;
    document.getElementById("home_text5").innerHTML = `Total launches : ${total_launch}`;
    document.getElementById("home_text6").innerHTML = `Size of account.json : ${size_account} bytes`;
    document.getElementById("home_text7").innerHTML = `Size of logs : ${size_logs} bytes`;
    document.getElementById("home_text8").innerHTML = `Size of project.json : ${size_projects} bytes`;
});

function Show(id) {
    Refresh();

    let nav = document.querySelector("nav");
    let divs = nav.getElementsByTagName("div");
    for (let i = 0; i < divs.length; i++) {
        if (divs[i].id == `${id}_div`) {
            divs[i].classList.add("bg-gray-700", "text-green-500");
            divs[i].classList.remove("text-white");
        } else {
            divs[i].classList.remove("bg-gray-700", "text-green-500");
            divs[i].classList.add("text-white");
        }
    }
    let ul = document.querySelector("ul");
    let lis = ul.getElementsByTagName("li");
    for (let i = 0; i < lis.length; i++) {
        if (lis[i].id == `${id}_li`) {
            lis[i].classList.add("bg-gray-600", "text-purple-400");
            lis[i].classList.remove("bg-gray-700", "text-white");
        } else {
            lis[i].classList.add("bg-gray-700", "text-white");
            lis[i].classList.remove("bg-gray-600", "text-purple-400");
        }
    }

    let div = document.getElementById("fdpmarcheenculédetesgrandsmorts");
    let divs2 = div.getElementsByTagName("div");
    for (let i = 0; i < divs2.length; i++) {
        if (divs2[i].id == id  || divs2[i].id == `${id}_admin_div` || divs2[i].id == "log_text" || divs2[i].id == "log_filter_div") {
            divs2[i].classList.remove("hidden");
        } else {
            divs2[i].classList.add("hidden");
        }
    }

    checkPosition();
}

function Refresh() {
    document.getElementById("log_filter").innerHTML = "";
    socket.emit("admin_get_log");
    socket.emit("admin_get_info");
    checkPosition();
}

function Logout() {
    localStorage.removeItem("id");
    location.href = "/login";
}

function Submit(event, id) {
    event.preventDefault();
    let username = document.getElementById(`${id}_username`).value;
    let password = document.getElementById(`${id}_password`).value;
    let question = document.getElementById(`${id}_question`).value;
    let answer = document.getElementById(`${id}_answer`).value;
    let admin = document.getElementById(`${id}_admin`).checked;
    socket.emit("admin_update_user", { id: id, username: username, password: password, question: question, answer: answer, admin: admin });
}

function Delete(event, id) {
    event.preventDefault();
    socket.emit("admin_delete_user", id);

    let li = document.getElementById(`${id}_li`);
    li.remove();
    let div = document.getElementById(id);
    div.remove();
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

function BackLog() {
    let value = document.getElementById("log_filter").value;
    value = parseInt(value);
    document.getElementById("log_filter").value = value - 1;
    document.getElementById("log_filter").dispatchEvent(new Event('change'));
    checkPosition();
}

function NextLog() {
    let value = document.getElementById("log_filter").value;
    value = parseInt(value);
    document.getElementById("log_filter").value = value + 1;
    document.getElementById("log_filter").dispatchEvent(new Event('change'));
    checkPosition();
}

function checkPosition() {
    try {
        let select = document.getElementById("log_filter");
        let currentValue = parseInt(select.value);

        if (currentValue === parseInt(select.options[0].value)) {
            document.getElementById("bl").onclick = "";
            document.getElementById("nl").onclick = NextLog;

            document.getElementById("bl").classList.remove("cursor-pointer", "hover:bg-green-600");
            document.getElementById("nl").classList.add("cursor-pointer", "hover:bg-green-600");
        } else if (currentValue === parseInt(select.options[select.options.length - 1].value)) {
            document.getElementById("nl").onclick = "";
            document.getElementById("bl").onclick = BackLog;

            document.getElementById("nl").classList.remove("cursor-pointer", "hover:bg-green-600");
            document.getElementById("bl").classList.add("cursor-pointer", "hover:bg-green-600");
        } else {
            document.getElementById("nl").onclick = NextLog;
            document.getElementById("bl").onclick = BackLog;

            document.getElementById("bl").classList.add("cursor-pointer", "hover:bg-green-600");
            document.getElementById("nl").classList.add("cursor-pointer", "hover:bg-green-600");
        }
    } catch (e) { 
        // ON SEN BAS LES COUILLES LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOL
    }
}