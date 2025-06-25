const texts = [             // Thanks to chatgpt for this list...
    "You can do it ! After all, it's not about how fast you progress, but about keeping moving forward.",                                //      1
    "Every small step you take today brings you closer to your dreams.",                                                                 //      2
    "Remember why you started and let that motivation guide you to success.",                                                            //      3
    "It's not about how fast you progress, but about keeping moving forward.",                                                           //      4
    "Challenges are there to be overcome. You have everything it takes to rise to them.",                                                //      5
    "Don't wait for the conditions to be perfect. Start where you are with what you have.",                                              //      6
    "Your dreams are worth pursuing. Don't let anyone tell you otherwise.",                                                              //      7
    "Every day is a new opportunity to get closer to your goals.",                                                                       //      8
    "Success is not a destination, but a journey. Enjoy every step.",                                                                    //      9
    "Believe in yourself and your ability to overcome the obstacles in your path.",                                                      //     10
    "Mistakes are not failures, but lessons that allow you to grow.",                                                                    //     11
    "Your determination is stronger than any obstacle in your way.",                                                                     //     12  
    "Never give up on a bad day. Tough days don't last, but tough people do.",                                                           //     13
    "The only way to guarantee failure is to not try at all.",                                                                           //     14
    "The future belongs to those who believe in the beauty of their dreams and have the courage to pursue them.",                        //     15
    "Every effort you make brings you closer to the person you want to become.",                                                         //     16
    "Success is not final. It is the courage to continue that counts.",                                                                  //     17
    "Embrace the challenges ahead, for they are the stepping stones to your success.",                                                   //     18
    "Stay focused, stay determined, and watch as your dreams become reality.",                                                           //     19
    "Your potential is limitless. Don't let doubts or fears hold you back.",                                                             //     20
    "The journey may be tough, but the destination is worth every struggle.",                                                            //     21
    "Celebrate every milestone, no matter how small, on your journey to greatness.",                                                     //     22
    "You have the power to shape your destiny. Seize each moment with purpose.",                                                         //     23
    "Rise above the doubts and fears. Your courage will lead you to triumph.",                                                           //     24
    "In the face of adversity, remember your strength and resilience.",                                                                  //     25
    "Each setback is an opportunity to learn, grow, and come back stronger.",                                                            //     26
    "Your determination is the key that unlocks the door to your dreams.",                                                               //     27
    "The journey is not complete until you have achieved your goals.",                                                                   //     28
    "Believe in yourself and your vision. You have everything you need to succeed.",                                                     //     29
    "The only way to guarantee failure is to never start. Take that first step towards your dreams today.",                              //     30
    "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful.",     //     31
    "Don't watch the clock; do what it does. Keep going.",                                                                               //     32
    "Success is not about how fast you progress, but how well you keep up.",                                                             //     33
    "The best way to predict the future is to create it.",                                                                               //     34
    "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.",                                             //     35
    "Success is not measured by how long you have, but by how much you have changed.",                                                   //     36
    "The only limit to our realization of tomorrow is our doubts of today.",                                                             //     37
    "Your time is limited, so don't waste it living someone else's life.",                                                               //     38
];  // lentgh : 38

const sock = io();

// check if the user is logged in
function isLoggedIn() {
    const id = localStorage.getItem("id");

    if (id == null) {
        location.href = "/login";
    } else {
        sock.emit("check_id", {id: id});
    }
}

sock.on("check_id_error", () => {
    location.href = "/login";
});