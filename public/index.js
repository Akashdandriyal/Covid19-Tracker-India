document.querySelector(".submit-button").addEventListener("click", function(){
    var e = document.querySelector("#inputState");
    var strUser = e.options[e.selectedIndex].value;
    console.log(strUser);
    if(strUser === "selectcard"){
        alert("Enter the State.");
    }
});

// -----------------------------------------------------------------------------

