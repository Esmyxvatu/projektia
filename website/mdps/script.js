const socket = io();

socket.on("pm_load_mdps_success", (data) => {
    Object.keys(data).forEach((key) => {
        let mdp = data[key];
        mdp.id = key;
        LoadSite(mdp);
    });
});
socket.on("pm_save_mdps_success", () => {
    Alert("success", "Your password has been saved");
});
socket.on("pm_delete_mdps_success", () => {
    Alert("success", "Your password has been deleted");
});

function HideForms(event) {
    event.preventDefault();

    document.getElementById("new_div").classList.add("hidden");                     // nouveau projet
    document.getElementById("url").value = "";
    document.getElementById("name").value = "";
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";

    document.getElementById("mod_div").classList.add("hidden");                     // modifier projet
    document.getElementById("mod_url").value = "";
    document.getElementById("mod_name").value = "";
    document.getElementById("mod_username").value = "";
    document.getElementById("mod_password").value = "";
    document.getElementById("mod_div").attributes.idapp.value = "";

    document.getElementById("gen_pswd").classList.add("hidden");                     // générer mot de passe
    document.getElementById("gen_len").value = "16";
    document.getElementById("gen_maj").checked = true;
    document.getElementById("gen_min").checked = true;
    document.getElementById("gen_num").checked = true;
    document.getElementById("gen_sym").checked = true;

    document.getElementById("info").classList.add("hidden");                        // Banderolle d'informations (erreurs ou succes)
    document.getElementById("BigAlert").classList.add("hidden");                    // Grosse information bien ou mal
}

document.addEventListener("DOMContentLoaded", () => {
    setInterval(() => {
        let nb = Math.floor(Math.random() * texts.length);
        document.getElementById("warning_text").innerHTML = texts[nb];
    }, 5000);
    isLoggedIn();
    socket.emit("pm_load_mdps", { id: localStorage.getItem("id") });
});

function ShowModify(event, id) {
    event.preventDefault();
    document.getElementById("mod_div").classList.remove("hidden");
    document.getElementById("mod_div").attributes.idapp.value = id;
    document.getElementById("mod_url").value = document.getElementById(`${id}_url`).attributes.href.value;
    document.getElementById("mod_name").value = document.getElementById(`${id}_url`).attributes.name.value;
    document.getElementById("mod_username").value = document.getElementById(`${id}_username`).innerText;
    document.getElementById("mod_password").value = document.getElementById(`${id}_password`).innerText;
}

function Delete(event, id) {
    event.preventDefault();
    var element = document.getElementById(id);
    if (element) {
        element.parentNode.removeChild(element);
    }
}

function CopyText(event, id, what) {
    event.preventDefault();

    if (what == "username") {
        let name = `${id}_username`;
        let texte = document.getElementById(name).textContent;

        const textarea = document.createElement("textarea");
        textarea.value = texte;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        Alert("success", "Username copied");
    } else if (what == "password") {
        let name = `${id}_password`;
        let texte = document.getElementById(name).textContent;

        const textarea = document.createElement("textarea");
        textarea.value = texte;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        Alert("success", "Password copied");
    } else if (id == "gen_pass") {
        let texte = document.getElementById("gen_pass").textContent;

        const textarea = document.createElement("textarea");
        textarea.value = texte;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        Alert("success", "Password copied");
    }
}

const secretKey = "_ci%wu$?prNRt"; // i}h_]H/avn0@%

function encryptText(text) {
    const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
    return encrypted;
}

function decryptText(encryptedText) {
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
}

function LoadSite(data) {
    let url      = decryptText(data.url);
    let name     = decryptText(data.app);
    let username = decryptText(data.username);
    let password = decryptText(data.password);
    let id       = data.id;

    let html = `<article class="hover:bg-gray-700 transition-colors duration-300 cursor-pointer p-2 rounded flex items-center space-x-2" id="${id}">
                    <div class="w-1/4 text-white flex items-center gap-2 justify-center">
                        <a class="font-bold text-xl hover:text-green-600" name="${name}" id="${id}_url" href="${url}" target="_blank">${name}</a>
                    </div>
                    <div class="w-1/4 text-white flex items-center gap-2 justify-center">
                        <h2 class="font-bold text-xl" id="${id}_username">${username}</h2>
                        <i data-lucide="copy" class="text-white hover:text-green-600 transition-colors duration-300" onclick="CopyText(event, '${id}', 'username')"></i>
                    </div>
                    <div class="w-1/4 text-white flex items-center gap-2 justify-center">
                        <h2 class="font-bold text-xl" id="${id}_password">${password}</h2>
                        <i data-lucide="copy" class="text-white hover:text-green-600 transition-colors duration-300" onclick="CopyText(event, '${id}', 'password')"></i>
                    </div>
                    <div class="w-1/4 text-white transition-colors duration-300 flex items-center gap-4" style="justify-content: end;">
                        <i class="text-gray-400 hover:text-green-600 transition-colors duration-300" data-lucide="pen" onclick="ShowModify(event, '${id}')"></i>
                        <i class="text-red-600 hover:text-red-800 transition-colors duration-300" data-lucide="trash-2" onclick="Delete(event, '${id}')"></i>
                    </div>
                </article>`;

    document.getElementById("list").innerHTML += html;

    lucide.createIcons();
}

function Delete(event, id) {
    event.preventDefault();

    document.getElementById(id).remove();
    socket.emit("pm_delete_mdps", { userid: localStorage.getItem("id"), id: id });
}

function AddSite(event) {
    event.preventDefault();

    let url = document.getElementById("url").value;
    let name = document.getElementById("name").value;
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;

    if (url == "" || name == "" || username == "" || password == "") {
        Alert("error", "Please fill in all fields");
        return;
    }

    let html = `<article class="hover:bg-gray-700 transition-colors duration-300 cursor-pointer p-2 rounded flex items-center space-x-2" id="site${name}">
                    <div class="w-1/4 text-white flex items-center gap-2 justify-center">
                        <a class="font-bold text-xl hover:text-green-600" href="${url}" target="_blank">${name}</a>
                    </div>
                    <div class="w-1/4 text-white flex items-center gap-2 justify-center">
                        <h2 class="font-bold text-xl" id="username${name}">${username}</h2>
                        <i data-lucide="copy" class="text-white hover:text-green-600 transition-colors duration-300" onclick="CopyText(event, 'site${name}', 'username')"></i>
                    </div>
                    <div class="w-1/4 text-white flex items-center gap-2 justify-center">
                        <h2 class="font-bold text-xl" id="password${name}">${password}</h2>
                        <i data-lucide="copy" class="text-white hover:text-green-600 transition-colors duration-300"></i>
                    </div>
                    <div class="w-1/4 text-white transition-colors duration-300 flex items-center gap-4" style="justify-content: end;">
                        <i class="text-gray-400 hover:text-green-600 transition-colors duration-300" data-lucide="pen"></i>
                        <i class="text-red-600 hover:text-red-800 transition-colors duration-300" data-lucide="trash-2" onclick="Delete(event, 'site${name}')"></i>
                    </div>
                </article>`;

    document.getElementById("list").innerHTML += html;

    socket.emit("pm_save_mdps", {
        userid: localStorage.getItem("id"),
        id: Math.floor(Math.random() * 100000000000000).toString(36),
        mdp : {
            url: encryptText(url),
            app: encryptText(name),
            username: encryptText(username),
            password: encryptText(password)
        }
    });

    lucide.createIcons();

    HideForms(event);
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

function ModifySite(event) {
    event.preventDefault();

    let url = document.getElementById("mod_url").value;
    let name = document.getElementById("mod_name").value;
    let username = document.getElementById("mod_username").value;
    let password = document.getElementById("mod_password").value;
    let id = document.getElementById("mod_div").attributes.idapp.value;

    if (url == "" || name == "" || username == "" || password == "") {
        Alert("error", "Please fill in all fields");
        return;
    } else {
        document.getElementById(`${id}_url`).attributes.href.value = url;
        document.getElementById(`${id}_url`).attributes.name.value = name;
        document.getElementById(`${id}_url`).innerText = name;
        document.getElementById(`${id}_username`).innerText = username;
        document.getElementById(`${id}_password`).innerText = password;

        socket.emit("pm_save_mdps", {
            userid: localStorage.getItem("id"),
            id: id,
            mdp : {
                url: encryptText(url),
                app: encryptText(name),
                username: encryptText(username),
                password: encryptText(password)
            }
        });

        HideForms(event);
    }
}

function Search() {
    let search = document.getElementById("search").value;

    if (search == "") {
        let articles = document.getElementById("list").querySelectorAll("article");
        for (let article of articles) {
            article.classList.remove("hidden");
        }
    } else {
        let articles = document.getElementById("list").querySelectorAll("article");
        for (let article of articles) {
            if (!article.innerText.toLowerCase().includes(search.toLowerCase())) {
                article.classList.add("hidden");
            } else {
                article.classList.remove("hidden");
            }
        }
    }
}

function Generate(event) {
    event.preventDefault();

    let length = document.getElementById("gen_len").value;
    let upper  = document.getElementById("gen_maj").checked;
    let lower  = document.getElementById("gen_min").checked;
    let number = document.getElementById("gen_num").checked;
    let symbol = document.getElementById("gen_sym").checked;

    if (length == "") {
        length = 16;
    }

    let upper_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let lower_chars = "abcdefghijklmnopqrstuvwxyz";
    let number_chars = "0123456789";
    let symbol_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = "";
    if (upper) {
        chars += upper_chars;
    } 
    if (lower) {
        chars += lower_chars;
    }
    if (number) {
        chars += number_chars;
    }
    if (symbol) {
        chars += symbol_chars;
    }

    if (chars == "") {
        Alert("error", "Please select at least one option");
        return;
    }

    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    document.getElementById("gen_pass").innerText = password;
}