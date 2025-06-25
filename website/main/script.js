/*------------------DOM-----------------*/
const socket = io();

document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded");
    isLoggedIn();

    let id = localStorage.getItem("id");
    if (id == null) {
        location.href = "/login";
    }
    socket.emit("connect_from_id", { id: id });

    setInterval(() => {
        let nb = Math.floor(Math.random() * texts.length);
        document.getElementById("warning_text").innerHTML = texts[nb];
    }, 5000);
});

// socket.io
socket.on("get_objective", (data) => {
    objective = data;
    LoadProjects();
    console.log(objective);
})


let couter = 0;
const completed_prefix = "<i data-lucide='check' class='text-green-500 mr-2'></i> ";
const prefix = "¤µ$";

const name_actual = document.getElementById("project-title");
const step_name = document.getElementById("step-title");
const add_project = document.getElementById("new_project");
const add_step = document.getElementById("new_step");
const add_obj = document.getElementById("new_objective");

function LoadProjects() {
    document.getElementById("projects").innerHTML = "";

    Object.keys(objective).forEach(element => {
        let li = document.createElement("li");

        if (element.startsWith(prefix)) {
            li.classList.add("text-green-600");
            li.classList.add("hover:text-green-400");
        } else {
            li.classList.add("text-gray-400");
            li.classList.add("hover:text-white");
        }

        li.innerHTML = `<button class="flex items-center space-x-2 h-full mr-2" id="${couter}1"><i data-lucide="trash-2" class="text-red-500 hover:text-red-700" id="${couter}2"></i></button> <button class="flex items-center space-x-2 w-full h-full" id="${couter}0">${element.replace(prefix, "")}</button>`;
        li.classList.add("bg-gray-800", "text-gray-400", "hover:text-white", "rounded", "p-2", "hover:bg-gray-700", "transition-colors", "duration-300", "flex", "justify-between", "w-full", "h-full");
        li.id = `${couter}`;
        couter++;
        li.addEventListener("click", (event) => {
            if (event.target.id == `${li.id}1` || event.target.id == `${li.id}2`) {
                li.remove();
                document.getElementById("steps").classList.add("hidden");
                if (name_actual.innerText == element.replace(prefix, "")) {
                    name_actual.innerText = "";
                }
                socket.emit("delete", {type: "project", name: element});
                Alert("success", "Project deleted successfully");
            } else {
                li.classList.toggle("bg-gray-700");
                li.classList.toggle("bg-gray-800");

                li.classList.toggle("text-white");
                li.classList.toggle("text-gray-400");

                li_s = document.getElementById(`projects`).children;
                for (let i =0; i<li_s.length; i++){
                    let element2 = li_s[i];
                    if (element2.classList.contains("active") && element2.id != li.id) {
                        element2.classList.toggle("bg-gray-700");
                        element2.classList.toggle("bg-gray-800");

                        element2.classList.toggle("text-white");
                        element2.classList.toggle("text-gray-400");

                        element2.classList.remove("active");
                    }
                }

                if (name_actual.innerText == "" || name_actual.innerText != element.replace(prefix, "")) {
                    name_actual.innerText = element.replace(prefix, "");
                    if (element.startsWith(prefix)) {
                        name_actual.classList.add("text-green-500");
                    } else {
                        name_actual.classList.remove("text-green-500");
                    }
                    document.getElementById("steps").classList.remove("hidden");
                } else {
                    name_actual.innerText = "";
                    name_actual.classList.remove("text-green-500");
                    document.getElementById("steps").classList.add("hidden");
                    document.getElementById("objective").classList.add("hidden");
                }

                if (li.classList.contains("active")) {
                    li.classList.remove("active");
                } else {
                    li.classList.add("active");
                    LoadSteps();
                }
            }
        });
        document.getElementById("projects").appendChild(li);
        lucide.createIcons();
    });
}
function LoadSteps() {
    document.getElementById("steps-list").innerHTML = "";
    document.getElementById("objective").classList.add("hidden");

    if (name_actual.classList.contains("text-green-500")) {
        naame = prefix + name_actual.innerText;
    } else {
        naame = name_actual.innerText;
    }

    Object.keys(objective[naame]).forEach(element => {
        let li = document.createElement("li");

        if (isallcomplete(element, "step")) {
            element = prefix + element;
        }

        if (element.startsWith(prefix)) {
            li.classList.add("text-green-600");
            li.classList.add("hover:text-green-400");
        } else {
            li.classList.add("text-gray-400");
            li.classList.add("hover:text-white");
        }

        li.innerHTML = `<button class="flex items-center space-x-2 h-full mr-2" id="${couter}10"><i data-lucide="trash-2" class="text-red-500 hover:text-red-700" id="${couter}20"></i></button> <button class="flex items-center space-x-2 w-full h-full" id="${couter}00">${ element.replace(prefix, "")}</button>`;
        li.classList.add("bg-gray-800", "rounded", "p-2", "hover:bg-gray-700", "transition-colors", "duration-300", "flex", "justify-between", "w-full", "h-full");
        li.id = `${couter}`;
        couter++;

        li.addEventListener("click", (event) => {
            if (event.target.id == `${li.id}10` || event.target.id == `${li.id}20`) {
                li.remove();
                delete objective[naame][element];
                document.getElementById("objective").classList.add("hidden");
                Alert("success", "Step deleted successfully");
                socket.emit("delete", {type: "step", name: element, where: { project: naame},});
            } else {
                li.classList.toggle("bg-gray-700");
                li.classList.toggle("bg-gray-800");

                li.classList.toggle("text-white");
                li.classList.toggle("text-gray-400");

                li_s = document.getElementById(`steps-list`).children;
                for (let i =0; i<li_s.length; i++){
                    let element2 = li_s[i];
                    if (element2.classList.contains("active") && element2.id != li.id) {
                        element2.classList.toggle("bg-gray-700");
                        element2.classList.toggle("bg-gray-800");

                        element2.classList.toggle("text-white");
                        element2.classList.toggle("text-gray-400");

                        element2.classList.remove("active");
                    }
                }

                if (step_name.innerText == "" || step_name.innerText != element) {
                    step_name.innerText = element.replace(prefix, "");
                    if (element.startsWith(prefix)) {
                        step_name.classList.add("text-green-500");
                    } else {
                        step_name.classList.remove("text-green-500");
                    }
                    document.getElementById("objective").classList.remove("hidden");
                    LoadObj();
                } else {
                    step_name.innerText = "";
                    step_name.classList.remove("text-green-500");
                    document.getElementById("objective").classList.add("hidden");
                }

                if (li.classList.contains("active")) {
                    li.classList.remove("active");
                } else {
                    li.classList.add("active");
                }
            }
        });
        document.getElementById("steps-list").appendChild(li);
        lucide.createIcons();
    });
}
function LoadObj() {
    document.getElementById("objectives-list").innerHTML = "";
    step = step_name.innerText;

    if (name_actual.classList.contains("text-green-500")) {
        naame = prefix + name_actual.innerText;
    } else {
        naame = name_actual.innerText;
    }

    Object.keys(objective[naame][step]).forEach(element => {
        const idx = element;
        element = objective[naame][step][element];
        let li = document.createElement("li");

        if (element.startsWith(prefix)) {
            element = element.slice(3);
            li.classList.add("text-green-500");
            li.classList.add("hover:text-green-600");
            data = "square-check-big";
            class_ = "text-green-500 hover:text-green-700";
        } else {
            li.classList.add("text-gray-400");
            li.classList.add("hover:text-white");
            data = "square";
            class_ = "text-gray-500 hover:text-green-500";
        }

        li.innerHTML = `<button class="flex items-center space-x-2 w-full h-full" id="${couter}00">${element}</button> <button class="flex items-center space-x-2 mr-4" id="${couter}c"><i data-lucide="${data}" class="${class_}" id="${couter}c2"></i></button> <button class="flex items-center space-x-2 h-full mr-2" id="${couter}10"><i data-lucide="trash-2" class="text-red-500 hover:text-red-700" id="${couter}20"></i></button>`;
        li.classList.add("bg-gray-800", "rounded", "p-2", "hover:bg-gray-700", "transition-colors", "duration-300", "flex", "justify-between", "w-full", "h-full");
        li.id = `${couter}`;

        li.addEventListener("click", (event) => {
            if (event.target.id == `${li.id}10` || event.target.id == `${li.id}20`) {
                li.remove();
                Alert("success", "Objective deleted successfully");
                objective[naame][step].splice(objective[naame][step].indexOf(element), 1);
                socket.emit("delete", {type: "obj", name: element, where: {project: naame, step: step}});
            } else if (event.target.id == `${li.id}c2` || event.target.id == `${li.id}c`) {
                HTML_ = document.getElementById(li.id+"c");
                event.target.classList.toggle("text-green-500");
                event.target.classList.toggle("hover:text-green-700");
                event.target.classList.toggle("text-gray-500");

                li.classList.toggle("text-green-500");
                li.classList.toggle("hover:text-green-600");
                li.classList.toggle("text-gray-400");

                console.log(HTML_.innerHTML);
                console.log(HTML_.innerHTML == `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="square-check-big" class="lucide lucide-square-check-big text-green-500 hover:text-green-700" id="${li.id}c2"><path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"></path><path d="m9 11 3 3L22 4"></path></svg>`)

                if (HTML_.innerHTML == `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-lucide="square-check-big" class="lucide lucide-square-check-big text-gray-500" id="${li.id}c2"><path d="M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5"></path><path d="m9 11 3 3L22 4"></path></svg>`) {
                    HTML_.innerHTML = `<i data-lucide="square" class="text-gray-500 hover:text-green-500" id="${li.id}c2"></i>`;
                    objective[naame][step][idx] = `${element}`;
                    socket.emit("uncomplete", {type: "obj", name: element, where: {project: naame, step: step, idx: idx}});
                } else {
                    HTML_.innerHTML = `<i data-lucide="square-check-big" class="text-green-500 hover:text-green-700" id="${li.id}c2"></i>`;
                    objective[naame][step][idx] = `${prefix}${element}`;
                    socket.emit("complete", {type: "obj", name: element, where: {project: naame, step: step, idx: idx}});
                }
                lucide.createIcons();

                if (isallcomplete(naame, "project")) {
                    objective[prefix + name_actual.innerText] = objective[naame];
                    delete objective[naame];

                    LoadProjects();
                    BigAlert("You finished the project " + name_actual.innerText + "! Congratulations!");
                    socket.emit("complete", {type: "project", name: name_actual.innerText});

                    let buttons = document.getElementById("projects").getElementsByTagName("button");
                    for (let i = 0; i < buttons.length; i++) {
                        let buttonText = buttons[i].innerText || buttons[i].textContent;
                        if (buttonText.includes(name_actual.innerText)) {
                            name_actual.innerText = "";
                            buttons[i].click();
                            break;
                        }
                    }

                } else if (!isallcomplete(naame, "project") && name_actual.innerText != naame) {
                    objective[name_actual.innerText] = objective[naame];
                    delete objective[naame];
                    socket.emit("uncomplete", {type: "project", name: name_actual.innerText});

                    LoadProjects();

                    setTimeout(() => {
                        let buttons = document.getElementById("steps-list").getElementsByTagName("button");
                        for (let i = 0; i < buttons.length; i++) {
                            let buttonText = buttons[i].innerText || buttons[i].textContent;
                            if (buttonText.includes(step_name.innerText)) {
                                step_name.innerText = "";
                                buttons[i].click();
                                break;
                            }
                        }
                    }, 5);

                    let buttons = document.getElementById("projects").getElementsByTagName("button");
                    for (let i = 0; i < buttons.length; i++) {
                        let buttonText = buttons[i].innerText || buttons[i].textContent;
                        if (buttonText.includes(name_actual.innerText)) {
                            name_actual.innerText = "";
                            buttons[i].click();
                            break;
                        }
                    }
                }

                if (isallcomplete(step_name.innerText, "step")) {
                    LoadSteps();
                    //socket.emit("complete", {type: "step", name: step_name.innerText, where: {project: naame}});
                    Alert("success", "You finished the step " + step_name.innerText + "! Congratulations!");
                    let buttons = document.getElementById("steps-list").getElementsByTagName("button");
                    for (let i = 0; i < buttons.length; i++) {
                        let buttonText = buttons[i].innerText || buttons[i].textContent;
                        if (buttonText.includes(step_name.innerText)) {
                            buttons[i].click();
                            break;
                        }
                    }
                } else {
                    step_name.classList.remove("text-green-500");

                    let li_s2 = document.getElementById("steps-list").children;
                    for (let i = 0; i < li_s2.length; i++) {
                        let button = li_s2[i].getElementsByTagName("button");
                        if (button[1].innerText.includes(step_name.innerText)) {
                            li_s2[i].classList.remove("text-green-600");
                            li_s2[i].classList.add("text-gray-400");
                        }
                    }
                }
            } else {
                li.classList.toggle("bg-gray-700");
                li.classList.toggle("bg-gray-800");

                li.classList.toggle("text-white");
                li.classList.toggle("text-gray-400");

                li_s = document.getElementById(`objectives-list`).children;
                for (let i = 0; i < li_s.length; i++) {
                    let element2 = li_s[i];
                    if (element2.classList.contains("active") && element2.id != li.id) {
                        element2.classList.toggle("bg-gray-700");
                        element2.classList.toggle("bg-gray-800");

                        element2.classList.toggle("text-white");
                        element2.classList.toggle("text-gray-400");

                        element2.classList.remove("active");
                    }
                }

                lucide.createIcons();

                if (li.classList.contains("active")) {
                    li.classList.remove("active");
                } else {
                    li.classList.add("active");
                }
            }
        });

        couter++;
        document.getElementById("objectives-list").appendChild(li);
        lucide.createIcons();
    });
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
function BigAlert(text) {
    document.getElementById("BigAlert").classList.remove("hidden");
    document.getElementById("alerten_text").innerHTML = text;
}


add_project.addEventListener("click", () => {
    document.getElementById("new_project_form").classList.toggle("hidden");
});
add_step.addEventListener("click", () => {
    document.getElementById("new_step_form").classList.toggle("hidden");
});
add_obj.addEventListener("click", () => {
    document.getElementById("new_obj_form").classList.toggle("hidden");
});

function AddProject(event) {
    event.preventDefault();

    let name = document.getElementById("new_project_name").value;
    if (name != "" && name != undefined && name != null) {
        objective[name] = {};
        LoadProjects();
        socket.emit("add", {type: "project", name: name});
        document.getElementById("new_project_form").classList.toggle("hidden");
        document.getElementById("new_project_name").value = "";
        Alert("success", "Project added successfully");
    } else {
        Alert("error", "Project name cannot be empty");
    }
}
function HideForms(event) {
    event.preventDefault();

    document.getElementById("new_project_form").classList.add("hidden");            // nouveau projet
    document.getElementById("new_project_name").value = "";

    document.getElementById("new_step_form").classList.add("hidden");               // nouvelle etape
    document.getElementById("new_step_name").value = "";

    document.getElementById("new_obj_form").classList.add("hidden");                // nouveau objectif
    document.getElementById("new_obj_name").value = "";

    document.getElementById("info").classList.add("hidden");                        // Banderolle d'informations (erreurs ou succes)
    document.getElementById("BigAlert").classList.add("hidden");                    // Grosse information bien ou mal
}
function AddStep(event) {
    event.preventDefault();
    if (name_actual.classList.contains("text-green-500")) {naame = prefix + name_actual.innerText;} else {naame = name_actual.innerText;}
    let name = document.getElementById("new_step_name").value;
    if (name != "" && name != undefined && name != null) {
        objective[naame][name] = [];
        LoadSteps();

        socket.emit("add", { type: "step", name: name, where: {project: naame} });
        document.getElementById("new_step_form").classList.toggle("hidden");
        document.getElementById("new_step_name").value = "";

        Alert("success", "Step added successfully");
    } else {
        Alert("error", "Step name cannot be empty");
    }
}
function AddObj(event) {
    event.preventDefault();

    if (name_actual.classList.contains("text-green-500")) {naame = prefix + name_actual.innerText;} else {naame = name_actual.innerText;}
    let name = document.getElementById("new_obj_name").value;
    if (name != "" && name != undefined && name != null) {
        document.getElementById("new_obj_form").classList.toggle("hidden");
        document.getElementById("new_obj_name").value = "";
        objective[naame][step_name.innerText].push(name);
        LoadObj();

        socket.emit("add", { type: "obj", name: name, where: {project: naame, step: step_name.innerText} });

        Alert("success", "Objective added successfully");
    } else {
        Alert("error", "Objective name cannot be empty");
    }
}


function isallcomplete(name, type) {
    if (name_actual.classList.contains("text-green-500")) {
            var naame = prefix + name_actual.innerText;
        } else {
            naame = name_actual.innerText;
        }

    if (type == "step") {
        let len = objective[naame][name].length;
        let complete = 0;
        Object.keys(objective[naame][name]).forEach(element => {
            if (objective[naame][name][element].startsWith("¤µ$")) {
                complete++;
            }
        });

        if (len != 0) {
            return len == complete;
        } else {
            return false;
        }

    } else if (type == "project") {
        let len = 0;
        let complete = 0;

        Object.keys(objective[name]).forEach(el => {
            Object.keys(objective[naame][el]).forEach(element => {
                len++;
                if (objective[naame][el][element].startsWith("¤µ$")) {
                    complete++;
                }
            });
        })

        if (len != 0) {
            return len == complete;
        } else {
            return false;
        }
    }
}