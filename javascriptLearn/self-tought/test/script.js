
const button = document.getElementById("myButton");
const message = document.getElementById("messageText");

button.addEventListener("click", function() {
    message.textContent = "Hello! You clicked the button successfully.";
});
