const registerUser = () => {
    let email = document.getElementById('registerEmail').value;
    let password = document.getElementById('registerPassword').value;
    let rPassword = document.getElementById('registerRPassword').value;
    let file = document.getElementById('attachedProfileImage');

    if (password === rPassword) {
        let data = new FormData()
        if (file.files[0] != undefined) {
            data.append('profilePic', file.files[0])
        }
        // data.append('username', 'newuser')
        data.append('username', email)
        data.append('password', password)

        fetch('http://localhost:3000/api/v1/user/register', {
            method: 'POST',
            // body: JSON.stringify(body),
            body: data,
            headers: {
                // 'Content-Type':  'application/json'
            }
        }).then((header) => {
            // console.log(header);
            if(header.status == 200) {
                return header.json();
            } else {
                alert('Registration failed, please try again')
            }
        }).then((response) => {
            window.location.href = '../front/login.html';
        })
        .catch((e) => {
            console.log(e)
        })
    }
};

//selected img displaying
document.querySelector('.custom-file-input').addEventListener('change',function(e){
  var fileName = document.getElementById("attachedProfileImage").files[0].name;
  var nextSibling = document.getElementById("customFileLabel");
  nextSibling.innerText = fileName
  nextSibling.style.color = "#000"
})

//show password
const showPasswordBtn = () =>{
  var x = document.getElementById("registerPassword");
  var y = document.getElementById("registerRPassword");
    if (x.type === "password") {
      x.type = "text";
      y.type = "text";
    } else {
      x.type = "password";
      y.type = "password";
    }
};
